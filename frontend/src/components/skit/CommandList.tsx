import { useSkitStore } from '../../store/skitStore';
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
import { useMemo } from 'react';

export function CommandList() {
  const { 
    skits, 
    currentSkitId, 
    selectedCommandId, 
    selectCommand,
    moveCommand,
    addCommand,
    removeCommand,
    commandsYaml
  } = useSkitStore();

  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const commands = currentSkit?.commands || [];

  const commandDefinitions = useMemo(() => {
    if (!commandsYaml) return [];
    try {
      const parsed = parse(commandsYaml);
      return parsed?.commands || [];
    } catch (error) {
      console.error('Failed to parse commands.yaml:', error);
      return [];
    }
  }, [commandsYaml]);

  const handleAddCommand = (commandType: string, targetIndex: number, position: 'above' | 'below') => {
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
  };

  const { activeId, handleDragStart, handleDragEnd } = useDndSortable({
    items: commands,
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
    <ScrollArea className="h-full">
      <DropZone id="command-list" className="p-0 h-full">
        <SortableList
          items={commands}
          getItemId={(command) => command.id}
          onReorder={(fromIndex, toIndex) => moveCommand(fromIndex, toIndex)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {commands.map((command, index) => (
            <ContextMenu key={command.id}>
              <ContextMenuTrigger>
                <SortableItem id={command.id}>
                  <div
                    className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full
                      ${selectedCommandId === command.id
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-accent'
                      } ${activeId === command.id ? 'opacity-50' : ''}`}
                    onClick={() => selectCommand(command.id)}
                    data-testid={`command-item-${command.id}`}
                  >
                    {/* 行番号 */}
                    <div className="w-6 flex-shrink-0 mr-2 text-center">{index + 1}</div>
                    
                    {/* コマンド内容 - フォーマットが適用できるかどうかで表示を分岐 */}
                    {hasCommandFormat(command) ? (
                      // commandListLabelFormatが使われている場合はプレビューのみ表示
                      <div className="text-sm truncate flex-1">
                        {formatCommandPreview(command)}
                      </div>
                    ) : (
                      // フォーマットがない場合は従来通りタイプとプレビューを表示
                      <>
                        <div className="font-medium mr-2">{command.type}</div>
                        <div className="text-sm truncate">
                          {formatCommandPreview(command)}
                        </div>
                      </>
                    )}
                  </div>
                </SortableItem>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem onClick={() => removeCommand(command.id)}>
                  削除
                </ContextMenuItem>
                
                <ContextMenuSeparator />
                
                <ContextMenuSub>
                  <ContextMenuSubTrigger>上にコマンドを追加</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    {commandDefinitions.map((command: any) => (
                      <ContextMenuItem 
                        key={command.id}
                        onClick={() => handleAddCommand(command.id, index, 'above')}
                      >
                        {command.label}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
                
                <ContextMenuSub>
                  <ContextMenuSubTrigger>下にコマンドを追加</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    {commandDefinitions.map((command: any) => (
                      <ContextMenuItem 
                        key={command.id}
                        onClick={() => handleAddCommand(command.id, index, 'below')}
                      >
                        {command.label}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </SortableList>
      </DropZone>
    </ScrollArea>
  );
}

/**
 * コマンドに対応するコマンド定義に commandListLabelFormat が設定されているかチェック
 */
function hasCommandFormat(command: SkitCommand): boolean {
  const { type } = command;
  const commandsYaml = useSkitStore.getState().commandsYaml;
  
  if (!commandsYaml) {
    return false;
  }
  
  try {
    const parsed = parse(commandsYaml);
    const commandDef = parsed?.commands?.find((def: any) => def.id === type);
    return !!commandDef?.commandListLabelFormat;
  } catch (error) {
    return false;
  }
}

function formatCommandPreview(command: SkitCommand): string {
  const { type, id: _, ...props } = command;
  
  // コマンド定義を取得
  const commandsYaml = useSkitStore.getState().commandsYaml;
  if (!commandsYaml) {
    // フォールバック: 最初のプロパティ値を返す
    const firstPropValue = Object.values(props).find(val =>
      typeof val === 'string' && val !== type && val.length > 0
    );
    return firstPropValue as string || type;
  }
  
  try {
    const parsed = parse(commandsYaml);
    const commandDef = parsed?.commands?.find((def: any) => def.id === type);
    
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
  } catch (error) {
    console.error('Failed to format command preview:', error);
    // フォールバック: 最初のプロパティ値を返す
    const firstPropValue = Object.values(props).find(val =>
      typeof val === 'string' && val !== type && val.length > 0
    );
    return firstPropValue as string || type;
  }
}
