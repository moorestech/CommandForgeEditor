import { useState } from 'react';

interface UseDndSortableProps<T> {
  items: T[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  getItemId: (item: T) => string | number;
}

export function useDndSortable<T>({ onReorder }: UseDndSortableProps<T>) {
  const [activeId, setActiveId] = useState<string | number | null>(null);

  const handleDragStart = (id: string | number) => {
    setActiveId(id);
  };

  const handleDragEnd = () => {
    setActiveId(null);
  };

  return {
    activeId,
    handleDragStart,
    handleDragEnd,
  };
}
