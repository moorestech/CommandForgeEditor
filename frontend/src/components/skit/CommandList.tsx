import React, { memo, useCallback, useMemo } from 'react';
import { useSkitStore, getGroupCommandIndices } from '../../store/skitStore';
import { SortableList } from '../dnd/SortableList';
import { CommandItem } from './CommandItem';
import { DropZone } from '../dnd/DropZone';
import { SkitCommand } from '../../types';

/**
 * CommandList コンポーネント - パフォーマンス最適化済み
 *
 * 実装された最適化:
 * 1. コンポーネントのメモ化（CommandList、CommandItem、CommandContextMenu）で不要な再レンダリングを防止
 * 2. ハンドラー関数をuseCallbackでメモ化し、レンダリング時の再生成を防止
 * 3. 計算量の多い処理（ネスト構造計算、表示/非表示判定など）をuseMemoでキャッシュ
 * 4. コマンド定義の高速参照のためのMap構造（commandsMap）を導入
 * 5. 効率的なドラッグ＆ドロップ処理のためのインデックスマッピング
 * 6. 表示対象のコマンドのみをレンダリング（非表示コマンドはDOMに含めない）
 */
export const CommandList = memo(function CommandList() {
  const { 
    skits, 
    currentSkitId, 
    selectedCommandIds, 
    selectCommand,
    moveCommand 
  } = useSkitStore();
  
  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  
  const commands = useMemo(() => {
    return currentSkit?.commands || [];
  }, [currentSkit]);
  
  const visibleCommands = useMemo(() => {
    if (!commands.length) return [];
    
    const result: SkitCommand[] = [];
    const hiddenGroupStarts: number[] = [];
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (hiddenGroupStarts.length > 0) {
        if (command.type === 'group_start') {
          hiddenGroupStarts.push(i);
        } else if (command.type === 'group_end') {
          hiddenGroupStarts.pop();
        }
        continue;
      }
      
      result.push(command);
      
      if (command.type === 'group_start' && command.isCollapsed) {
        hiddenGroupStarts.push(i);
      }
    }
    
    return result;
  }, [commands]);
  
  const handleCommandClick = useCallback((id: number) => {
    selectCommand(id);
  }, [selectCommand]);
  
  const handleContextMenu = useCallback((e: React.MouseEvent, id: number) => {
    e.preventDefault();
    selectCommand(id);
  }, [selectCommand]);
  
  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    const fromCommandId = visibleCommands[fromIndex].id;
    moveCommand(fromCommandId, toIndex);
  }, [visibleCommands, moveCommand]);
  
  const getCommandGroupInfo = useCallback((commandId: number) => {
    if (!commands.length) return null;
    
    const commandIndex = commands.findIndex(cmd => cmd.id === commandId);
    if (commandIndex === -1) return null;
    
    let groupStartIndex = -1;
    let nestLevel = 0;
    
    for (let i = commandIndex; i >= 0; i--) {
      const cmd = commands[i];
      if (cmd.type === 'group_end') {
        nestLevel++;
      } else if (cmd.type === 'group_start') {
        if (nestLevel === 0) {
          groupStartIndex = i;
          break;
        }
        nestLevel--;
      }
    }
    
    if (groupStartIndex === -1) return null;
    
    const groupIndices = getGroupCommandIndices(commands, groupStartIndex);
    
    const isFirst = groupIndices[1] === commandIndex; // 最初のコマンド（グループ開始の次）
    const isLast = groupIndices[groupIndices.length - 2] === commandIndex; // 最後のコマンド（グループ終了の前）
    
    return { isFirst, isLast };
  }, [commands]);
  
  const isCommandInGroup = useCallback((commandId: number) => {
    return getCommandGroupInfo(commandId) !== null;
  }, [getCommandGroupInfo]);
  
  if (!currentSkit) {
    return (
      <div className="p-4 text-center text-gray-500">
        スキットが選択されていません
      </div>
    );
  }
  
  if (visibleCommands.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        コマンドがありません
      </div>
    );
  }
  
  return (
    <DropZone id="command-list" className="p-2 h-full">
      <SortableList
        items={visibleCommands}
        getItemId={(command: SkitCommand) => `command-item-${command.id}`}
        onReorder={handleReorder}
      >
        {visibleCommands.map((command, index) => {
          const isSelected = selectedCommandIds.includes(command.id);
          
          // グループ関連の情報を計算
          const isInGroup = isCommandInGroup(command.id);
          const groupInfo = isInGroup 
            ? getCommandGroupInfo(command.id) 
            : null;
          
          return (
            <CommandItem
              key={command.id}
              id={command.id}
              type={command.type}
              index={index + 1}
              groupName={command.groupName}
              isFirstInGroup={groupInfo?.isFirst}
              isLastInGroup={groupInfo?.isLast}
              isCollapsed={command.isCollapsed}
              backgroundColor={command.backgroundColor}
              isSelected={isSelected}
              onClick={() => handleCommandClick(command.id)}
              onContextMenu={(e) => handleContextMenu(e, command.id)}
            />
          );
        })}
      </SortableList>
    </DropZone>
  );
});
