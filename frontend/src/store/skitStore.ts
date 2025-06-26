import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import { Skit, SkitCommand, CommandDefinition } from '../types';
import { parse } from 'yaml';
import { reservedCommands } from '../utils/reservedCommands';
import i18n from '../i18n/config';
import { loadTranslations } from '../i18n/translationLoader';

interface SkitState {
  skits: Record<string, Skit>;
  currentSkitId: string | null;
  selectedCommandIds: number[]; // 複数選択に対応するため配列に変更
  commandDefinitions: CommandDefinition[];
  commandsMap: Map<string, CommandDefinition>;
  commandsYaml: string | null; // YAMLの元データを保持しておく必要があります
  masterData: Record<string, string[]>; // マスターデータを保持
  projectPath: string | null;  // Add project path state
  validationErrors: string[];
  history: {
    past: Skit[];
    future: Skit[];
  };
  currentLanguage: string;
  availableLanguages: Array<{ code: string; name: string }>;
  
  loadSkits: (skits: Record<string, Skit>) => void;
  setCurrentSkit: (skitId: string) => void;
  selectCommand: (commandId: number | null, multiSelect?: boolean, rangeSelect?: boolean) => void;
  addCommand: (command: Omit<SkitCommand, 'id'>) => void;
  updateCommand: (commandId: number, updates: Partial<SkitCommand>) => void;
  removeCommand: (commandId: number) => void;
  removeCommands: (commandIds: number[]) => void;
  moveCommand: (fromIndex: number, toIndex: number) => void;
  moveCommands: (fromIndices: number[], toIndex: number) => void;
  duplicateCommand: (commandId: number) => void;
  saveSkit: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  setValidationErrors: (errors: string[]) => void;
  loadCommandsYaml: (yaml: string) => void;
  setProjectPath: (path: string | null) => Promise<void>;  // Add project path setter
  createGroup: () => void;
  ungroupCommands: (groupStartId: number) => void;
  toggleGroupCollapse: (groupStartId: number) => void;
  renameGroup: (groupStartId: number, newName: string) => void;
  copySelectedCommands: () => Promise<void>;
  cutSelectedCommands: () => Promise<void>;
  pasteCommandsFromClipboard: () => Promise<void>;
  changeLanguage: (language: string) => Promise<void>;
  loadAvailableLanguages: () => Promise<void>;
  openFolder: () => Promise<void>;
}

