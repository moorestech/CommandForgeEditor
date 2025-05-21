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
    commandDefinitions,
    commandsMap
  } = useSkitStore();
  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const selectedCommands = currentSkit
    ? currentSkit.commands.filter(cmd => selectedCommandIds.includes(cmd.id))
    : [];
  const commands = currentSkit?.commands || [];

  if (selectedCommands.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンドが選択されていません
      </div>
    );
  }

  const firstCommand = selectedCommands[0];
  const firstCommandDef = commandDefinitions.find(def => def.id === firstCommand.type);
  if (!firstCommandDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンド定義が見つかりません: {firstCommand.type}
      </div>
    );
  }

  // get common property definitions
  const otherDefs = selectedCommands.slice(1).map(cmd => commandDefinitions.find(def => def.id === cmd.type));
  const allDefs = [firstCommandDef, ...otherDefs.filter((d): d is CommandDefinition => d !== undefined)];
  const commonProperties = Object.entries(firstCommandDef.properties).filter(([name, def]) =>
    allDefs.every(d => d.properties[name] && d.properties[name].type === def.type)
  );

  
  if (!firstCommandDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        コマンド定義が見つかりません: {firstCommand.type}
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: unknown) => {
    const updates: Record<string, unknown> = { [property]: value };
    selectedCommands.forEach(cmd => {
      updateCommand(cmd.id, updates);
    });
  };

  const backgroundColors = selectedCommands.map(cmd => cmd.backgroundColor || (commandsMap.get(cmd.type)?.defaultBackgroundColor ?? "#ffffff"));
  const isBgMixed = !backgroundColors.every(c => c === backgroundColors[0]);
  const bgColorValue = isBgMixed ? "#ffffff" : backgroundColors[0];

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>
          {selectedCommands.length > 1 ? `${selectedCommands.length}個のコマンド` : firstCommandDef.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">背景色</Label>
          <ColorPicker
            value={bgColorValue}
            onChange={(value) => handlePropertyChange("backgroundColor", value)}
            placeholder={isBgMixed ? '-' : undefined}
          />
        </div>

        {/* Command Properties */}
        {commonProperties.map(([propName, propDef]) => {
          const values = selectedCommands.map(cmd => cmd[propName]);
          const isMixed = !values.every(v => v === values[0]);
          const value = isMixed ? undefined : values[0];
          return (
            <div key={propName} className="space-y-2">
              <Label htmlFor={propName}>
                {propName}
                {propDef.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderPropertyInput(
                propName,
                propDef,
                value,
                (val) => handlePropertyChange(propName, val),
                commands,
                commandsMap,
                isMixed
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
  commands?: SkitCommand[],
  commandsMap?: Map<string, CommandDefinition>,
  isMixed?: boolean
) {
  switch (propDef.type) {
    case 'string': {
      const stringValue = value as string | undefined;
      return propDef.multiline ? (
        <Textarea
          id={propName}
          value={isMixed ? '' : stringValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isMixed ? '-' : undefined}
          rows={5}
        />
      ) : (
        <Input
          id={propName}
          value={isMixed ? '' : stringValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isMixed ? '-' : undefined}
        />
      );
    }
    case 'number': {
      const numberValue = value as number | undefined;
      return (
        <Input
          id={propName}
          type="number"
          value={isMixed ? '' : numberValue ?? (propDef.default as number) ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={isMixed ? '-' : undefined}
          min={propDef.constraints?.min}
          max={propDef.constraints?.max}
        />
      );
    }
    case 'boolean': {
      const booleanValue = value as boolean | undefined;
      return (
        <Select
          value={isMixed ? '' : booleanValue ? 'true' : 'false'}
          onValueChange={(val) => onChange(val === 'true')}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder={isMixed ? '-' : '選択してください'} />
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
          value={isMixed ? '' : enumValue || ''}
          onValueChange={onChange}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder={isMixed ? '-' : '選択してください'} />
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
          value={isMixed ? '' : assetValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isMixed ? '-' : undefined}
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
          value={isMixed ? '' : commandValue?.toString() || ''}
          onValueChange={(val) => onChange(Number(val))}
        >
          <SelectTrigger id={propName}>
            <SelectValue placeholder={isMixed ? '-' : 'コマンドを選択'} />
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
          value={isMixed ? '' : defaultValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isMixed ? '-' : undefined}
        />
      );
    }
  }
}
