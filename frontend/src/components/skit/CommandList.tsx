import { useSkitStore, getGroupCommandIndices, getTopLevelGroups } from '../../store/skitStore';
import { formatCommandPreview, hasCommandFormat } from '../../utils/commandFormatting';
import { ScrollArea } from '../ui/scroll-area';
import { useDndSortable } from '../../hooks/useDndSortable';
import { SortableList } from '../dnd/SortableList';
import { SortableItem } from '../dnd/SortableItem';
import { DropZone } from '../dnd/DropZone';
import { SkitCommand, CommandDefinition, PropertyDefinition } from '../../types';
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
  const store = useSkitStore();
  const {
    skits,
    currentSkitId,
    selectedCommandIds,
    selectCommand,
    moveCommand,
    moveCommands,
    addCommand,
    removeCommand,
    removeCommands,
    commandDefinitions: storeCommandDefinitions,
    commandsMap: storeCommandsMap,
    createGroup,
    ungroupCommands,
    toggleGroupCollapse,
  } = store;

  const legacySelectedCommandId = (store as { selectedCommandId?: number }).selectedCommandId;
  const selectedIds = selectedCommandIds ?? (legacySelectedCommandId != null ? [legacySelectedCommandId] : []);
  const commandDefinitions = storeCommandDefinitions ?? [];
  const commandsMap = storeCommandsMap ?? new Map<string, CommandDefinition>();

  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  
  // コマンドリストをuseMemoでメモ化して依存関係の問題を解決
  const commands = useMemo(() => {
    return currentSkit?.commands || [];
  }, [currentSkit]);
  
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

  // commandDefinitions と commandsMap はstoreから直接取得するようになったため、パース処理は不要

  const handleAddCommand = useCallback((commandType: string, targetIndex: number, position: 'above' | 'below') => {
    const commandDef = commandDefinitions.find((def: CommandDefinition) => def.id === commandType);
    if (!commandDef) return;

    const newCommand: Partial<SkitCommand> = {
      id: 0, // 実際のIDはaddCommand内で割り当てられる
      type: commandType,
      backgroundColor: commandDef.defaultBackgroundColor || "#ffffff"
    };
    
    Object.entries(commandDef.properties).forEach(([propName, def]) => {
      const propDef = def as PropertyDefinition;
      if (propDef.default !== undefined) {
        newCommand[propName] = propDef.default;
      } else if (propDef.type === 'vector2' || propDef.type === 'vector2Int') {
        newCommand[propName] = [0, 0];
      } else if (propDef.type === 'vector3' || propDef.type === 'vector3Int') {
        newCommand[propName] = [0, 0, 0];
      } else if (propDef.type === 'vector4') {
        newCommand[propName] = [0, 0, 0, 0];
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
              } else if (selectedIds.includes(cmd1.id) && selectedIds.length > 1) {
                // ドラッグされたコマンドが選択されており、かつ複数選択されている場合
                // (ただし、group_start のケースは上で処理済みなので、ここは通常の複数コマンド移動)
                const selectedIndices = selectedIds
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
                     isSelected={selectedIds.includes(command.id)}
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
                  selectedCommandIds={selectedIds}
                  removeCommand={removeCommand}
                  removeCommands={removeCommands}
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
  commandsMap: Map<string, CommandDefinition>;
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

  const nestLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < nestLevel; i++) {
      if (command.type === 'group_end' && i === nestLevel - 1) {
        continue;
      }
      
      lines.push(
        <div 
          key={`nest-line-${i}`}
          className="absolute h-full w-[2px] bg-zinc-300 dark:bg-zinc-700"
          style={{ left: `${i * 28 + 16}px` }}
        />
      );
    }
    
    if (command.type === 'group_end' && nestLevel > 0) {
      lines.push(
        <div 
          key="l-shaped-line"
          className="absolute w-[16px] h-[2px] bg-zinc-300 dark:bg-zinc-700"
          style={{ 
            left: `${(nestLevel - 1) * 28 + 16}px`, 
            top: '50%'
          }}
        />
      );
      
      lines.push(
        <div 
          key="l-vertical-top"
          className="absolute w-[2px] bg-zinc-300 dark:bg-zinc-700"
          style={{ 
            left: `${(nestLevel - 1) * 28 + 16}px`,
            top: 0,
            height: '50%'
          }}
        />
      );
    }
    
    return lines;
  }, [nestLevel, command.type]);

  // Get command definition to check for defaultBackgroundColor
  const commandDef = commandsMap?.get(command.type);
  const defaultBgColor = commandDef?.defaultBackgroundColor || "#ffffff";
  
  const bgColor = command.backgroundColor || defaultBgColor;
  
  const backgroundColorStyle = {
    paddingLeft: `${(nestLevel * 28) + 8}px`,
    ...(isSelected ? {} : { backgroundColor: bgColor })
  };
    
  const getTextColor = (bgColor: string) => {
    if (!bgColor || bgColor === '') return '';
    
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    return brightness < 128 ? 'text-white' : 'text-black';
  };
  
  const textColorClass = getTextColor(bgColor);

  return (
    <div
      className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full relative select-none
        ${isSelected
          ? 'bg-blue-500 text-white'
          : textColorClass || 'hover:bg-accent'
        } ${isActive ? 'opacity-50' : ''}`}
      onClick={(e) => handleCommandClick(command.id, e)}
      data-testid={`command-item-${command.id}`}
      style={backgroundColorStyle}
    >
      {/* ネストレベルを示す垂直ライン */}
      {nestLines}
      
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
      <div className="w-6 flex-shrink-0 mr-2 text-center command-index">{index + 1}</div>
      
      {isGroupStart ? (
        // グループの場合はフォーマットされたラベルまたはグループ名を表示
        <div className="font-medium font-bold">
          {(hasFormat ? commandPreview : command.groupName)}
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

// コンテキストメニューをメモ化コンポーネントとして分離
const CommandContextMenu = memo(({ 
  command,
  index,
  commandDefinitions,
  selectedCommandIds = [],
  removeCommand,
  removeCommands,
  ungroupCommands,
  createGroup,
  handleAddCommand
}: {
  command: SkitCommand;
  index: number;
  commandDefinitions: CommandDefinition[];
  selectedCommandIds?: number[];
  removeCommand: (id: number) => void;
  removeCommands: (ids: number[]) => void;
  ungroupCommands: (id: number) => void;
  createGroup: () => void;
  handleAddCommand: (commandType: string, targetIndex: number, position: 'above' | 'below') => void;
}) => {
  const isGroupStart = command.type === 'group_start';
  
  return (
    <ContextMenuContent>
      <ContextMenuItem
        onClick={() =>
          selectedCommandIds.length > 1
            ? removeCommands(selectedCommandIds)
            : removeCommand(command.id)
        }
      >
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
          {commandDefinitions.map((cmdDef: CommandDefinition) => (
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
          {commandDefinitions.map((cmdDef: CommandDefinition) => (
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
