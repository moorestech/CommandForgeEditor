import React from 'react';
import { CommandDefinition } from '../../types';
import { parse } from 'yaml';
import { useSkitStore } from '../../store/skitStore';
import { DraggableCommand } from '../dnd/DraggableCommand';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';

interface CommandListMenuProps {
  children: React.ReactNode;
  commandId: number | null;
  index: number;
}

export function CommandListMenu({ children, commandId, index }: CommandListMenuProps) {
  const { 
    removeCommand, 
    addCommand, 
    moveCommand,
    commandsYaml
  } = useSkitStore();

  const [showAddAbove, setShowAddAbove] = React.useState(false);
  const [showAddBelow, setShowAddBelow] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });

  const commandDefinitions = React.useMemo(() => {
    if (!commandsYaml) return [];
    try {
      const parsed = parse(commandsYaml);
      return parsed?.commands || [];
    } catch (error) {
      console.error('Failed to parse commands.yaml:', error);
      return [];
    }
  }, [commandsYaml]);

  const handleAddCommand = (commandType: string, position: 'above' | 'below') => {
    const commandDef = commandDefinitions.find((def: any) => def.id === commandType) as CommandDefinition;
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

    const { skits, currentSkitId } = useSkitStore.getState();
    if (!currentSkitId) return;
    
    const currentSkit = skits[currentSkitId];
    if (!currentSkit) return;
    
    const commandsLength = currentSkit.commands.length;
    
    if (position === 'above') {
      moveCommand(commandsLength - 1, index);
    } else {
      moveCommand(commandsLength - 1, index + 1);
    }

    setShowAddAbove(false);
    setShowAddBelow(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const CommandList = ({ position }: { position: 'above' | 'below' }) => {
    const style = {
      position: 'fixed' as const,
      left: `${menuPosition.x}px`,
      top: `${menuPosition.y}px`,
      zIndex: 1000,
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '0.5rem',
      maxHeight: '300px',
      overflowY: 'auto' as const,
    };

    return (
      <div 
        style={style}
        className="command-list-popup"
      >
        {commandDefinitions.map((command: any) => (
          <div 
            key={command.id}
            className="flex items-center w-full p-2 hover:bg-gray-100 cursor-pointer rounded-sm"
            onClick={() => handleAddCommand(command.id, position)}
          >
            <DraggableCommand id={command.id}>
              <div className="flex items-center w-full">
                {command.label}
              </div>
            </DraggableCommand>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div onContextMenu={handleContextMenu}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {commandId !== null && (
            <ContextMenuItem onClick={() => removeCommand(commandId)}>
              削除
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => setShowAddAbove(true)}>
            上にコマンドを追加
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowAddBelow(true)}>
            下にコマンドを追加
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {showAddAbove && <CommandList position="above" />}
      {showAddBelow && <CommandList position="below" />}
    </div>
  );
}
