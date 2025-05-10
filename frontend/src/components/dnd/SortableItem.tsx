import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex w-full relative"
      data-testid={`sortable-item-${id}`}
    >
      {/* ドラッグハンドル - 明確なスタイルと位置を持たせる */}
      <div
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-transparent hover:bg-gray-100 z-10 rounded-l-sm"
        aria-label="ドラッグハンドル"
        data-testid="drag-handle"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-400 hover:text-gray-600"
        >
          <circle cx="2.5" cy="4.5" r="1.5" />
          <circle cx="7" cy="4.5" r="1.5" />
          <circle cx="11.5" cy="4.5" r="1.5" />
          <circle cx="2.5" cy="9.5" r="1.5" />
          <circle cx="7" cy="9.5" r="1.5" />
          <circle cx="11.5" cy="9.5" r="1.5" />
        </svg>
      </div>

      {/* アイテムのコンテンツ - 左側にパディングを追加してハンドル用のスペースを確保 */}
      <div className="flex-1 pl-8">
        {children}
      </div>
    </div>
  );
}
