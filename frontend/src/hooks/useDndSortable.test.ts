// AI Generated Test Code
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDndSortable } from './useDndSortable';

describe('useDndSortable', () => {
  const mockOnReorder = vi.fn();
  const mockGetItemId = vi.fn((item: any) => item.id);
  
  const defaultProps = {
    items: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ],
    onReorder: mockOnReorder,
    getItemId: mockGetItemId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null activeId', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    expect(result.current.activeId).toBeNull();
  });

  it('should return handleDragStart function', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    expect(result.current.handleDragStart).toBeDefined();
    expect(typeof result.current.handleDragStart).toBe('function');
  });

  it('should return handleDragEnd function', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    expect(result.current.handleDragEnd).toBeDefined();
    expect(typeof result.current.handleDragEnd).toBe('function');
  });

  it('should set activeId when handleDragStart is called', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    act(() => {
      result.current.handleDragStart(2);
    });
    
    expect(result.current.activeId).toBe(2);
  });

  it('should set activeId to null when handleDragEnd is called', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    // First set an active ID
    act(() => {
      result.current.handleDragStart(3);
    });
    
    expect(result.current.activeId).toBe(3);
    
    // Then end the drag
    act(() => {
      result.current.handleDragEnd();
    });
    
    expect(result.current.activeId).toBeNull();
  });

  it('should handle string IDs', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    act(() => {
      result.current.handleDragStart('item-1');
    });
    
    expect(result.current.activeId).toBe('item-1');
  });

  it('should handle multiple drag operations', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    // First drag
    act(() => {
      result.current.handleDragStart(1);
    });
    expect(result.current.activeId).toBe(1);
    
    act(() => {
      result.current.handleDragEnd();
    });
    expect(result.current.activeId).toBeNull();
    
    // Second drag
    act(() => {
      result.current.handleDragStart(2);
    });
    expect(result.current.activeId).toBe(2);
    
    act(() => {
      result.current.handleDragEnd();
    });
    expect(result.current.activeId).toBeNull();
  });

  it('should work with different item types', () => {
    const stringProps = {
      items: ['Item 1', 'Item 2', 'Item 3'],
      onReorder: mockOnReorder,
      getItemId: (item: string) => item,
    };
    
    const { result } = renderHook(() => useDndSortable(stringProps));
    
    act(() => {
      result.current.handleDragStart('Item 2');
    });
    
    expect(result.current.activeId).toBe('Item 2');
  });

  it('should not use props directly', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    // The hook doesn't use the props directly, just for type safety
    expect(mockOnReorder).not.toHaveBeenCalled();
    expect(mockGetItemId).not.toHaveBeenCalled();
  });

  it('should maintain state when props change', () => {
    const { result, rerender } = renderHook(
      (props) => useDndSortable(props),
      { initialProps: defaultProps }
    );
    
    act(() => {
      result.current.handleDragStart(1);
    });
    
    const newProps = {
      ...defaultProps,
      items: [
        { id: 4, name: 'Item 4' },
        { id: 5, name: 'Item 5' },
      ],
    };
    
    rerender(newProps);
    
    // Active ID should be maintained
    expect(result.current.activeId).toBe(1);
  });

  it('should handle numeric zero as activeId', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    act(() => {
      result.current.handleDragStart(0);
    });
    
    expect(result.current.activeId).toBe(0);
  });

  it('should handle empty string as activeId', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    act(() => {
      result.current.handleDragStart('');
    });
    
    expect(result.current.activeId).toBe('');
  });

  it('should allow changing activeId multiple times without ending drag', () => {
    const { result } = renderHook(() => useDndSortable(defaultProps));
    
    act(() => {
      result.current.handleDragStart(1);
    });
    expect(result.current.activeId).toBe(1);
    
    act(() => {
      result.current.handleDragStart(2);
    });
    expect(result.current.activeId).toBe(2);
    
    act(() => {
      result.current.handleDragStart(3);
    });
    expect(result.current.activeId).toBe(3);
  });
});