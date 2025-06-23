// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useSkitStore } from '../store/skitStore';

// Mock dependencies
vi.mock('../store/skitStore');

describe('useKeyboardShortcuts', () => {
  const mockRemoveCommands = vi.fn();
  const mockDuplicateCommand = vi.fn();
  const mockCopySelectedCommands = vi.fn();
  const mockCutSelectedCommands = vi.fn();
  const mockPasteCommandsFromClipboard = vi.fn();
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();
  const mockSelectedCommandIds = [1, 2, 3];
  
  let keydownHandler: EventListener;

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useSkitStore).mockReturnValue({
      selectedCommandIds: mockSelectedCommandIds,
      removeCommands: mockRemoveCommands,
      duplicateCommand: mockDuplicateCommand,
      copySelectedCommands: mockCopySelectedCommands,
      cutSelectedCommands: mockCutSelectedCommands,
      pasteCommandsFromClipboard: mockPasteCommandsFromClipboard,
      undo: mockUndo,
      redo: mockRedo,
    } as any);
    
    // Capture the keydown handler when addEventListener is called
    const originalAddEventListener = window.addEventListener;
    vi.spyOn(window, 'addEventListener').mockImplementation((event, handler, options) => {
      if (event === 'keydown') {
        keydownHandler = handler as EventListener;
      }
      return originalAddEventListener.call(window, event, handler, options);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  const simulateKeydown = (key: string, options: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', {
      key,
      ...options,
    });
    
    // Mock preventDefault
    event.preventDefault = vi.fn();
    
    if (keydownHandler) {
      keydownHandler(event);
    }
    
    return event;
  };

  it('should add keydown event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    renderHook(() => useKeyboardShortcuts());
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove keydown event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should handle copy command (Cmd/Ctrl+C)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('c', { metaKey: true });
    
    expect(mockCopySelectedCommands).toHaveBeenCalledTimes(1);
  });

  it('should handle cut command (Cmd/Ctrl+X)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('x', { ctrlKey: true });
    
    expect(mockCutSelectedCommands).toHaveBeenCalledTimes(1);
  });

  it('should handle paste command (Cmd/Ctrl+V)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('v', { metaKey: true });
    
    expect(mockPasteCommandsFromClipboard).toHaveBeenCalledTimes(1);
  });

  it('should handle delete key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('Delete');
    
    expect(mockRemoveCommands).toHaveBeenCalledWith(mockSelectedCommandIds);
  });

  it('should handle backspace key', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('Backspace');
    
    expect(mockRemoveCommands).toHaveBeenCalledWith(mockSelectedCommandIds);
  });

  it('should not delete when no commands selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      selectedCommandIds: [],
      removeCommands: mockRemoveCommands,
      duplicateCommand: mockDuplicateCommand,
      copySelectedCommands: mockCopySelectedCommands,
      cutSelectedCommands: mockCutSelectedCommands,
      pasteCommandsFromClipboard: mockPasteCommandsFromClipboard,
      undo: mockUndo,
      redo: mockRedo,
    } as any);
    
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('Delete');
    
    expect(mockRemoveCommands).not.toHaveBeenCalled();
  });

  it('should handle duplicate command (Cmd/Ctrl+D)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('d', { metaKey: true });
    
    expect(mockDuplicateCommand).toHaveBeenCalledWith(1); // First selected command
  });

  it('should not duplicate when no commands selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      selectedCommandIds: [],
      removeCommands: mockRemoveCommands,
      duplicateCommand: mockDuplicateCommand,
      copySelectedCommands: mockCopySelectedCommands,
      cutSelectedCommands: mockCutSelectedCommands,
      pasteCommandsFromClipboard: mockPasteCommandsFromClipboard,
      undo: mockUndo,
      redo: mockRedo,
    } as any);
    
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('d', { metaKey: true });
    
    expect(mockDuplicateCommand).not.toHaveBeenCalled();
  });

  it('should handle undo (Cmd/Ctrl+Z)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('z', { ctrlKey: true });
    
    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it('should handle redo (Cmd/Ctrl+Y)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('y', { metaKey: true });
    
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });

  it('should handle redo (Cmd/Ctrl+Shift+Z)', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('z', { metaKey: true, shiftKey: true });
    
    expect(mockRedo).toHaveBeenCalledTimes(1);
  });

  it('should ignore shortcuts when input element is focused', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    
    simulateKeydown('c', { metaKey: true });
    
    expect(mockCopySelectedCommands).not.toHaveBeenCalled();
    
    document.body.removeChild(input);
  });

  it('should ignore shortcuts when textarea element is focused', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.focus();
    
    simulateKeydown('x', { ctrlKey: true });
    
    expect(mockCutSelectedCommands).not.toHaveBeenCalled();
    
    document.body.removeChild(textarea);
  });


  it('should ignore shortcuts when text is selected', () => {
    renderHook(() => useKeyboardShortcuts());
    
    // Mock getSelection to return a non-collapsed selection
    const mockSelection = {
      isCollapsed: false,
    };
    vi.spyOn(window, 'getSelection').mockReturnValue(mockSelection as any);
    
    const event = new KeyboardEvent('keydown', {
      key: 'c',
      metaKey: true,
    });
    
    window.dispatchEvent(event);
    
    expect(mockCopySelectedCommands).not.toHaveBeenCalled();
  });

  it('should work with uppercase keys', () => {
    renderHook(() => useKeyboardShortcuts());
    
    simulateKeydown('C', { metaKey: true });
    
    expect(mockCopySelectedCommands).toHaveBeenCalledTimes(1);
  });

  it('should prevent default for handled shortcuts', () => {
    renderHook(() => useKeyboardShortcuts());
    
    const event = simulateKeydown('z', { metaKey: true });
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(mockUndo).toHaveBeenCalled();
  });

});