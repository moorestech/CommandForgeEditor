import { useSkitStore, getGroupCommandIndices, getTopLevelGroups } from '../../store/skitStore';
import { ScrollArea } from '../ui/scroll-area';
import { useDndSortable } from '../../hooks/useDndSortable';
import { SortableList } from '../dnd/SortableList';
import { SortableItem } from '../dnd/SortableItem';
import { DropZone } from '../dnd/DropZone';
import { SkitCommand } from '../../types';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { parse } from 'yaml';
import { useMemo, useCallback, memo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

/**
 * CommandList コンポーネント - パフォーマンス最適化済み
 *
 * 実装された最適化:
 * 1. コンポーネントのメモ化（CommandList、CommandItem、CommandContextMenu）で不要な再レンダリングを防止
 * 2. ハンドラー関数をuseCallbackでメモ化し、レンダリング時の再生成を防止
 * 3. 計算量の多い処理（ネスト構造計算、表示/非表示判定など）をuseMemoでキャッシュ
 * 4. コマンド定義の高速参照のためのMap構造（commandsMap）を導入
 * 5. 効率的なドラッグ＆ドロップ処理のためのインデックスマッピング
 * 6. 表示対象のコマンドのみをレンダリング（非表示コマンドはDOMに含めない）
 */
export const CommandList = memo(function CommandList() {
  const { 
    skits, 
    currentSkitId, 
    selectedCommandIds, 
    selectCommand,
    moveCommand,
    moveCommands,
    addCommand,
    removeCommand,
    commandsYaml,
    createGroup,
    ungroupCommands,
    toggleGroupCollapse
  } = useSkitStore();

  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const commands = currentSkit?.commands || [];
  
  // 計算処理をuseCallbackでメモ化して毎回再生成されないようにする
  const calculateNestLevels = useCallback((commands: SkitCommand[]): Map<number, number> => {
    const nestLevels = new Map<number, number>();
    let currentLevel = 0;
    const groupStack: number[] = [];
    
    commands.forEach((cmd) => {
      nestLevels.set(cmd.id, currentLevel);
      
      if (cmd.type === 'group_start') {
        groupStack.push(cmd.id);
        currentLevel++;
      } else if (cmd.type === 'group_end') {
        if (groupStack.length > 0) {
          groupStack.pop();
          currentLevel = Math.max(0, currentLevel - 1);
        }
      }
    });
    
    return nestLevels;
  }, []);
  
  const shouldHideCommand = useCallback((commandId: number): boolean => {
    const commandIndex = commands.findIndex(cmd => cmd.id === commandId);
    if (commandIndex === -1) return false;
    
    let nestLevel = 0;
    
    // コラップス状態のグループを検索する際に、
    // 各コマンドの親グループをキャッシュしておくとさらに最適化可能
    for (let i = commandIndex - 1; i >= 0; i--) {
      const cmd = commands[i];
      if (cmd.type === 'group_end') {
        nestLevel++;
      } else if (cmd.type === 'group_start') {
        nestLevel--;
        if (nestLevel < 0 && cmd.isCollapsed) {
          return true;
        }
        if (nestLevel < 0) {
          nestLevel = 0;
        }
      }
    }
    
    return false;
  }, [commands]);
  
  const handleCommandClick = useCallback((commandId: number, event: React.MouseEvent) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey; // metaKeyはMac用
    const isShiftPressed = event.shiftKey;
    
    selectCommand(commandId, isCtrlPressed, isShiftPressed);
  }, [selectCommand]);

  // commandsYamlをパースした結果をメモ化
  const parsedCommands = useMemo(() => {
    if (!commandsYaml) return { commandDefinitions: [], commandsMap: new Map() };
    try {
      const parsed = parse(commandsYaml);
      const definitions = parsed?.commands || [];
      
      // コマンド定義をIDでマップ化して高速アクセスできるようにする
      const commandsMap = new Map();
      definitions.forEach((def: any) => {
        commandsMap.set(def.id, def);
      });
      
      return { commandDefinitions: definitions, commandsMap };
    } catch (error) {
      console.error('Failed to parse commands.yaml:', error);
      return { commandDefinitions: [], commandsMap: new Map() };
    }
  }, [commandsYaml]);
  
  const { commandDefinitions, commandsMap } = parsedCommands;

  const handleAddCommand = useCallback((commandType: string, targetIndex: number, position: 'above' | 'below') => {
    const commandDef = commandDefinitions.find((def: any) => def.id === commandType);
    if (!commandDef) return;

    const newCommand: any = { type: commandType };
    
    Object.entries(commandDef.properties).forEach(([propName, propDefAny]) => {
      const propDef = propDefAny as any;
      if (propDef.default !== undefined) {
        newCommand[propName] = propDef.default;
      } else if (propDef.required) {
        switch (propDef.type) {
          case 'string':
            newCommand[propName] = '';
            break;
          case 'number':
            newCommand[propName] = 0;
            break;
          case 'boolean':
            newCommand[propName] = false;
            break;
          case 'enum':
            newCommand[propName] = propDef.options?.[0] || '';
            break;
          case 'asset':
            newCommand[propName] = '';
            break;
        }
      }
    });

    addCommand(newCommand);
    
    const newCommandIndex = commands.length;
    
    const newPosition = position === 'above' ? targetIndex : targetIndex + 1;
    moveCommand(newCommandIndex, newPosition);
  }, [commandDefinitions, addCommand, moveCommand, commands]);

  // ネストレベルと表示非表示の計算をメモ化
  const { nestLevels, visibleCommands, commandToIndexMap } = useMemo(() => {
    const nestLevels = calculateNestLevels(commands);
    const visibleCommands = commands.filter(cmd => !shouldHideCommand(cmd.id));
    
    // オリジナルインデックスへの高速マッピング（ドラッグ＆ドロップ処理の最適化）
    const commandToIndexMap = new Map<number, number>();
    commands.forEach((cmd, index) => {
      commandToIndexMap.set(cmd.id, index);
    });
    
    return { nestLevels, visibleCommands, commandToIndexMap };
  }, [commands, calculateNestLevels, shouldHideCommand]);
  
  // ドラッグ&ドロップのハンドラーもvisibleCommandsを参照するように調整
  const { activeId, handleDragStart, handleDragEnd } = useDndSortable({
    items: visibleCommands,
    onReorder: () => {}, // Handled by SortableList
    getItemId: (command) => command.id
  });

  if (!currentSkit) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        スキットが選択されていません
      </div>
    );
  }

  return (
    <ScrollArea className="h-full relative">
      <DropZone id="command-list" className="p-0 h-full">
        <div className="command-list-container">
          <SortableList
            items={visibleCommands}
            getItemId={(command) => command.id}
            onReorder={(fromIndex, toIndex) => {
              // 表示用インデックスから元のコマンド配列のインデックスへ変換
              const cmd1 = visibleCommands[fromIndex];
              const cmd2 = visibleCommands[toIndex];
              const originalFromIndex = commandToIndexMap.get(cmd1.id) || fromIndex;
              const originalToIndex = commandToIndexMap.get(cmd2.id) || toIndex;
              
              const currentSkit = skits[currentSkitId || ''];
              if (!currentSkit) return;
              const commands = currentSkit.commands;
              
              // ドラッグされたコマンド (cmd1) が group_start かどうかをまず確認
              if (cmd1.type === 'group_start') {
                // ドラッグされたのがグループ開始コマンドなら、選択状態に関わらずグループ全体を移動
                const groupIndices = getGroupCommandIndices(commands, originalFromIndex);
                moveCommands(groupIndices, originalToIndex);
              } else if (selectedCommandIds.includes(cmd1.id) && selectedCommandIds.length > 1) {
                // ドラッグされたコマンドが選択されており、かつ複数選択されている場合
                // (ただし、group_start のケースは上で処理済みなので、ここは通常の複数コマンド移動)
                const selectedIndices = selectedCommandIds
                  .map(id => commands.findIndex(cmd => cmd.id === id))
                  .filter(index => index !== -1);
                
                // 選択範囲にトップレベルのグループが含まれているかチェック
                // (このロジックはグループ内のアイテムを個別に選択して移動する場合に影響する可能性があるため注意)
                const topLevelGroupsInSelection = getTopLevelGroups(commands, selectedIndices);

                if (topLevelGroupsInSelection.length > 0 && topLevelGroupsInSelection.includes(originalFromIndex)) {
                  // 選択範囲内にドラッグ開始点が含まれるトップレベルグループがある場合、そのグループを移動
                  // (この分岐は複雑なので、もし意図しない挙動があれば見直しが必要)
                  const groupIndexToMove = topLevelGroupsInSelection.find(gi => {
                    const groupCmds = getGroupCommandIndices(commands, gi);
                    return groupCmds.includes(originalFromIndex);
                  }) ?? topLevelGroupsInSelection[0]; // フォールバック

                  const groupIndices = getGroupCommandIndices(commands, groupIndexToMove);
                  moveCommands(groupIndices, originalToIndex);
                } else {
                  // 通常の複数選択アイテム移動 (グループは含まないか、ネストされたグループの一部)
                  moveCommands(selectedIndices, originalToIndex);
                }
              } else {
                // ドラッグされたコマンドが group_start ではなく、
                // かつ単一選択であるか、または選択されていない場合 (dnd-kitが選択外アイテムのドラッグを許可する場合)
                // この場合は単一コマンドとして移動　
                moveCommand(originalFromIndex, originalToIndex);
              }
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
          {visibleCommands.map((command, index) => {

            return (
              <ContextMenu key={command.id}>
               <ContextMenuTrigger>
                 <SortableItem id={command.id}>
                   <CommandItem
                     command={command}
                     index={index}
                     isSelected={selectedCommandIds.includes(command.id)}
                     isActive={activeId === command.id}
                     nestLevel={nestLevels.get(command.id) || 0}
                     handleCommandClick={handleCommandClick}
                     toggleGroupCollapse={toggleGroupCollapse}
                     commandsMap={commandsMap}
                   />
                  </SortableItem>
                </ContextMenuTrigger>
                <CommandContextMenu
                  command={command}
                  index={index}
                  commandDefinitions={commandDefinitions}
                  selectedCommandIds={selectedCommandIds}
                  removeCommand={removeCommand}
                  ungroupCommands={ungroupCommands}
                  createGroup={createGroup}
                  handleAddCommand={handleAddCommand}
                />
              </ContextMenu>
            );
          })}
          </SortableList>
        </div>
      </DropZone>
    </ScrollArea>
  );
});

