import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { Skit, SkitCommand } from '../types';

interface SkitState {
  skits: Record<string, Skit>;
  currentSkitId: string | null;
  selectedCommandId: number | null;
  commandsYaml: string | null;
  projectPath: string | null;  // Add project path state
  validationErrors: string[];
  history: {
    past: Skit[];
    future: Skit[];
  };
  
  loadSkits: (skits: Record<string, Skit>) => void;
  setCurrentSkit: (skitId: string) => void;
  selectCommand: (commandId: number | null) => void;
  addCommand: (command: Omit<SkitCommand, 'id'>) => void;
  updateCommand: (commandId: number, updates: Partial<SkitCommand>) => void;
  removeCommand: (commandId: number) => void;
  moveCommand: (fromIndex: number, toIndex: number) => void;
  duplicateCommand: (commandId: number) => void;
  saveSkit: () => void;
  undo: () => void;
  redo: () => void;
  setValidationErrors: (errors: string[]) => void;
  loadCommandsYaml: (yaml: string) => void;
  setProjectPath: (path: string | null) => void;  // Add project path setter
}

export const useSkitStore = create<SkitState>()(
  persist(
    immer((set) => ({
    skits: {},
    currentSkitId: null,
    selectedCommandId: null,
    commandsYaml: null,
    projectPath: null,  // Initialize project path
    validationErrors: [],
    history: {
      past: [],
      future: [],
    },

    loadSkits: (skits) => {
      set((state) => {
        state.skits = skits;
      });
    },

    setCurrentSkit: (skitId) => {
      set((state) => {
        state.currentSkitId = skitId;
        state.selectedCommandId = null;
        state.history = {
          past: [],
          future: [],
        };
      });
    },

    selectCommand: (commandId) => {
      set((state) => {
        state.selectedCommandId = commandId;
      });
    },

    addCommand: (command) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const maxId = currentSkit.commands.reduce(
          (max, cmd) => Math.max(max, cmd.id),
          0
        );
        
        const newCommand: SkitCommand = {
          ...command,
          id: maxId + 1,
          type: command.type,
        };
        
        currentSkit.commands.push(newCommand);
        currentSkit.meta.modified = new Date().toISOString();
        state.selectedCommandId = newCommand.id;
      });
    },

    updateCommand: (commandId, updates) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const commandIndex = currentSkit.commands.findIndex(
          (cmd) => cmd.id === commandId
        );
        
        if (commandIndex === -1) return;
        
        currentSkit.commands[commandIndex] = {
          ...currentSkit.commands[commandIndex],
          ...updates,
        };
        
        currentSkit.meta.modified = new Date().toISOString();
      });
    },

    removeCommand: (commandId) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        currentSkit.commands = currentSkit.commands.filter(
          (cmd) => cmd.id !== commandId
        );
        
        currentSkit.meta.modified = new Date().toISOString();
        
        if (state.selectedCommandId === commandId) {
          state.selectedCommandId = null;
        }
      });
    },

    moveCommand: (fromIndex, toIndex) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const commands = [...currentSkit.commands];
        const [movedCommand] = commands.splice(fromIndex, 1);
        commands.splice(toIndex, 0, movedCommand);
        
        currentSkit.commands = commands;
        currentSkit.meta.modified = new Date().toISOString();
      });
    },

    duplicateCommand: (commandId) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const commandToDuplicate = currentSkit.commands.find(
          (cmd) => cmd.id === commandId
        );
        
        if (!commandToDuplicate) return;
        
        const maxId = currentSkit.commands.reduce(
          (max, cmd) => Math.max(max, cmd.id),
          0
        );
        
        const duplicatedCommand = {
          ...JSON.parse(JSON.stringify(commandToDuplicate)),
          id: maxId + 1,
        };
        
        const index = currentSkit.commands.findIndex(
          (cmd) => cmd.id === commandId
        );
        
        currentSkit.commands.splice(index + 1, 0, duplicatedCommand);
        currentSkit.meta.modified = new Date().toISOString();
        state.selectedCommandId = duplicatedCommand.id;
      });
    },

    saveSkit: () => {
      set(async (state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        currentSkit.meta.modified = new Date().toISOString();
        
        try {
          const { validateSkitData } = await import('../utils/validation');
          const { saveSkit: saveSkitToFile } = await import('../utils/fileSystem');
          
          const errors = validateSkitData(currentSkit);
          
          if (errors.length > 0) {
            state.validationErrors = errors;
            return;
          }
          
          try {
            const saveErrors = await saveSkitToFile(
              state.currentSkitId,
              currentSkit,
              state.commandsYaml || ''
            );
            
            if (saveErrors.length > 0) {
              state.validationErrors = saveErrors;
            } else {
              state.validationErrors = [];
            }
          } catch (error) {
            console.error('Failed to save skit:', error);
            state.validationErrors = [`Failed to save skit: ${error instanceof Error ? error.message : String(error)}`];
          }
        } catch (error) {
          console.error('Failed to validate skit:', error);
          state.validationErrors = [`Failed to validate skit: ${error instanceof Error ? error.message : String(error)}`];
        }
      });
    },

    undo: () => {
      set((state) => {
        if (!state.currentSkitId || state.history.past.length === 0) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.future.unshift(JSON.parse(JSON.stringify(currentSkit)));
        
        const previousState = state.history.past.pop();
        if (previousState) {
          state.skits[state.currentSkitId] = previousState;
        }
      });
    },

    redo: () => {
      set((state) => {
        if (!state.currentSkitId || state.history.future.length === 0) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        
        const nextState = state.history.future.shift();
        if (nextState) {
          state.skits[state.currentSkitId] = nextState;
        }
      });
    },

    setValidationErrors: (errors) => {
      set((state) => {
        state.validationErrors = errors;
      });
    },

    loadCommandsYaml: (yaml) => {
      set((state) => {
        state.commandsYaml = yaml;
      });
    },
    
    setProjectPath: (path) => {
      set((state) => {
        state.projectPath = path;
      });
    },
  })),
  {
    name: 'skit-editor-storage',
    partialize: (state) => ({ 
      projectPath: state.projectPath 
    }),
  }
));
