import { SkitCommand, CommandDefinition } from '../types';
import { getTranslationWithFallback } from '../i18n/translationLoader';

/**
 * Format a command preview using its commandListLabelFormat
 */
export function formatCommandPreview(command: SkitCommand, commandsMap: Map<string, CommandDefinition>): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { type, id, ...props } = command;

  const commandDef = commandsMap ? commandsMap.get(type) : undefined;

  if (!commandDef || !commandDef.commandListLabelFormat) {
    const firstPropValue = Object.values(props).find(val =>
      typeof val === 'string' && val !== type && val.length > 0
    );
    return firstPropValue as string || type;
  }

  let formatted = commandDef.commandListLabelFormat;
  Object.entries(props).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    if (formatted.includes(placeholder)) {
      // Check if this property has a masterKey (references master data)
      const propertyDef = commandDef.properties[key];
      let displayValue = String(value);
      
      if (propertyDef && propertyDef.masterKey && propertyDef.type === 'enum') {
        // Try to get translation for master data
        const masterTranslationKey = `master.${propertyDef.masterKey}.${value}`;
        const translatedValue = getTranslationWithFallback(masterTranslationKey, undefined);
        
        // Use translation if it exists and is different from the key
        if (translatedValue && translatedValue !== masterTranslationKey) {
          displayValue = translatedValue;
        }
      }
      
      formatted = formatted.replace(placeholder, displayValue);
    }
  });

  return formatted;
}

/**
 * Check if a command has a commandListLabelFormat in its definition
 */
export function hasCommandFormat(command: SkitCommand, commandsMap: Map<string, CommandDefinition>): boolean {
  const { type } = command;

  const commandDef = commandsMap ? commandsMap.get(type) : undefined;

  return !!commandDef?.commandListLabelFormat;
}
