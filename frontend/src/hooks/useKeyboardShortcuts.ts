import { useEffect } from 'react';
import { useSkitStore } from '../store/skitStore';

export function useKeyboardShortcuts() {
  const {
    selectedCommandIds,
    removeCommands,
    duplicateCommand,
    copySelectedCommands,
    cutSelectedCommands,
    pasteCommandsFromClipboard,
    undo,
    redo,
  } = useSkitStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const selection = window.getSelection();

      if (
        (active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.isContentEditable)) ||
        (selection && !selection.isCollapsed)
      ) {
        return;
      }

      const key = event.key.toLowerCase();
      const meta = event.metaKey || event.ctrlKey;

      if (meta && key === 'c') {
        event.preventDefault();
        copySelectedCommands();
      }

      if (meta && key === 'x') {
        event.preventDefault();
        cutSelectedCommands();
      }

      if (meta && key === 'v') {
        event.preventDefault();
        pasteCommandsFromClipboard();
      }

      if (key === 'delete' || key === 'backspace') {
        if (selectedCommandIds.length > 0) {
          event.preventDefault();
          removeCommands(selectedCommandIds);
        }
      }

      if (meta && key === 'd') {
        if (selectedCommandIds.length > 0) {
          event.preventDefault();
          duplicateCommand(selectedCommandIds[0]);
        }
      }

      if (meta && !event.shiftKey && key === 'z') {
        event.preventDefault();
        undo();
      }

      if (meta && (key === 'y' || (event.shiftKey && key === 'z'))) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedCommandIds,
    removeCommands,
    duplicateCommand,
    copySelectedCommands,
    cutSelectedCommands,
    pasteCommandsFromClipboard,
    undo,
    redo,
  ]);
}
