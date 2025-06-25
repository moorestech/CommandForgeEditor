import { CommandDefinition, PropertyDefinition, SkitCommand } from '../types';

/**
 * コマンド定義からプロパティのデフォルト値を生成する
 */
export function createCommandWithDefaults(commandDef: CommandDefinition): Partial<SkitCommand> {
  const newCommand: Partial<SkitCommand> = {
    type: commandDef.id,
    backgroundColor: commandDef.defaultBackgroundColor || "#ffffff"
  };
  
  Object.entries(commandDef.properties).forEach(([propName, propDef]: [string, PropertyDefinition]) => {
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
          // Handle both string[] and { master: string } types
          if (propDef.options && Array.isArray(propDef.options)) {
            newCommand[propName] = propDef.options[0] || '';
          } else {
            // For { master: string } or undefined options, we don't have a default value
            newCommand[propName] = '';
          }
          break;
        case 'asset':
          newCommand[propName] = '';
          break;
        case 'vector2':
        case 'vector2Int':
          newCommand[propName] = [0, 0];
          break;
        case 'vector3':
        case 'vector3Int':
          newCommand[propName] = [0, 0, 0];
          break;
        case 'vector4':
          newCommand[propName] = [0, 0, 0, 0];
          break;
      }
    }
  });

  return newCommand;
}