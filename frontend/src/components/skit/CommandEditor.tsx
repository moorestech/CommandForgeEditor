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
import { VectorInput } from '../ui/vector-input';
import { useTranslation } from 'react-i18next';
import { useCommandTranslation } from '../../hooks/useCommandTranslation';

// Helper component for displaying translated command labels
function TranslatedCommandLabel({ commandType, label }: { commandType: string; label: string }) {
  const { tCommand } = useCommandTranslation(commandType);
  return <>{tCommand('name', label)}</>;
}

// Helper component for displaying translated property labels
function PropertyLabel({ commandType, propertyKey, required }: { commandType: string; propertyKey: string; required?: boolean }) {
  const { tProperty } = useCommandTranslation(commandType);
  const label = tProperty(propertyKey, 'name', propertyKey);
  
  return (
    <>
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </>
  );
}

// Helper component for enum options
function EnumOption({ commandType, propertyKey, value }: { commandType: string; propertyKey: string; value: string }) {
  const { tEnum } = useCommandTranslation(commandType);
  return <>{tEnum(propertyKey, value, value)}</>;
}

export function CommandEditor() {
  const { t } = useTranslation();
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
        {t('editor.noCommandSelected')}
      </div>
    );
  }

  const firstCommand = selectedCommands[0];
  const firstCommandDef = commandDefinitions.find(def => def.id === firstCommand.type);
  if (!firstCommandDef) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        {t('editor.commandDefinitionNotFound')}: {firstCommand.type}
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
        {t('editor.commandDefinitionNotFound')}: {firstCommand.type}
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

  const selectedLabels = selectedCommands.map(cmd => commandsMap.get(cmd.type)?.label || cmd.type);
  const uniqueLabels = Array.from(new Set(selectedLabels));

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle>
          {selectedCommands.length > 1
            ? `${uniqueLabels.join(', ')} (${t('editor.itemsSelected', { count: selectedCommands.length })})`
            : <TranslatedCommandLabel commandType={firstCommand.type} label={firstCommandDef.label} />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Background Color Picker */}
        <div className="space-y-2">
          <Label htmlFor="backgroundColor">{t('editor.backgroundColor')}</Label>
          <ColorPicker
            value={bgColorValue}
            onChange={(value) => handlePropertyChange("backgroundColor", value)}
            placeholder={isBgMixed ? '-' : undefined}
            isMixed={isBgMixed}
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
                <PropertyLabel commandType={firstCommand.type} propertyKey={propName} required={propDef.required} />
              </Label>
              <PropertyInput
                propName={propName}
                propDef={propDef}
                value={value}
                onChange={(val) => handlePropertyChange(propName, val)}
                commands={commands}
                commandsMap={commandsMap}
                isMixed={isMixed}
                commandType={firstCommand.type}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// Wrapper component for property input with translations
function PropertyInput(props: {
  propName: string;
  propDef: PropertyDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  commands?: SkitCommand[];
  commandsMap?: Map<string, CommandDefinition>;
  isMixed?: boolean;
  commandType: string;
}) {
  const { t } = useTranslation();
  return <>{renderPropertyInput({ ...props, t })}</>;
}

function renderPropertyInput({
  propName,
  propDef,
  value,
  onChange,
  commands,
  commandsMap,
  isMixed,
  commandType,
  t
}: {
  propName: string;
  propDef: PropertyDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  commands?: SkitCommand[];
  commandsMap?: Map<string, CommandDefinition>;
  isMixed?: boolean;
  commandType?: string;
  t: (key: string) => string;
}) {
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
            <SelectValue placeholder={isMixed ? '-' : t('editor.selectPlease')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">{t('editor.yes')}</SelectItem>
            <SelectItem value="false">{t('editor.no')}</SelectItem>
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
            <SelectValue placeholder={isMixed ? '-' : t('editor.selectPlease')} />
          </SelectTrigger>
          <SelectContent>
            {propDef.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {commandType ? <EnumOption commandType={commandType} propertyKey={propName} value={option} /> : option}
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
    case 'vector2':
    case 'vector3':
    case 'vector4':
    case 'vector2Int':
    case 'vector3Int': {
      const dimension =
        propDef.type === 'vector2' || propDef.type === 'vector2Int'
          ? 2
          : propDef.type === 'vector3' || propDef.type === 'vector3Int'
          ? 3
          : 4;
      const integer = propDef.type === 'vector2Int' || propDef.type === 'vector3Int';
      return (
        <VectorInput
          value={value as number[] | undefined}
          dimension={dimension as 2 | 3 | 4}
          integer={integer}
          onChange={onChange as (val: number[]) => void}
          isMixed={isMixed}
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
