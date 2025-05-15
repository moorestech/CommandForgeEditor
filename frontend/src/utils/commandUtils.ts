import { SkitCommand } from '../types';

interface CommandDefinition {
  commandListLabelFormat?: string;
  [key: string]: unknown;
}

/**
 * コマンドに対応するコマンド定義に commandListLabelFormat が設定されているかチェック
 */
export function hasCommandFormat(command: SkitCommand, commandsMap: Map<string, CommandDefinition>): boolean {
  const { type } = command;
  
  if (!commandsMap) {
    return false;
  }
  
  const commandDef = commandsMap.get(type);
  return !!commandDef?.commandListLabelFormat;
}

/**
 * コマンドのプレビューテキストをフォーマットする
 */
export function formatCommandPreview(command: SkitCommand, commandsMap: Map<string, CommandDefinition>): string {
  const { type, id, ...props } = command;
  
  if (!commandsMap) {
    const firstPropValue = Object.values(props).find(val =>
      typeof val === 'string' && val !== type && val.length > 0
    );
    return firstPropValue as string || type;
  }
  
  const commandDef = commandsMap.get(type);
  
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
