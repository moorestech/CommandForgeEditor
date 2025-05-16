import { SkitCommand } from '../types';

/**
 * Format a command preview using its commandListLabelFormat
 */
export function formatCommandPreview(command: SkitCommand, commandsMap: Map<string, any>): string {
  const { type, id: _, ...props } = command;

  let commandDef = commandsMap ? commandsMap.get(type) : undefined;

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
      formatted = formatted.replace(placeholder, String(value));
    }
  });

  return formatted;
}

/**
 * Check if a command has a commandListLabelFormat in its definition
 */
export function hasCommandFormat(command: SkitCommand, commandsMap: Map<string, any>): boolean {
  const { type } = command;

  let commandDef = commandsMap ? commandsMap.get(type) : undefined;

  return !!commandDef?.commandListLabelFormat;
}
