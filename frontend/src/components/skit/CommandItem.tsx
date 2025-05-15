import React, { memo } from 'react';
import { SortableItem } from '../dnd/SortableItem';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CommandItemProps {
  id: number;
  type: string;
  index: number;
  groupName?: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  isCollapsed?: boolean;
  backgroundColor?: string;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

export const CommandItem = memo(function CommandItem({
  id,
  type,
  index,
  groupName,
  isFirstInGroup,
  isLastInGroup,
  isCollapsed,
  backgroundColor,
  isSelected,
  onClick,
  onContextMenu
}: CommandItemProps) {
  const isGroupStart = type === 'group_start';
  
  const getTextColor = (bgColor: string) => {
    if (!bgColor || bgColor === '') return '';
    
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    return brightness < 128 ? 'text-white' : 'text-black';
  };
  
  const textColorClass = backgroundColor ? getTextColor(backgroundColor) : '';
  
  if (isGroupStart) {
    return (
      <SortableItem id={`command-item-${id}`}>
        <div 
          className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full relative
            ${isSelected
              ? 'bg-blue-500 text-white'
              : textColorClass || 'hover:bg-accent'
            }`}
          onClick={onClick}
          onContextMenu={onContextMenu}
          data-testid={`command-item-${id}`}
          style={isSelected ? {} : { backgroundColor }}
        >
          <div className="w-6 flex-shrink-0 mr-2 text-center">{index}</div>
          
          {isCollapsed !== undefined && (
            <button
              className="mr-1 p-1 hover:bg-gray-200 rounded"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          
          <div className="font-medium font-bold">
            {groupName || 'グループ'}
          </div>
        </div>
      </SortableItem>
    );
  }

  return (
    <SortableItem id={`command-item-${id}`}>
      <div 
        className={`cursor-pointer transition-colors flex items-center py-2 px-2 border-b w-full relative
          ${isFirstInGroup ? 'mt-1 border-t border-gray-200 pt-2' : ''}
          ${isLastInGroup ? 'mb-1 border-b border-gray-200 pb-2' : ''}
          ${isSelected
            ? 'bg-blue-500 text-white'
            : textColorClass || 'hover:bg-accent'
          }`}
        onClick={onClick}
        onContextMenu={onContextMenu}
        data-testid={`command-item-${id}`}
        style={isSelected ? {} : { backgroundColor }}
      >
        <div className="w-6 flex-shrink-0 mr-2 text-center">{index}</div>
        
        <div className="font-medium mr-2">
          {type}
        </div>
      </div>
    </SortableItem>
  );
});
