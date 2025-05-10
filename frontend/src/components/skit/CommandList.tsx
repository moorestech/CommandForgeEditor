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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { parse } from 'yaml';
import { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';

export function CommandList() {
  const { 
    skits, 
    currentSkitId, 
    selectedCommandIds, 
    selectCommand,
    moveCommand,
    addCommand,
    removeCommand,
    createGroup,
    ungroupCommands,
    toggleGroupCollapse,
    renameGroup,
    commandsYaml
  } = useSkitStore();
  
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);

  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const commands = currentSkit?.commands || [];

  const handleCommandClick = (commandId: number, event: React.MouseEvent) => {
    const isCtrlPressed = event.ctrlKey || event.metaKey; // metaKey for Mac
    const isShiftPressed = event.shiftKey;
    
    selectCommand(commandId, isCtrlPressed, isShiftPressed);
  };
  
  const handleGroupNameEdit = (groupId: number) => {
    setEditingGroupId(groupId);
  };
  
  const handleGroupNameSave = (groupId: number, newName: string) => {
    renameGroup(groupId, newName);
    setEditingGroupId(null);
  };
  
  const handleGroupNameKeyDown = (e: React.KeyboardEvent, groupId: number, newName: string) => {
    if (e.key === 'Enter') {
      handleGroupNameSave(groupId, newName);
    } else if (e.key === 'Escape') {
      setEditingGroupId(null);
    }
  };

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

  const renderCommandItem = (command: SkitCommand, index: number, isInGroup: boolean = false) => {
    if (command.parentId) {
      const parentCommand = commands.find(cmd => cmd.id === command.parentId);
      if (parentCommand?.isCollapsed) {
        return null;
      }
    }
    
    if (command.isGroup) {
      return (
        <Collapsible key={command.id} defaultOpen={!command.isCollapsed}>
          <ContextMenu>
            <ContextMenuTrigger>
              <SortableItem id={command.id}>
                <div 
                  className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full
                    ${selectedCommandIds.includes(command.id)
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-accent'
                    } ${activeId === command.id ? 'opacity-50' : ''}`}
                  onClick={(e) => handleCommandClick(command.id, e)}
                  data-testid={`command-item-${command.id}`}
                >
                  {/* Group header with toggle and name */}
                  <div className={`flex items-center w-full ${isInGroup ? 'pl-4' : ''}`}>
                    <CollapsibleTrigger asChild onClick={(e) => {
                      e.stopPropagation();
                      toggleGroupCollapse(command.id);
                    }}>
                      <button className="mr-1 p-1 hover:bg-gray-200 rounded">
                        {command.isCollapsed ? 
                          <ChevronRight className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />
                        }
                      </button>
                    </CollapsibleTrigger>
                    
                    <div className="w-6 flex-shrink-0 mr-2 text-center">{index + 1}</div>
                    
                    <div className="mr-2">
                      {command.isCollapsed ? 
                        <FolderOpen className="h-4 w-4" /> : 
                        <Folder className="h-4 w-4" />
                      }
                    </div>
                    
                    {editingGroupId === command.id ? (
                      <input
                        type="text"
                        className="flex-1 px-1 bg-transparent border-b border-gray-400 focus:outline-none"
                        defaultValue={command.groupName}
                        autoFocus
                        onBlur={(e) => handleGroupNameSave(command.id, e.target.value)}
                        onKeyDown={(e) => handleGroupNameKeyDown(e, command.id, e.currentTarget.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div 
                        className="flex-1 font-medium truncate"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleGroupNameEdit(command.id);
                        }}
                      >
                        {command.groupName || '新しいグループ'}
                      </div>
                    )}
                  </div>
                </div>
              </SortableItem>
            </ContextMenuTrigger>
            
            <ContextMenuContent>
              <ContextMenuItem onClick={() => removeCommand(command.id)}>
                削除
              </ContextMenuItem>
              
              <ContextMenuItem onClick={() => handleGroupNameEdit(command.id)}>
                名前の変更
              </ContextMenuItem>
              
              <ContextMenuItem onClick={() => ungroupCommands(command.id)}>
                グループ解除
              </ContextMenuItem>
              
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
          </ContextMenu>
          
          <CollapsibleContent>
            {/* Render child commands */}
            {commands
              .filter(cmd => cmd.parentId === command.id)
              .map((childCmd, childIdx) => renderCommandItem(childCmd, childIdx, true))}
          </CollapsibleContent>
        </Collapsible>
      );
    }
    
    return (
      <ContextMenu key={command.id}>
        <ContextMenuTrigger>
          <SortableItem id={command.id}>
            <div
              className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full
                ${selectedCommandIds.includes(command.id)
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-accent'
                } ${activeId === command.id ? 'opacity-50' : ''}`}
              onClick={(e) => handleCommandClick(command.id, e)}
              data-testid={`command-item-${command.id}`}
            >
              <div className={`flex items-center w-full ${isInGroup ? 'pl-8' : ''}`}>
                {/* 行番号 */}
                <div className="w-6 flex-shrink-0 mr-2 text-center">{index + 1}</div>
                {/* コマンドタイプ */}
                <div className="font-medium mr-2">{command.type}</div>
                {/* コマンド内容プレビュー */}
                <div className="text-sm truncate">
                  {formatCommandPreview(command)}
                </div>
              </div>
            </div>
          </SortableItem>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem onClick={() => removeCommand(command.id)}>
            削除
          </ContextMenuItem>
          
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
      </ContextMenu>
    );
  };

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
          {/* Render top-level commands (those without a parent) */}
          {commands
            .filter(command => !command.parentId)
            .map((command, index) => renderCommandItem(command, index))}
        </SortableList>
      </DropZone>
    </ScrollArea>
  );
}

function formatCommandPreview(command: SkitCommand): string {
  const { type, id: _, ...props } = command;
  
  const firstPropValue = Object.values(props).find(val => 
    typeof val === 'string' && val !== type && val.length > 0
  );
  
  return firstPropValue as string || type;
}
