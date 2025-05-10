import React, { useEffect, useRef } from 'react';
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
  const aboveMenuRef = useRef<HTMLDivElement>(null);
  const belowMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showAddAbove && !showAddBelow) return;

      const isOutsideAboveMenu = !aboveMenuRef.current || !aboveMenuRef.current.contains(event.target as Node);
      const isOutsideBelowMenu = !belowMenuRef.current || !belowMenuRef.current.contains(event.target as Node);
      
      if (isOutsideAboveMenu && isOutsideBelowMenu) {
        setShowAddAbove(false);
        setShowAddBelow(false);
      }
    };

    if (showAddAbove || showAddBelow) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddAbove, showAddBelow]);

  const skits = useSkitStore(state => state.skits);
  useEffect(() => {
    setShowAddAbove(false);
    setShowAddBelow(false);
  }, [skits]);

  const handleAddCommand = (commandType: string, position: 'above' | 'below') => {
    setShowAddAbove(false);
    setShowAddBelow(false);
    
    setTimeout(() => {
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
    }, 10);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const CommandList = ({ position }: { position: 'above' | 'below' }) => {
    return (
      <div 
        ref={position === 'above' ? aboveMenuRef : belowMenuRef}
        className="fixed z-50 bg-white border border-zinc-200 rounded-md shadow-md p-2 w-64 max-h-[300px] overflow-y-auto"
        style={{
          left: `${menuPosition.x}px`,
          top: `${menuPosition.y}px`,
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the context menu
      >
        {commandDefinitions.map((command: any) => (
          <div 
            key={command.id}
            className="flex items-center w-full p-2 hover:bg-zinc-100 cursor-pointer rounded-sm text-sm"
            onMouseDown={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              e.preventDefault(); // Prevent default behavior
              handleAddCommand(command.id, position);
            }}
          >
            <DraggableCommand id={command.id}>
              <div className="flex items-center w-full whitespace-nowrap overflow-hidden text-ellipsis">
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
      <ContextMenu onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => {
            setShowAddAbove(false);
            setShowAddBelow(false);
          }, 50);
        }
      }}>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {commandId !== null && (
            <ContextMenuItem onSelect={() => removeCommand(commandId)}>
              削除
            </ContextMenuItem>
          )}
          <ContextMenuItem onSelect={() => {
            setShowAddBelow(false); // Close the other menu
            
            setTimeout(() => {
              setShowAddAbove(true);
            }, 10);
          }}>
            上にコマンドを追加
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => {
            setShowAddAbove(false); // Close the other menu
            
            setTimeout(() => {
              setShowAddBelow(true);
            }, 10);
          }}>
            下にコマンドを追加
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {showAddAbove && <CommandList position="above" />}
      {showAddBelow && <CommandList position="below" />}
    </div>
  );
}
