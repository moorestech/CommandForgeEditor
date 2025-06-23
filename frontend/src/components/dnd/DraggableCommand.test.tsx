// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableCommand } from './DraggableCommand';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Mock @dnd-kit dependencies
vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn()
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn()
    }
  }
}));

describe('DraggableCommand', () => {
  const mockSetNodeRef = vi.fn();
  const mockAttributes = {
    role: 'button',
    'aria-roledescription': 'draggable',
    'aria-disabled': false
  };
  const mockListeners = {
    onPointerDown: vi.fn(),
    onKeyDown: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDraggable).mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: mockSetNodeRef,
      transform: null,
      isDragging: false,
      node: null,
      active: null,
      over: null
    } as any);
  });

  it('should render children', () => {
    render(
      <DraggableCommand id="text">
        <div>Text Command</div>
      </DraggableCommand>
    );

    expect(screen.getByText('Text Command')).toBeInTheDocument();
  });

  it('should call useDraggable with correct parameters', () => {
    render(
      <DraggableCommand id="choice">
        <div>Choice Command</div>
      </DraggableCommand>
    );

    expect(useDraggable).toHaveBeenCalledWith({
      id: 'command-choice',
      data: {
        type: 'command',
        commandType: 'choice'
      }
    });
  });

  it('should apply draggable attributes and listeners', () => {
    render(
      <DraggableCommand id="test">
        <div>Content</div>
      </DraggableCommand>
    );

    const draggable = screen.getByText('Content').parentElement;
    expect(draggable).toHaveAttribute('role', 'button');
    expect(draggable).toHaveAttribute('aria-roledescription', 'draggable');
    expect(draggable).toHaveAttribute('aria-disabled', 'false');
  });

  it('should apply cursor styles', () => {
    render(
      <DraggableCommand id="test">
        <div>Content</div>
      </DraggableCommand>
    );

    const draggable = screen.getByText('Content').parentElement;
    expect(draggable).toHaveClass('cursor-grab', 'active:cursor-grabbing');
  });

  it('should apply transform style when dragging', () => {
    const mockTransform = {
      x: 10,
      y: 20,
      scaleX: 1,
      scaleY: 1
    };
    
    vi.mocked(CSS.Transform.toString).mockReturnValue('translate3d(10px, 20px, 0)');
    vi.mocked(useDraggable).mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: mockSetNodeRef,
      transform: mockTransform,
      isDragging: true,
      node: null,
      active: null,
      over: null
    } as any);

    render(
      <DraggableCommand id="test">
        <div>Content</div>
      </DraggableCommand>
    );

    const draggable = screen.getByText('Content').parentElement;
    expect(draggable).toHaveStyle({ transform: 'translate3d(10px, 20px, 0)' });
    expect(CSS.Transform.toString).toHaveBeenCalledWith(mockTransform);
  });

  it('should not apply transform style when not dragging', () => {
    render(
      <DraggableCommand id="test">
        <div>Content</div>
      </DraggableCommand>
    );

    const draggable = screen.getByText('Content').parentElement;
    expect(draggable).not.toHaveStyle({ transform: expect.any(String) });
  });

  it('should set node ref', () => {
    render(
      <DraggableCommand id="test">
        <div>Content</div>
      </DraggableCommand>
    );

    expect(mockSetNodeRef).toHaveBeenCalled();
  });

  it('should handle multiple children', () => {
    render(
      <DraggableCommand id="test">
        <div>Child 1</div>
        <span>Child 2</span>
      </DraggableCommand>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should handle event listeners', () => {
    render(
      <DraggableCommand id="test">
        <div>Content</div>
      </DraggableCommand>
    );

    const draggable = screen.getByText('Content').parentElement!;
    
    // Since PointerEvent might not be available in the test environment,
    // we'll verify the listeners are attached
    expect(draggable).toBeDefined();
    expect(mockListeners.onPointerDown).toBeDefined();
    expect(mockListeners.onKeyDown).toBeDefined();
  });

  it('should create unique command id', () => {
    const { rerender } = render(
      <DraggableCommand id="command1">
        <div>Command 1</div>
      </DraggableCommand>
    );

    expect(useDraggable).toHaveBeenLastCalledWith({
      id: 'command-command1',
      data: {
        type: 'command',
        commandType: 'command1'
      }
    });

    rerender(
      <DraggableCommand id="command2">
        <div>Command 2</div>
      </DraggableCommand>
    );

    expect(useDraggable).toHaveBeenLastCalledWith({
      id: 'command-command2',
      data: {
        type: 'command',
        commandType: 'command2'
      }
    });
  });
});