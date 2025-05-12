import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { Skit, SkitCommand } from '../types';

interface SkitState {
  skits: Record<string, Skit>;
  currentSkitId: string | null;
  selectedCommandIds: number[]; // 複数選択に対応するため配列に変更
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
  moveCommands: (fromIndices: number[], toIndex: number) => void;
  duplicateCommand: (commandId: number) => void;
  saveSkit: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  setValidationErrors: (errors: string[]) => void;
  loadCommandsYaml: (yaml: string) => void;
  setProjectPath: (path: string | null) => void;  // Add project path setter
  createGroup: () => void;
  ungroupCommands: (groupStartId: number) => void;
  toggleGroupCollapse: (groupStartId: number) => void;
  renameGroup: (groupStartId: number, newName: string) => void;
}

export const useSkitStore = create<SkitState>()(
  persist(
    immer((set) => ({
    skits: {},
    currentSkitId: null,
    selectedCommandIds: [], // 複数選択に対応するため配列に変更
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
    
    moveCommands: (fromIndices: number[], toIndex: number) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        if (fromIndices.length === 0) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const commands = [...currentSkit.commands];
        const movedCommands: SkitCommand[] = [];
        
        const sortedIndices = [...fromIndices].sort((a, b) => a - b);
        
        let offset = 0;
        for (const idx of sortedIndices) {
          if (idx < toIndex) {
            offset++;
          }
        }
        
        for (let i = sortedIndices.length - 1; i >= 0; i--) {
          const fromIndex = sortedIndices[i];
          const [movedCommand] = commands.splice(fromIndex, 1);
          movedCommands.unshift(movedCommand); // 削除した順と逆順で保存
        }
        
        const adjustedToIndex = Math.max(0, toIndex - offset);
        commands.splice(adjustedToIndex, 0, ...movedCommands);
        
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
        
        const lastSelectedIndex = currentSkit.commands.findIndex(
          cmd => cmd.id === selectedCommands[selectedCommands.length - 1].id
        );
        
        const startCommand = {
          id: maxId + 1,
          type: 'group_start',
          groupName: '新しいグループ',
          isCollapsed: false
        };
        
        const endCommand = {
          id: maxId + 2,
          type: 'group_end'
        };
        
        currentSkit.commands.splice(firstSelectedIndex, 0, startCommand);
        currentSkit.commands.splice(lastSelectedIndex + 2, 0, endCommand);
        
        currentSkit.meta.modified = new Date().toISOString();
        
        state.selectedCommandIds = [startCommand.id];
      });
    },
    
    ungroupCommands: (groupStartId) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const startIndex = currentSkit.commands.findIndex(cmd => cmd.id === groupStartId);
        if (startIndex === -1 || currentSkit.commands[startIndex].type !== 'group_start') return;
        
        let nestLevel = 1;
        let endIndex = -1;
        
        for (let i = startIndex + 1; i < currentSkit.commands.length; i++) {
          const cmd = currentSkit.commands[i];
          if (cmd.type === 'group_start') {
            nestLevel++;
          } else if (cmd.type === 'group_end') {
            nestLevel--;
            if (nestLevel === 0) {
              endIndex = i;
              break;
            }
          }
        }
        
        if (endIndex === -1) return;
        
        currentSkit.commands.splice(endIndex, 1);
        currentSkit.commands.splice(startIndex, 1);
        
        currentSkit.meta.modified = new Date().toISOString();
        
        state.selectedCommandIds = [];
      });
    },
    
    toggleGroupCollapse: (groupStartId) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        const groupIndex = currentSkit.commands.findIndex(
          cmd => cmd.id === groupStartId && cmd.type === 'group_start'
        );
        
        if (groupIndex === -1) return;
        
        currentSkit.commands[groupIndex].isCollapsed = !currentSkit.commands[groupIndex].isCollapsed;
      });
    },
    
    renameGroup: (groupStartId, newName) => {
      set((state) => {
        if (!state.currentSkitId) return;
        
        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;
        
        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];
        
        const groupIndex = currentSkit.commands.findIndex(
          cmd => cmd.id === groupStartId && cmd.type === 'group_start'
        );
        
        if (groupIndex === -1) return;
        
        currentSkit.commands[groupIndex].groupName = newName;
        
        currentSkit.meta.modified = new Date().toISOString();
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

export const getGroupCommandIndices = (commands: SkitCommand[], groupStartIndex: number): number[] => {
  const indices: number[] = [groupStartIndex];
  let nestLevel = 1;
  
  for (let i = groupStartIndex + 1; i < commands.length; i++) {
    const cmd = commands[i];
    
    if (cmd.type === 'group_start') {
      nestLevel++;
    } else if (cmd.type === 'group_end') {
      nestLevel--;
      if (nestLevel === 0) {
        indices.push(i); // グループエンドも含める
        break;
      }
    }
    
    indices.push(i);
  }
  
  return indices;
};

export const getTopLevelGroups = (commands: SkitCommand[], selectedIndices: number[]): number[] => {
  return selectedIndices.filter(index => {
    const cmd = commands[index];
    if (cmd.type !== 'group_start') return false;
    
    for (const otherIndex of selectedIndices) {
      if (otherIndex === index) continue;
      
      const otherCmd = commands[otherIndex];
      if (otherCmd.type !== 'group_start') continue;
      
      const groupIndices = getGroupCommandIndices(commands, otherIndex);
      if (groupIndices.includes(index)) {
        return false; // 他のグループに含まれている
      }
    }
    
    return true; // 他のどのグループにも含まれていない
  });
};
