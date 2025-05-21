import { useSkitStore } from '../../store/skitStore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CommandDefinition, PropertyDefinition } from '../../types';
import { SkitCommand } from '../../types';
import { formatCommandPreview } from '../../utils/commandFormatting';
import { ColorPicker } from '../ui/color-picker';

export function CommandEditor() {
  const {
    skits,
    currentSkitId,
    selectedCommandIds,
    updateCommand,
    updateMultipleCommands,
    commandDefinitions,
    commandsMap
  } = useSkitStore();
  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const commands = currentSkit?.commands || [];
  
  console.log("Selected command IDs:", selectedCommandIds);
  
  const selectedCommands = selectedCommandIds
    .map(id => commands.find(cmd => cmd.id === id))
    .filter(cmd => cmd !== undefined) as SkitCommand[];
  
  console.log("Selected commands:", selectedCommands);
  
  if (selectedCommands.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンドが選択されていません
      </div>
    );
  }
  
  const firstCommand = selectedCommands[0];
  const commandDef = commandDefinitions.find(def => def.id === firstCommand.type);
  
  if (!commandDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンド定義が見つかりません: {firstCommand.type}
      </div>
    );
  }
  
  const allSameType = selectedCommands.every(cmd => cmd.type === firstCommand.type);
  
  if (!allSameType) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        異なるタイプのコマンドが選択されています
      </div>
    );
  }
  
  const handlePropertyChange = (property: string, value: unknown) => {
    if (selectedCommandIds.length > 1) {
      const updates: Record<string, unknown> = { [property]: value };
      updateMultipleCommands(selectedCommandIds, updates);
    } else {
      const updates: Record<string, unknown> = { [property]: value };
      updateCommand(firstCommand.id, updates);
    }
  };
  
  const allSameBgColor = selectedCommands.every(cmd => 
    (cmd.backgroundColor || commandDef.defaultBackgroundColor || "#ffffff") === 
    (firstCommand.backgroundColor || commandDef.defaultBackgroundColor || "#ffffff")
  );
  
  const defaultBgColor = commandDef.defaultBackgroundColor || "#ffffff";
  
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>
          {selectedCommandIds.length > 1 
            ? `${commandDef.label} (${selectedCommandIds.length}個選択中)`
            : commandDef.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">背景色</Label>
          <ColorPicker
            value={firstCommand.backgroundColor || defaultBgColor}
            onChange={(value) => handlePropertyChange("backgroundColor", value)}
            isDifferent={!allSameBgColor && selectedCommandIds.length > 1}
          />
        </div>
        
        {/* Command Properties */}
        {Object.entries(commandDef.properties).map(([propName, propDef]) => {
          const propValues = selectedCommands.map(cmd => cmd[propName]);
          const allSameValue = propValues.every(val => 
            JSON.stringify(val) === JSON.stringify(propValues[0])
          );
          
          return (
            <div key={propName} className="space-y-2">
              <Label htmlFor={propName}>
                {propName}
                {propDef.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderPropertyInput(
                propName, 
                propDef, 
                allSameValue || selectedCommandIds.length === 1 ? firstCommand[propName] : null, 
                (value) => handlePropertyChange(propName, value),
                commands,
                commandsMap,
                !allSameValue && selectedCommandIds.length > 1
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function renderPropertyInput(
  propName: string,
  propDef: PropertyDefinition,
  value: unknown,
  onChange: (value: unknown) => void,
  commands?: SkitCommand[], // Add commands parameter
  commandsMap?: Map<string, CommandDefinition>, // commandsMapの型を修正
  isDifferent?: boolean // 値が異なる場合はtrueになる
) {
  switch (propDef.type) {
    case 'string': {
      const stringValue = value as string | undefined;
      return propDef.multiline ? (
        <Textarea
          id={propName}
          value={isDifferent ? "-" : (stringValue || '')}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          disabled={isDifferent}
        />
      ) : (
        <Input
          id={propName}
          value={isDifferent ? "-" : (stringValue || '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDifferent}
        />
      );
    }
    case 'number': {
      const numberValue = value as number | undefined;
      return (
        <Input
          id={propName}
          type="number"
          value={isDifferent ? "-" : (numberValue ?? (propDef.default as number) ?? '')}
          onChange={(e) => onChange(Number(e.target.value))}
          min={propDef.constraints?.min}
          max={propDef.constraints?.max}
          disabled={isDifferent}
        />
      );
    }
    case 'boolean': {
      const booleanValue = value as boolean | undefined;
      return (
        <Select
          value={isDifferent ? "-" : (booleanValue ? 'true' : 'false')}
          onValueChange={(val) => onChange(val === 'true')}
          disabled={isDifferent}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder={isDifferent ? "-" : "選択してください"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">はい</SelectItem>
            <SelectItem value="false">いいえ</SelectItem>
          </SelectContent>
        </Select>
      );
    }
    case 'enum': {
      const enumValue = value as string | undefined;
      return (
        <Select
          value={isDifferent ? "-" : (enumValue || '')}
          onValueChange={onChange}
          disabled={isDifferent}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder={isDifferent ? "-" : "選択してください"} />
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
    }
    case 'asset': {
      const assetValue = value as string | undefined;
      return (
        <Input
          id={propName}
          value={isDifferent ? "-" : (assetValue || '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDifferent}
        />
      );
    }
    case 'command': {
      const commandValue = value as number | undefined;
      const commandsList = commands || [];

      const filteredCommands = propDef.commandTypes
        ? commandsList.filter(cmd => propDef.commandTypes?.includes(cmd.type))
        : commandsList;

      return (
        <Select
          value={isDifferent ? "-" : (commandValue?.toString() || '')}
          onValueChange={(val) => onChange(Number(val))}
          disabled={isDifferent}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder={isDifferent ? "-" : "コマンドを選択"} />
          </SelectTrigger>
          <SelectContent>
            {filteredCommands.map((cmd) => (
              <SelectItem key={cmd.id} value={cmd.id.toString()}>
                {cmd.id}: {formatCommandPreview(cmd, commandsMap || new Map<string, CommandDefinition>())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    default: {
      const defaultValue = value as string | undefined;
      return (
        <Input
          id={propName}
          value={isDifferent ? "-" : (defaultValue || '')}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDifferent}
        />
      );
    }
  }
}
