import { useSkitStore } from '../../store/skitStore';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { useDndSortable } from '../../hooks/useDndSortable';
import { SortableList } from '../dnd/SortableList';
import { SortableItem } from '../dnd/SortableItem';
import { DropZone } from '../dnd/DropZone';
import { SkitCommand } from '../../types';

export function CommandList() {
  const { 
    skits, 
    currentSkitId, 
    selectedCommandId, 
    selectCommand,
    moveCommand
  } = useSkitStore();

  const currentSkit = currentSkitId ? skits[currentSkitId] : null;
  const commands = currentSkit?.commands || [];

  const { activeId, handleDragStart, handleDragEnd } = useDndSortable({
    items: commands,
    onReorder: () => {}, // Handled by SortableList
    getItemId: (command) => command.id
  });

  if (!currentSkit) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        スキットが選択されていません
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <DropZone id="command-list" className="p-0 h-full">
        <SortableList
          items={commands}
          getItemId={(command) => command.id}
          onReorder={(fromIndex, toIndex) => moveCommand(fromIndex, toIndex)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {commands.map((command, index) => (
            <SortableItem key={command.id} id={command.id}>
              <div
                className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full
                  ${selectedCommandId === command.id
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-accent'
                  } ${activeId === command.id ? 'opacity-50' : ''}`}
                onClick={() => selectCommand(command.id)}
                data-testid={`command-item-${command.id}`}
              >
                {/* 行番号 */}
                <div className="w-6 flex-shrink-0 mr-2 text-center">{index + 1}</div>
                {/* コマンドタイプ */}
                <div className="font-medium mr-2">{command.type}</div>
                {/* コマンド内容プレビュー */}
                <div className="text-sm truncate">
                  {formatCommandPreview(command)}
                </div>
              </div>
            </SortableItem>
          ))}
        </SortableList>
      </DropZone>
    </ScrollArea>
  );
}

function formatCommandPreview(command: SkitCommand): string {
  const { type, id, ...props } = command;
  
  const firstPropValue = Object.values(props).find(val => 
    typeof val === 'string' && val !== type && val.length > 0
  );
  
  return firstPropValue as string || type;
}
