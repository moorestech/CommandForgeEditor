import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DropZone({ id, children, className = '' }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      {children}
    </div>
  );
}
