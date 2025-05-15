import { SkitCommand } from '../types';
import { getReservedCommandDefinition, isReservedCommand } from './reservedCommands';

/**
 * Format a command preview using its commandListLabelFormat
 */
export function formatCommandPreview(command: SkitCommand, commandsMap: Map<string, any>): string {
  const { type, id: _, ...props } = command;
  
  const isReserved = isReservedCommand(type);
  
  let commandDef;
  if (isReserved) {
    commandDef = getReservedCommandDefinition(type);
  } else if (commandsMap) {
    commandDef = commandsMap.get(type);
  }
  
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
  
  const isReserved = isReservedCommand(type);
  
  if (isReserved) {
    const commandDef = getReservedCommandDefinition(type);
    return !!commandDef?.commandListLabelFormat;
  } else if (!commandsMap) {
    return false;
  }
  
  const commandDef = commandsMap.get(type);
  return !!commandDef?.commandListLabelFormat;
}
