import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useSkitStore } from '../../store/skitStore';

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  const { addCommand, removeCommand, duplicateCommand } = useSkitStore();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('Drag start:', active.id, active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    console.log('Drag over:', active.id, 'over', over.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    console.log('Drag end:', active.id, 'over', over.id);
    
    if (active.data.current?.type === 'command' && over.id === 'command-list') {
      const commandType = active.data.current.commandType;
      addCommand({ type: commandType });
    }
    
    if (active.id.toString().startsWith('command-item-') && over.id === 'trash-zone') {
      const commandId = Number(active.id.toString().replace('command-item-', ''));
      removeCommand(commandId);
    }
    
    if (active.id.toString().startsWith('command-item-') && over.id === 'copy-zone') {
      const commandId = Number(active.id.toString().replace('command-item-', ''));
      duplicateCommand(commandId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
