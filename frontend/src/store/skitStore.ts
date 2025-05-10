import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { Skit, SkitCommand } from '../types';

interface SkitState {
  skits: Record<string, Skit>;
  currentSkitId: string | null;
  selectedCommandIds: number[];
  commandsYaml: string | null;
  projectPath: string | null;  // Add project path state
  validationErrors: string[];
  history: {
    past: Skit[];
    future: Skit[];
  };
  
  loadSkits: (skits: Record<string, Skit>) => void;
  setCurrentSkit: (skitId: string) => void;
  selectCommand: (commandId: number | null, multiSelect?: boolean, rangeSelect?: boolean) => void;
  addCommand: (command: Omit<SkitCommand, 'id'>) => void;
  updateCommand: (commandId: number, updates: Partial<SkitCommand>) => void;
  removeCommand: (commandId: number) => void;
  moveCommand: (fromIndex: number, toIndex: number) => void;
  duplicateCommand: (commandId: number) => void;
  createGroup: () => void;
  ungroupCommands: (groupId: number) => void;
  toggleGroupCollapse: (groupId: number) => void;
  renameGroup: (groupId: number, newName: string) => void;
  saveSkit: () => Promise<void>;
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
    selectedCommandIds: [],
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
        state.selectedCommandIds = [];
        state.history = {
          past: [],
          future: [],
        };
      });
    },

    selectCommand: (commandId, multiSelect = false, rangeSelect = false) => {
      set((state) => {
        if (!state.currentSkitId) return;
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;

        if (commandId === null) {
          state.selectedCommandIds = [];
          return;
        }

        if (multiSelect) {
          const index = state.selectedCommandIds.indexOf(commandId);
          if (index === -1) {
            state.selectedCommandIds.push(commandId);
          } else {
            state.selectedCommandIds.splice(index, 1);
          }
        } else if (rangeSelect && state.selectedCommandIds.length > 0) {
          const lastSelectedId = state.selectedCommandIds[state.selectedCommandIds.length - 1];
          const commands = currentSkit.commands;
          
          const lastIndex = commands.findIndex(cmd => cmd.id === lastSelectedId);
          const currentIndex = commands.findIndex(cmd => cmd.id === commandId);
          
          if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            
            const rangeIds = commands.slice(start, end + 1).map(cmd => cmd.id);
            
            const newSelection = [...new Set([...state.selectedCommandIds, ...rangeIds])];
            state.selectedCommandIds = newSelection;
          }
        } else {
          state.selectedCommandIds = [commandId];
        }
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
        state.selectedCommandIds = [newCommand.id];
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
        
        state.selectedCommandIds = state.selectedCommandIds.filter(id => id !== commandId);
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
        state.selectedCommandIds = [duplicatedCommand.id];
      });
    },
    
    createGroup: () => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        if (state.selectedCommandIds.length === 0) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const maxId = currentSkit.commands.reduce(
          (max, cmd) => Math.max(max, cmd.id),
          0
        );
        
        const groupCommand: SkitCommand = {
          id: maxId + 1,
          type: 'group',
          isGroup: true,
          groupName: '新しいグループ', // Default group name
          isCollapsed: false,
        };
        
        const selectedCommands = currentSkit.commands.filter(cmd => 
          state.selectedCommandIds.includes(cmd.id)
        );
        
        if (selectedCommands.length === 0) return;
        
        selectedCommands.sort((a, b) => {
          const indexA = currentSkit.commands.findIndex(cmd => cmd.id === a.id);
          const indexB = currentSkit.commands.findIndex(cmd => cmd.id === b.id);
          return indexA - indexB;
        });
        
        const firstSelectedIndex = currentSkit.commands.findIndex(
          cmd => cmd.id === selectedCommands[0].id
        );
        
        currentSkit.commands.splice(firstSelectedIndex, 0, groupCommand);
        
        // Update the parentId of all selected commands
        for (const cmd of currentSkit.commands) {
          if (state.selectedCommandIds.includes(cmd.id)) {
            cmd.parentId = groupCommand.id;
          }
        }
        
        currentSkit.meta.modified = new Date().toISOString();
        
        state.selectedCommandIds = [groupCommand.id];
      });
    },
    
    ungroupCommands: (groupId) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const groupCommand = currentSkit.commands.find(cmd => cmd.id === groupId && cmd.isGroup);
        if (!groupCommand) return;
        
        for (const cmd of currentSkit.commands) {
          if (cmd.parentId === groupId) {
            delete cmd.parentId;
          }
        }
        
        currentSkit.commands = currentSkit.commands.filter(cmd => cmd.id !== groupId);
        
        currentSkit.meta.modified = new Date().toISOString();
        
        state.selectedCommandIds = [];
      });
    },
    
    toggleGroupCollapse: (groupId) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        const groupIndex = currentSkit.commands.findIndex(cmd => cmd.id === groupId && cmd.isGroup);
        if (groupIndex === -1) return;
        
        currentSkit.commands[groupIndex].isCollapsed = !currentSkit.commands[groupIndex].isCollapsed;
      });
    },
    
    renameGroup: (groupId, newName) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const groupIndex = currentSkit.commands.findIndex(cmd => cmd.id === groupId && cmd.isGroup);
        if (groupIndex === -1) return;
        
        // Update the group name
        currentSkit.commands[groupIndex].groupName = newName;
        
        currentSkit.meta.modified = new Date().toISOString();
      });
    },

    saveSkit: async () => {
      const { currentSkitId, skits, commandsYaml, projectPath } = useSkitStore.getState();

      if (!currentSkitId) {
        throw new Error('スキットが選択されていません');
      }

      const currentSkit = skits[currentSkitId];
      if (!currentSkit) {
        throw new Error('選択されたスキットが見つかりません');
      }

      // Update modification timestamp synchronously
      set((state) => {
        if (state.skits[currentSkitId]) {
          state.skits[currentSkitId].meta.modified = new Date().toISOString();
        }
      });

      try {
        const { validateSkitData } = await import('../utils/validation');
        const { saveSkit: saveSkitToFile } = await import('../utils/fileSystem');

        const validationErrors = validateSkitData(currentSkit);

        if (validationErrors.length > 0) {
          set((state) => {
            state.validationErrors = validationErrors;
          });
          throw new Error(`バリデーションエラー: ${validationErrors.join(', ')}`);
        }

        const saveErrors = await saveSkitToFile(
          currentSkitId,
          currentSkit,
          commandsYaml || '',
          projectPath
        );

        if (saveErrors.length > 0) {
          set((state) => {
            state.validationErrors = saveErrors;
          });
          throw new Error(`保存エラー: ${saveErrors.join(', ')}`);
        }

        set((state) => {
          state.validationErrors = [];
        });
      } catch (error) {
        console.error('Failed to save or validate skit:', error);
        set((state) => {
          state.validationErrors = [
            `Failed to save or validate skit: ${error instanceof Error ? error.message : String(error)}`,
          ];
        });
        throw error; // Re-throw the error to be caught by the caller
      }
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
