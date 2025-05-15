import React, { memo } from 'react';
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '../ui/context-menu';
import { SkitCommand } from '../../types';

interface CommandContextMenuProps {
  command: SkitCommand;
  index: number;
  commandDefinitions: any[];
  selectedCommandIds: number[];
  removeCommand: (id: number) => void;
  ungroupCommands: (id: number) => void;
  createGroup: () => void;
  handleAddCommand: (commandType: string, targetIndex: number, position: 'above' | 'below') => void;
}

export const CommandContextMenu = memo(function CommandContextMenu({
  command,
  index,
  commandDefinitions,
  selectedCommandIds,
  removeCommand,
  ungroupCommands,
  createGroup,
  handleAddCommand
}: CommandContextMenuProps) {
  const isGroupStart = command.type === 'group_start';
  
  return (
    <ContextMenuContent>
      <ContextMenuItem onClick={() => removeCommand(command.id)}>
        削除
      </ContextMenuItem>
      
      {/* グループ開始コマンドの場合はグループ解除オプションを表示 */}
      {isGroupStart && (
        <ContextMenuItem onClick={() => ungroupCommands(command.id)}>
          グループ解除
        </ContextMenuItem>
      )}
      
      {/* 複数選択時はグループ化オプションを表示 */}
      {selectedCommandIds.length > 1 && selectedCommandIds.includes(command.id) && (
        <ContextMenuItem onClick={() => createGroup()}>
          グループ化
        </ContextMenuItem>
      )}
      
      <ContextMenuSeparator />
      
      <ContextMenuSub>
        <ContextMenuSubTrigger>上にコマンドを追加</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {commandDefinitions.map((cmdDef: any) => (
            <ContextMenuItem
              key={cmdDef.id}
              onClick={() => handleAddCommand(cmdDef.id, index, 'above')}
            >
              {cmdDef.label}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
      
      <ContextMenuSub>
        <ContextMenuSubTrigger>下にコマンドを追加</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {commandDefinitions.map((cmdDef: any) => (
            <ContextMenuItem
              key={cmdDef.id}
              onClick={() => handleAddCommand(cmdDef.id, index, 'below')}
            >
              {cmdDef.label}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  );
});
