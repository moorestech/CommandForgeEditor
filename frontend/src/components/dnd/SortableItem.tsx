import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // lucide-reactからGripVerticalをインポート

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
        <GripVertical className="text-gray-400 hover:text-gray-600" size={16} />
      </div>

      {/* アイテムのコンテンツ - 左側にパディングを追加してハンドル用のスペースを確保 */}
      <div className="flex-1 pl-8">
        {children}
      </div>
    </div>
  );
}