// メモ化コンポーネント
const CommandItem = memo(({
  command,
  index,
  isSelected,
  isActive,
  nestLevel,
  handleCommandClick,
  toggleGroupCollapse,
  commandsMap
}: {
  command: SkitCommand;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  nestLevel: number;
  handleCommandClick: (id: number, event: React.MouseEvent) => void;
  toggleGroupCollapse: (id: number) => void;
  commandsMap: Map<string, any>;
}) => {
  const isGroupStart = command.type === 'group_start';
  const isCollapsed = isGroupStart && command.isCollapsed;

  // コマンドプレビューをメモ化
  const commandPreview = useMemo(() => {
    return formatCommandPreview(command, commandsMap);
  }, [command, commandsMap]);
  
  // コマンドにフォーマットがあるかチェック
  const hasFormat = useMemo(() => {
    return hasCommandFormat(command, commandsMap);
  }, [command, commandsMap]);

  return (
    <div
      className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full
        ${isSelected
          ? 'bg-blue-500 text-white'
          : 'hover:bg-accent'
        } ${isActive ? 'opacity-50' : ''}`}
      onClick={(e) => handleCommandClick(command.id, e)}
      data-testid={`command-item-${command.id}`}
      style={{ paddingLeft: `${(nestLevel * 28) + 8}px` }}
    >
      {/* グループ開始コマンドの場合は折りたたみアイコンを表示 */}
      {isGroupStart && (
        <button
          className="mr-1 p-1 hover:bg-gray-200 rounded"
          onClick={(e) => {
            e.stopPropagation();
            toggleGroupCollapse(command.id);
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
      )}
      
      {/* 行番号 */}
      <div className="w-6 flex-shrink-0 mr-2 text-center">{index + 1}</div>
      
      {isGroupStart ? (
        // グループの場合はグループ名を表示
        <div className="font-medium font-bold">
          {command.groupName}
        </div>
      ) : hasFormat ? (
        // commandListLabelFormat が適用できる場合はプレビューのみ表示
        <div className="truncate flex-1">
          {commandPreview}
        </div>
      ) : (
        // フォーマットがない場合は従来通りタイプとプレビューを表示
        <>
          <div className="font-medium mr-2">
            {command.type}
          </div>
          <div className="text-sm truncate">
            {commandPreview}
          </div>
        </>
      )}
    </div>
  );
});

/**
 * コマンドに対応するコマンド定義に commandListLabelFormat が設定されているかチェック
 */
function hasCommandFormat(command: SkitCommand, commandsMap: Map<string, any>): boolean {
  const { type } = command;
  
  if (!commandsMap) {
    return false;
  }
  
  const commandDef = commandsMap.get(type);
  return !!commandDef?.commandListLabelFormat;
}

// コンテキストメニューをメモ化コンポーネントとして分離
const CommandContextMenu = memo(({
  command,
  index,
  commandDefinitions,
  selectedCommandIds,
  removeCommand,
  ungroupCommands,
  createGroup,
  handleAddCommand
}: {
  command: SkitCommand;
  index: number;
  commandDefinitions: any[];
  selectedCommandIds: number[];
  removeCommand: (id: number) => void;
  ungroupCommands: (id: number) => void;
  createGroup: () => void;
  handleAddCommand: (commandType: string, targetIndex: number, position: 'above' | 'below') => void;
}) => {
  const isGroupStart = command.type === 'group_start';
  
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => removeCommand(command.id)}>
        削除
      </ContextMenuItem>
      
      {/* グループ開始コマンドの場合はグループ解除オプションを表示 */}
      {isGroupStart && (
        <ContextMenuItem onClick={() => ungroupCommands(command.id)}>
          グループ解除
        </ContextMenuItem>
      )}
      
      {/* 複数選択時はグループ化オプションを表示 */}
      {selectedCommandIds.length > 1 && selectedCommandIds.includes(command.id) && (
        <ContextMenuItem onClick={() => createGroup()}>
          グループ化
        </ContextMenuItem>
      )}
      
      <ContextMenuSeparator />
      
      <ContextMenuSub>
        <ContextMenuSubTrigger>上にコマンドを追加</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {commandDefinitions.map((cmdDef: any) => (
            <ContextMenuItem
              key={cmdDef.id}
              onClick={() => handleAddCommand(cmdDef.id, index, 'above')}
            >
              {cmdDef.label}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger>下にコマンドを追加</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {commandDefinitions.map((cmdDef: any) => (
            <ContextMenuItem
              key={cmdDef.id}
              onClick={() => handleAddCommand(cmdDef.id, index, 'below')}
            >
              {cmdDef.label}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  );
});

function formatCommandPreview(command: SkitCommand, commandsMap: Map<string, any>): string {
  const { type, id: _, ...props } = command;
  
  if (!commandsMap) {
    // フォールバック: 最初のプロパティ値を返す
    const firstPropValue = Object.values(props).find(val =>
      typeof val === 'string' && val !== type && val.length > 0
    );
    return firstPropValue as string || type;
  }
  
  const commandDef = commandsMap.get(type);
  
  if (!commandDef || !commandDef.commandListLabelFormat) {
    // フォールバック: 最初のプロパティ値を返す
    const firstPropValue = Object.values(props).find(val =>
      typeof val === 'string' && val !== type && val.length > 0
    );
    return firstPropValue as string || type;
  }
  
  // commandListLabelFormatを使用してフォーマット
  let formatted = commandDef.commandListLabelFormat;
  Object.entries(props).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    if (formatted.includes(placeholder)) {
      formatted = formatted.replace(placeholder, String(value));
    }
  });
  
  return formatted;
}
