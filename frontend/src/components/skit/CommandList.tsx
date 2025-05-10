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
      <DropZone id="command-list" className="p-4 space-y-2 min-h-[200px]">
        <SortableList
          items={commands}
          getItemId={(command) => command.id}
          onReorder={(fromIndex, toIndex) => moveCommand(fromIndex, toIndex)}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {commands.map((command) => (
            <SortableItem key={command.id} id={`command-item-${command.id}`}>
              <Card 
                className={`cursor-pointer transition-colors mb-2 ${
                  selectedCommandId === command.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'hover:bg-accent'
                } ${activeId === `command-item-${command.id}` ? 'opacity-50' : ''}`}
                onClick={() => selectCommand(command.id)}
              >
                <CardContent className="p-3">
                  <div className="font-medium">{command.type}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {formatCommandPreview(command)}
                  </div>
                </CardContent>
              </Card>
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
