import React from 'react';
import { CommandDefinition } from '../../types';
import { parse } from 'yaml';
import { useSkitStore } from '../../store/skitStore';
import { DraggableCommand } from '../dnd/DraggableCommand';
import { toast } from 'sonner';

interface CommandPickerMenuProps {
  onClose?: () => void;
  position?: { x: number, y: number };
}

export function CommandPickerMenu({ onClose, position }: CommandPickerMenuProps) {
  const { 
    addCommand,
    commandsYaml
  } = useSkitStore();

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

  const handleAddCommand = (commandType: string) => {
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
    toast.success(`${commandDef.label}を追加しました`);
    
    if (onClose) {
      onClose();
    }
  };

  const style = position ? {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1000,
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '0.375rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    padding: '0.5rem',
    maxHeight: '300px',
    overflowY: 'auto' as const,
  } : {};

  return (
    <div 
      style={style}
      className={`command-picker-menu ${!position ? 'w-full' : ''}`}
    >
      {commandDefinitions.map((command: any) => (
        <div 
          key={command.id}
          className="flex items-center w-full p-2 hover:bg-gray-100 cursor-pointer rounded-sm"
          onClick={() => handleAddCommand(command.id)}
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
}
