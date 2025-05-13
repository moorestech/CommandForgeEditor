import { CommandDefinition, CommandsConfig } from '../types';

/**
 * Reserved command definitions that are built into the system
 * These commands are not defined in commands.yaml but are available to use
 */
export const reservedCommands: CommandDefinition[] = [
  {
    id: 'group_start',
    label: 'グループ開始',
    description: 'グループの開始位置',
    commandListLabelFormat: 'GROUP_START: {groupName}',
    properties: {
      groupName: {
        type: 'string',
        default: '新しいグループ',
        required: true
      },
      isCollapsed: {
        type: 'boolean',
        default: false
      }
    }
  },
  {
    id: 'group_end',
    label: 'グループ終了',
    description: 'グループの終了位置',
    commandListLabelFormat: 'GROUP_END',
    properties: {}
  }
];

/**
 * Get a combined CommandsConfig with both user-defined and reserved commands
 * @param userConfig The user-defined commands configuration
 * @returns A CommandsConfig with both user-defined and reserved commands
 */
export function getCombinedCommandsConfig(userConfig: CommandsConfig): CommandsConfig {
  return {
    version: userConfig.version,
    commands: [...userConfig.commands, ...reservedCommands]
  };
}

/**
 * Check if a command type is a reserved command
 * @param commandType The command type to check
 * @returns True if the command type is a reserved command
 */
export function isReservedCommand(commandType: string): boolean {
  return reservedCommands.some(cmd => cmd.id === commandType);
}

/**
 * Get a reserved command definition by its type
 * @param commandType The command type to look for
 * @returns The reserved command definition or undefined if not found
 */
export function getReservedCommandDefinition(commandType: string): CommandDefinition | undefined {
  return reservedCommands.find(cmd => cmd.id === commandType);
}
