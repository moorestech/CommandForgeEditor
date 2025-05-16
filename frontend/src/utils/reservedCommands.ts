import { CommandDefinition } from '@/types';

/**
 * Reserved command definitions that are built into the system
 * These commands are not defined in commands.yaml but are available to use
 */
export const reservedCommands: CommandDefinition[] = [
  {
    id: 'group_start',
    label: 'グループ開始',
    description: 'グループの開始位置',
    commandListLabelFormat: '{groupName}',
    defaultBackgroundColor: '#b9b9b9',
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
    commandListLabelFormat: 'グループ終了',
    defaultBackgroundColor: '#b9b9b9',
    properties: {}
  }
];