export const useSkitStore = create<SkitState>()(
  persist(
    immer((set, get) => {
    const copyOrCutCommands = async (remove: boolean) => {
      const { currentSkitId, skits, selectedCommandIds } = get();
      if (!currentSkitId) return;
      const currentSkit = skits[currentSkitId];
      if (!currentSkit) return;

      let ids = [...selectedCommandIds];
      if (ids.length === 1) {
        const index = currentSkit.commands.findIndex(cmd => cmd.id === ids[0]);
        if (index !== -1 && currentSkit.commands[index].type === 'group_start') {
          const groupIndices = getGroupCommandIndices(currentSkit.commands, index);
          ids = groupIndices.map(i => currentSkit.commands[i].id);
        }
      }

      const commands = ids
        .map(id => currentSkit.commands.find(cmd => cmd.id === id))
        .filter((cmd): cmd is SkitCommand => !!cmd);

      if (commands.length === 0) return;

      await navigator.clipboard.writeText(JSON.stringify(commands));

      if (remove) {
        set(state => {
          if (!state.currentSkitId) return;
          const skit = state.skits[state.currentSkitId];
          if (!skit) return;

          state.history.past.push(JSON.parse(JSON.stringify(skit)));
          state.history.future = [];

          skit.commands = skit.commands.filter(
            cmd => !ids.includes(cmd.id)
          );

          skit.meta.modified = new Date().toISOString();
          state.selectedCommandIds = [];
        });
      }
    };

    return {
    skits: {},
    currentSkitId: null,
    selectedCommandIds: [], // 複数選択に対応するため配列に変更
    commandDefinitions: [],
    commandsMap: new Map<string, CommandDefinition>(),
    commandsYaml: null,
    masterData: {}, // マスターデータを初期化
    projectPath: null,  // Initialize project path
    validationErrors: [],
    history: {
      past: [],
      future: [],
    },
    currentLanguage: 'ja', // デフォルトで日本語
    availableLanguages: [
      { code: 'ja', name: '日本語' },
      { code: 'en', name: 'English' },
    ],

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
          type: command.type as string,
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
      get().removeCommands([commandId]);
    },

    removeCommands: (commandIds) => {
      set((state) => {
        if (!state.currentSkitId) return;

        const currentSkit = state.skits[state.currentSkitId];
        if (!currentSkit) return;

        let ids = [...commandIds];
        if (ids.length === 1) {
          const index = currentSkit.commands.findIndex(cmd => cmd.id === ids[0]);
          if (index !== -1 && currentSkit.commands[index].type === 'group_start') {
            const groupIndices = getGroupCommandIndices(currentSkit.commands, index);
            ids = groupIndices.map(i => currentSkit.commands[i].id);
          }
        }

        state.history.past.push(JSON.parse(JSON.stringify(currentSkit)));
        state.history.future = [];

        currentSkit.commands = currentSkit.commands.filter(
          (cmd) => !ids.includes(cmd.id)
        );

        currentSkit.meta.modified = new Date().toISOString();

        state.selectedCommandIds = state.selectedCommandIds.filter(id => !ids.includes(id));
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
        
        // commandsFromStore は操作過程で変更されるため、元のskit.commandsを参照する場合は state.skits[state.currentSkitId].commands を使う
        const commandsFromStore = [...currentSkit.commands];
        const movedItems: SkitCommand[] = [];
        
        // fromIndices をソートして、後方から安全に要素を削除できるようにする
        const sortedFromIndices = [...fromIndices].sort((a, b) => a - b);
        
        // sortedFromIndices に基づいて、元の配列からアイテムを削除しつつ movedItems に収集
        for (let i = sortedFromIndices.length - 1; i >= 0; i--) {
          const fromIdx = sortedFromIndices[i];
          // commandsFromStore から直接 splice して取り出す
          const [movedItem] = commandsFromStore.splice(fromIdx, 1);
          movedItems.unshift(movedItem); // 取り出した順の逆で先頭に追加すると元の順序になる
        }
        // この時点で commandsFromStore は移動対象が取り除かれた配列
        // movedItems は移動するアイテムが元の順序で格納されている

        let insertionPoint;

        // toIndex は「ドロップ先のアイテムの元の配列におけるインデックス」
        if (toIndex >= state.skits[state.currentSkitId].commands.length) {
            // ドロップ先が元の配列の範囲外（例: リストの最後にドロップ）の場合
            insertionPoint = commandsFromStore.length; // 残ったコマンドの末尾に挿入
        } else {
            // ドロップ先が元の配列の範囲内の場合
            const dropTargetItemInOriginalArray = state.skits[state.currentSkitId].commands[toIndex];
            if (!dropTargetItemInOriginalArray) {
                // 通常ここには来ないはずだが、安全策
                console.warn(`[moveCommands] dropTargetItemInOriginalArray not found for toIndex ${toIndex}. Inserting at end of remaining.`);
                insertionPoint = commandsFromStore.length;
            } else {
                // commandsFromStore (移動アイテム削除後) の中で、ドロップ先アイテムを探す
                const indexOfDropTargetInRemaining = commandsFromStore.findIndex(cmd => cmd.id === dropTargetItemInOriginalArray.id);

                if (indexOfDropTargetInRemaining === -1) {
                    // ドロップ先アイテムが移動対象に含まれていたか、何らかの理由で見つからない場合
                    // この場合、toIndex が指していた元の位置を基準に挿入点を推測する
                    let countValidItemsBeforeToIndex = 0;
                    for(let i=0; i < toIndex; i++) {
                        const itemInOriginal = state.skits[state.currentSkitId].commands[i];
                        // commandsFromStore にまだ存在するか (つまり削除されなかったか)
                        if (commandsFromStore.find(cmd => cmd.id === itemInOriginal.id)) {
                            countValidItemsBeforeToIndex++;
                        }
                    }
                    insertionPoint = countValidItemsBeforeToIndex;
                    console.warn(`[moveCommands] Drop target (ID: ${dropTargetItemInOriginalArray.id}) not found in remaining. Inferred insertionPoint: ${insertionPoint}`);
                } else {
                    // ドロップ先アイテムが見つかった場合
                    // 移動元 (movedItems の最初の要素の元のインデックス) と toIndex を比較して、上か下かを判断
                    const originalFromIndexForMovedItems = state.skits[state.currentSkitId].commands.findIndex(cmd => cmd.id === movedItems[0].id);
                    if (originalFromIndexForMovedItems < toIndex) {
                        // 下への移動: ドロップ先アイテムの「次」の位置
                        insertionPoint = indexOfDropTargetInRemaining + 1;
                    } else {
                        // 上への移動: ドロップ先アイテムの「前」の位置 (つまり、そのアイテムの現在のインデックス)
                        insertionPoint = indexOfDropTargetInRemaining;
                    }
                }
            }
        }
        

        // 算出した挿入ポイントに movedItems を展開して挿入
        commandsFromStore.splice(insertionPoint, 0, ...movedItems);
        
        currentSkit.commands = commandsFromStore;
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
      const { currentSkitId, skits, projectPath } = useSkitStore.getState();

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
        
        // コマンド定義を含めたYAML文字列を生成する
        const yaml = await import('yaml').then(module => {
          // commandsYamlからロードした定義とreservedCommandsを結合
          const yamlObj = {
            version: 1,
            commands: [] as CommandDefinition[]
          };
          
          // まずYAMLからロードした通常のコマンド定義を追加
          const currentYaml = useSkitStore.getState().commandsYaml;
          if (currentYaml) {
            try {
              const parsed = parse(currentYaml);
              if (parsed && parsed.commands) {
                yamlObj.commands = parsed.commands;
              }
            } catch (error) {
              console.error('保存時のYAMLパースエラー:', error);
            }
          }
          
          // 次に予約済みコマンドを追加（すでに存在する場合は上書き）
          for (const reservedCmd of reservedCommands) {
            const existingIndex = yamlObj.commands.findIndex(cmd => cmd.id === reservedCmd.id);
            if (existingIndex >= 0) {
              yamlObj.commands[existingIndex] = reservedCmd;
            } else {
              yamlObj.commands.push(reservedCmd);
            }
          }
          
          return module.stringify(yamlObj);
        });
        
        const saveErrors = await saveSkitToFile(
          currentSkitId,
          currentSkit,
          yaml,
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
        
        try {
          const parsed = parse(yaml);
          // YAMLからロードしたコマンド定義
          const parsedDefinitions = parsed?.commands || [];
          
          // マスターデータを読み込む
          const masterData = parsed?.master || {};
          state.masterData = masterData;
          
          // マスターデータ参照を解決する関数
          const resolveOptions = (propertyDef: any): any => {
            if (propertyDef.options && typeof propertyDef.options === 'object' && 'master' in propertyDef.options) {
              const masterKey = propertyDef.options.master;
              if (masterData[masterKey]) {
                return {
                  ...propertyDef,
                  options: masterData[masterKey],
                  masterKey: masterKey // マスターデータキーを保持
                };
              }
              console.warn(`Master data '${masterKey}' not found`);
              return propertyDef;
            }
            return propertyDef;
          };
          
          // コマンド定義のマスターデータ参照を解決
          const resolvedDefinitions = parsedDefinitions.map((cmd: any) => {
            const resolvedProperties: Record<string, any> = {};
            for (const [key, value] of Object.entries(cmd.properties || {})) {
              resolvedProperties[key] = resolveOptions(value);
            }
            return {
              ...cmd,
              properties: resolvedProperties
            };
          });
          
          // reservedCommandsを追加
          const allDefinitions = [...resolvedDefinitions, ...reservedCommands];
          
          // コマンド定義をIDでマッピング
          const commandsMap = new Map<string, CommandDefinition>();
          allDefinitions.forEach((def: CommandDefinition) => {
            commandsMap.set(def.id, def);
          });
          
          state.commandDefinitions = allDefinitions;
          state.commandsMap = commandsMap;
        } catch (error) {
          console.error('Failed to parse commands.yaml:', error);
          // エラー時でもreservedCommandsは追加する
          state.commandDefinitions = [...reservedCommands];
          const commandsMap = new Map<string, CommandDefinition>();
          reservedCommands.forEach((def: CommandDefinition) => {
            commandsMap.set(def.id, def);
          });
          state.commandsMap = commandsMap;
          state.masterData = {};
        }
      });
    },
    
    setProjectPath: async (path) => {
      set((state) => {
        state.projectPath = path;
      });
      
      // Sync with Tauri backend if available
      if (window.__TAURI__ && path) {
        try {
          const { invoke } = await import('@tauri-apps/api');
          await invoke('set_project_path', { path });
        } catch (error) {
          console.error('Failed to sync project path with Tauri:', error);
        }
      }
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
        
        // group_endコマンドを作成
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


    copySelectedCommands: async () => {
      await copyOrCutCommands(false);
    },

    cutSelectedCommands: async () => {
      await copyOrCutCommands(true);
    },

    pasteCommandsFromClipboard: async () => {
      const text = await navigator.clipboard.readText();
      let commands: SkitCommand[];
      try {
        commands = JSON.parse(text) as SkitCommand[];
      } catch {
        return;
      }

      if (!Array.isArray(commands) || commands.length === 0) {
        return;
      }

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

        const newCommands = commands.map((cmd, index) => ({
          ...JSON.parse(JSON.stringify(cmd)),
          id: maxId + index + 1,
        }));

        let insertIndex = currentSkit.commands.length;
        if (state.selectedCommandIds.length > 0) {
          const lastSelectedId = state.selectedCommandIds[state.selectedCommandIds.length - 1];
          const pos = currentSkit.commands.findIndex((cmd) => cmd.id === lastSelectedId);
          if (pos !== -1) {
            insertIndex = pos + 1;
          }
        }

        currentSkit.commands.splice(insertIndex, 0, ...newCommands);
        currentSkit.meta.modified = new Date().toISOString();
        state.selectedCommandIds = newCommands.map((cmd) => cmd.id);
      });
    },
    
    changeLanguage: async (language: string) => {
      try {
        await i18n.changeLanguage(language);
        set((state) => {
          state.currentLanguage = language;
        });
        // Reload translations if project path is set
        const projectPath = get().projectPath;
        if (projectPath) {
          await loadTranslations();
        }
      } catch (error) {
        console.error('Failed to change language:', error);
      }
    },
    
    loadAvailableLanguages: async () => {
      try {
        const { getAvailableLanguages } = await import('../i18n/translationLoader');
        const languages = await getAvailableLanguages();
        set((state) => {
          state.availableLanguages = languages;
        });
      } catch (error) {
        console.error('Failed to load available languages:', error);
      }
    },
    
    openFolder: async () => {
      try {
        const { selectProjectFolder, loadCommandsYaml: loadCommandsYamlFile, loadSkits: loadSkitsFiles } = await import('../utils/fileSystem');
        
        // Open folder selection dialog
        const selectedPath = await selectProjectFolder();
        
        if (selectedPath) {
          // Update project path and sync with Tauri
          await get().setProjectPath(selectedPath);
          
          // Load commands.yaml from the new path
          try {
            const commandsYamlContent = await loadCommandsYamlFile(selectedPath);
            get().loadCommandsYaml(commandsYamlContent);
          } catch (error) {
            console.error('Failed to load commands.yaml:', error);
          }
          
          // Load skits from the new path
          try {
            const skits = await loadSkitsFiles(selectedPath);
            set((state) => {
              state.skits = skits;
              // Reset current skit selection
              state.currentSkitId = null;
              state.selectedCommandIds = [];
              state.history = {
                past: [],
                future: [],
              };
            });
          } catch (error) {
            console.error('Failed to load skits:', error);
          }
          
          // Reload translations for the new project
          const { loadTranslations } = await import('../i18n/translationLoader');
          await loadTranslations();
        }
      } catch (error) {
        console.error('Failed to open folder:', error);
      }
    },
    };
  }),
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
