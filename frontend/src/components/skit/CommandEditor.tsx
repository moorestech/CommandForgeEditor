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
    updateCommands,
    commandDefinitions,
    commandsMap
  } = useSkitStore();
  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const commands = currentSkit?.commands || [];

  const selectedCommands = selectedCommandIds
    .map(id => commands.find(cmd => cmd.id === id))
    .filter((cmd): cmd is SkitCommand => !!cmd);

  if (selectedCommands.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンドが選択されていません
      </div>
    );
  }

  const primaryCommand = selectedCommands[0];
  const commandDefs = selectedCommands
    .map(cmd => commandDefinitions.find(def => def.id === cmd.type))
    .filter((def): def is CommandDefinition => !!def);

  if (commandDefs.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンド定義が見つかりません
      </div>
    );
  }

  const commandDef = commandDefs[0];

  const handlePropertyChange = (property: string, value: unknown) => {
    const updates: Record<string, unknown> = { [property]: value };
    if (selectedCommands.length > 1) {
      updateCommands(selectedCommandIds, updates);
    } else {
      updateCommand(primaryCommand.id, updates);
    }
  };

  const defaultBgColor = commandDef.defaultBackgroundColor || "#ffffff";

  const commonProperties = Object.entries(commandDefs[0].properties).filter(
    ([name, def]) =>
      commandDefs.every(cd => cd.properties[name] && cd.properties[name].type === def.type)
  );
  
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>
          {selectedCommands.length > 1
            ? `${selectedCommands.length}個のコマンドを編集`
            : commandDef.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">背景色</Label>
          <ColorPicker
            value={primaryCommand.backgroundColor || defaultBgColor}
            onChange={(value) => handlePropertyChange("backgroundColor", value)}
          />
        </div>
        
        {/* Command Properties */}
        {commonProperties.map(([propName, propDef]) => (
          <div key={propName} className="space-y-2">
            <Label htmlFor={propName}>
              {propName}
              {propDef.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            {renderPropertyInput(
              propName,
              propDef,
              primaryCommand[propName],
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
  value: unknown,
  onChange: (value: unknown) => void,
  commands?: SkitCommand[], // Add commands parameter
  commandsMap?: Map<string, CommandDefinition> // commandsMapの型を修正
) {
  switch (propDef.type) {
    case 'string': {
      const stringValue = value as string | undefined;
      return propDef.multiline ? (
        <Textarea
          id={propName}
          value={stringValue || ''}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      ) : (
        <Input
          id={propName}
          value={stringValue || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    case 'number': {
      const numberValue = value as number | undefined;
      return (
        <Input
          id={propName}
          type="number"
          value={numberValue ?? (propDef.default as number) ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          min={propDef.constraints?.min}
          max={propDef.constraints?.max}
        />
      );
    }
    case 'boolean': {
      const booleanValue = value as boolean | undefined;
      return (
        <Select
          value={booleanValue ? 'true' : 'false'}
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
    }
    case 'enum': {
      const enumValue = value as string | undefined;
      return (
        <Select
          value={enumValue || ''}
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
    }
    case 'asset': {
      const assetValue = value as string | undefined;
      return (
        <Input
          id={propName}
          value={assetValue || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
    case 'command': {
      const commandValue = value as number | undefined;
      const commandsList = commands || [];
      console.log('Command Types:', commandsList.map(cmd => cmd.type));
      console.log('Filtering for:', propDef.commandTypes);

      const filteredCommands = propDef.commandTypes
        ? commandsList.filter(cmd => propDef.commandTypes?.includes(cmd.type))
        : commandsList;

      console.log('Filtered Commands:', filteredCommands.map(cmd => cmd.type));

      return (
        <Select
          value={commandValue?.toString() || ''}
          onValueChange={(val) => onChange(Number(val))}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder="コマンドを選択" />
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
          value={defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }
  }
}
