import { useEffect, useState, useMemo } from 'react';
import { useSkitStore } from '../../store/skitStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CommandDefinition, PropertyDefinition } from '../../types';
import { parse } from 'yaml';
import { isReservedCommand, getReservedCommandDefinition } from '../../utils/reservedCommands';
import { formatCommandPreview } from '../../utils/commandFormatting';
import { ColorPicker } from '../ui/color-picker';

export function CommandEditor() {
  const { 
    skits, 
    currentSkitId, 
    selectedCommandIds, 
    updateCommand,
    commandsYaml
  } = useSkitStore();
  
  const [commandDefinitions, setCommandDefinitions] = useState<CommandDefinition[]>([]);
  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const selectedCommandId = selectedCommandIds.length > 0 ? selectedCommandIds[0] : null;
  const selectedCommand = currentSkit?.commands.find(cmd => cmd.id === selectedCommandId);
  const commands = currentSkit?.commands || [];
  
  const commandsMap = useMemo(() => {
    if (!commandsYaml) return new Map();
    try {
      const parsed = parse(commandsYaml);
      const definitions = parsed?.commands || [];
      
      const map = new Map<string, any>();
      definitions.forEach((def: any) => {
        map.set(def.id, def);
      });
      
      return map;
    } catch (error) {
      console.error('Failed to parse commands.yaml:', error);
      return new Map<string, any>();
    }
  }, [commandsYaml]);
  
  useEffect(() => {
    if (commandsYaml) {
      try {
        const parsed = parse(commandsYaml);
        if (parsed && parsed.commands) {
          setCommandDefinitions(parsed.commands);
        }
      } catch (error) {
        console.error('Failed to parse commands.yaml:', error);
      }
    }
  }, [commandsYaml]);
  

  
  if (!selectedCommand) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンドが選択されていません
      </div>
    );
  }
  
  let commandDef = commandDefinitions.find(def => def.id === selectedCommand.type);
  
  if (!commandDef && isReservedCommand(selectedCommand.type)) {
    commandDef = getReservedCommandDefinition(selectedCommand.type);
  }
  
  if (!commandDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンド定義が見つかりません: {selectedCommand.type}
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateCommand(selectedCommand.id, { [property]: value });
  };

  const defaultBgColor = commandDef.defaultBackgroundColor || "#ffffff";
  
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>{commandDef.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">背景色</Label>
          <ColorPicker
            value={selectedCommand.backgroundColor || defaultBgColor}
            onChange={(value) => handlePropertyChange("backgroundColor", value)}
          />
        </div>
        
        {/* Command Properties */}
        {Object.entries(commandDef.properties).map(([propName, propDef]) => (
          <div key={propName} className="space-y-2">
            <Label htmlFor={propName}>
              {propName}
              {propDef.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderPropertyInput(
              propName, 
              propDef, 
              selectedCommand[propName], 
              (value) => handlePropertyChange(propName, value),
              commands,
              commandsMap
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function renderPropertyInput(
  propName: string, 
  propDef: PropertyDefinition, 
  value: any, 
  onChange: (value: any) => void,
  commands?: any[], // Add commands parameter
  commandsMap?: Map<string, any> // Add commandsMap parameter
) {
  switch (propDef.type) {
    case 'string':
      return propDef.multiline ? (
        <Textarea
          id={propName}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      ) : (
        <Input
          id={propName}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      
    case 'number':
      return (
        <Input
          id={propName}
          type="number"
          value={value ?? propDef.default ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={propDef.constraints?.min}
          max={propDef.constraints?.max}
        />
      );
      
    case 'boolean':
      return (
        <Select
          value={value ? 'true' : 'false'}
          onValueChange={(val) => onChange(val === 'true')}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">はい</SelectItem>
            <SelectItem value="false">いいえ</SelectItem>
          </SelectContent>
        </Select>
      );
      
    case 'enum':
      return (
        <Select
          value={value || ''}
          onValueChange={onChange}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder="選択してください" />
          </SelectTrigger>
          <SelectContent>
            {propDef.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      
    case 'asset':
      return (
        <Input
          id={propName}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      
    case 'command': {
      const commandsList = commands || [];
      console.log('Command Types:', commandsList.map(cmd => cmd.type));
      console.log('Filtering for:', propDef.commandTypes);
      
      const filteredCommands = propDef.commandTypes
        ? commandsList.filter(cmd => propDef.commandTypes?.includes(cmd.type))
        : commandsList;
        
      console.log('Filtered Commands:', filteredCommands.map(cmd => cmd.type));
        
      return (
        <Select
          value={value?.toString() || ''}
          onValueChange={(val) => onChange(Number(val))}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder="コマンドを選択" />
          </SelectTrigger>
          <SelectContent>
            {filteredCommands.map((cmd) => (
              <SelectItem key={cmd.id} value={cmd.id.toString()}>
                {cmd.id}: {formatCommandPreview(cmd, commandsMap || new Map<string, any>())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
      
    default:
      return (
        <Input
          id={propName}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
