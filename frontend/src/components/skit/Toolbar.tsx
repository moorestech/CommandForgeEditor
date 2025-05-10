import React from 'react';
import { useSkitStore } from '../../store/skitStore';
import { Button } from '../ui/button';
import { 
  Plus, Copy, Trash, Undo, Redo, Save, 
  ChevronDown
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { CommandDefinition, PropertyDefinition } from '../../types';
import { parse } from 'yaml';
import { toast } from 'sonner';
import { DraggableCommand } from '../dnd/DraggableCommand';
import { DropZone } from '../dnd/DropZone';

export function Toolbar() {
  const { 
    currentSkitId, 
    selectedCommandId, 
    addCommand, 
    removeCommand, 
    duplicateCommand,
    undo,
    redo,
    saveSkit,
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
      const propDef = propDefAny as PropertyDefinition;
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
  };

  const handleSave = () => {
    saveSkit();
    toast.success('スキットを保存しました');
  };

  const isDisabled = !currentSkitId;
  const isCommandSelected = selectedCommandId !== null;

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              disabled={isDisabled}
            >
              <Plus className="h-4 w-4" />
              追加
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {commandDefinitions.map((command: any) => (
              <DropdownMenuItem 
                key={command.id}
                onClick={() => handleAddCommand(command.id)}
              >
                <DraggableCommand id={command.id}>
                  <div className="flex items-center w-full">
                    {command.label}
                  </div>
                </DraggableCommand>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropZone id="copy-zone" className="inline-flex">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!isCommandSelected}
            onClick={() => selectedCommandId && duplicateCommand(selectedCommandId)}
          >
            <Copy className="h-4 w-4 mr-1" />
            複製
          </Button>
        </DropZone>

        <DropZone id="trash-zone" className="inline-flex">
          <Button 
            variant="outline" 
            size="sm"
            disabled={!isCommandSelected}
            onClick={() => selectedCommandId && removeCommand(selectedCommandId)}
          >
            <Trash className="h-4 w-4 mr-1" />
            削除
          </Button>
        </DropZone>
      </div>

      <div className="flex-1" />

      <Button 
        variant="ghost" 
        size="sm"
        disabled={isDisabled}
        onClick={undo}
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button 
        variant="ghost" 
        size="sm"
        disabled={isDisabled}
        onClick={redo}
      >
        <Redo className="h-4 w-4" />
      </Button>

      <Button 
        variant="default" 
        size="sm"
        disabled={isDisabled}
        onClick={handleSave}
      >
        <Save className="h-4 w-4 mr-1" />
        保存
      </Button>
    </div>
  );
}
