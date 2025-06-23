// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DropZone } from './DropZone';
import { useDroppable } from '@dnd-kit/core';

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn()
}));

describe('DropZone', () => {
  const mockSetNodeRef = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDroppable).mockReturnValue({
      isOver: false,
      setNodeRef: mockSetNodeRef,
      node: null,
      active: null,
      over: null,
      rect: null
    } as any);
  });

  it('should render children', () => {
    render(
      <DropZone id="test-zone">
        <div>Test Content</div>
      </DropZone>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should call useDroppable with correct id', () => {
    render(
      <DropZone id="my-drop-zone">
        <div>Content</div>
      </DropZone>
    );

    expect(useDroppable).toHaveBeenCalledWith({ id: 'my-drop-zone' });
  });

  it('should apply custom className', () => {
    render(
      <DropZone id="test" className="custom-class">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(dropZone).toHaveClass('custom-class');
  });

  it('should apply ring style when isOver is true', () => {
    vi.mocked(useDroppable).mockReturnValue({
      isOver: true,
      setNodeRef: mockSetNodeRef,
      node: null,
      active: null,
      over: null,
      rect: null
    } as any);

    render(
      <DropZone id="test">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(dropZone).toHaveClass('ring-2', 'ring-primary');
  });

  it('should not apply ring style when isOver is false', () => {
    render(
      <DropZone id="test">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(dropZone).not.toHaveClass('ring-2');
    expect(dropZone).not.toHaveClass('ring-primary');
  });

  it('should set ref using setNodeRef', () => {
    render(
      <DropZone id="test">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(mockSetNodeRef).toHaveBeenCalled();
  });

  it('should combine className with isOver styles', () => {
    vi.mocked(useDroppable).mockReturnValue({
      isOver: true,
      setNodeRef: mockSetNodeRef,
      node: null,
      active: null,
      over: null,
      rect: null
    } as any);

    render(
      <DropZone id="test" className="my-custom-class">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(dropZone).toHaveClass('my-custom-class', 'ring-2', 'ring-primary');
  });

  it('should render multiple children', () => {
    render(
      <DropZone id="test">
        <div>Child 1</div>
        <div>Child 2</div>
        <span>Child 3</span>
      </DropZone>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  it('should handle empty className prop', () => {
    render(
      <DropZone id="test" className="">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(dropZone).toBeInTheDocument();
  });

  it('should work without className prop', () => {
    render(
      <DropZone id="test">
        <div>Content</div>
      </DropZone>
    );

    const dropZone = screen.getByText('Content').parentElement;
    expect(dropZone).toBeInTheDocument();
  });
});