import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableCommandProps {
  id: string;
  children: React.ReactNode;
}

export function DraggableCommand({ id, children }: DraggableCommandProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `command-${id}`,
    data: {
      type: 'command',
      commandType: id
    }
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      {children}
    </div>
  );
}
