import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SortableListProps<T> {
  items: T[];
  getItemId: (item: T) => string | number;
  onReorder: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
  onDragStart?: (id: string | number) => void;
  onDragEnd?: () => void;
}

export function SortableList<T>({
  items,
  getItemId,
  onReorder,
  children,
  onDragStart,
  onDragEnd,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    if (onDragStart) {
      onDragStart(event.active.id);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => getItemId(item) === active.id);
      const newIndex = items.findIndex(item => getItemId(item) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }

    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(item => getItemId(item))} 
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
