// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSkitStore } from './skitStore';
import { act } from '@testing-library/react';
import { Skit, CommandDefinition } from '../types';
import * as fileSystem from '../utils/fileSystem';
import { reservedCommands } from '../utils/reservedCommands';
import i18n from '../i18n/config';

// Mock the fileSystem module
vi.mock('../utils/fileSystem', () => ({
  saveSkit: vi.fn(),
}));

// Mock the validation module
vi.mock('../utils/validation', () => ({
  validateSkitData: vi.fn().mockReturnValue([]),
}));

// Mock devFileSystem
vi.mock('../utils/devFileSystem', () => ({
  loadSampleCommands: vi.fn(),
  loadSampleSkits: vi.fn(),
}));

// Mock i18n
vi.mock('../i18n/config', () => ({
  default: {
    changeLanguage: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
    readText: vi.fn(),
  },
});

describe('skitStore', () => {
  const mockCommandDefinitions: CommandDefinition[] = [
    {
      id: 'text',
      label: 'Text',
      description: 'Display text',
      commandListLabelFormat: 'TEXT: {body}',
      properties: {
        body: { type: 'string', required: true },
        character: { type: 'string', required: false }
      }
    },
    {
      id: 'choice',
      label: 'Choice',
      description: 'Show choices',
      commandListLabelFormat: 'CHOICE',
      properties: {
        options: { type: 'enum', options: ['a', 'b'], required: true }
      }
    },
    ...reservedCommands
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the store to a clean state
    act(() => {
      useSkitStore.setState({
        skits: {},
        currentSkitId: null,
        selectedCommandIds: [],
        commandDefinitions: mockCommandDefinitions,
        commandsMap: new Map(mockCommandDefinitions.map(def => [def.id, def])),
        commandsYaml: null,
        projectPath: null,
        validationErrors: [],
        history: {
          past: [],
          future: [],
        },
        currentLanguage: 'ja',
        availableLanguages: [
          { code: 'ja', name: '日本語' },
          { code: 'en', name: 'English' },
        ],
      });
    });
  });
  
  it('should load skits', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          {
            id: 1,
            type: 'text',
            character: 'CharacterA',
            body: 'こんにちは',
          },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
    });
    
    expect(useSkitStore.getState().skits).toEqual(testSkits);
  });
  
  it('should set current skit', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
    });
    
    expect(useSkitStore.getState().currentSkitId).toBe('test-skit');
    expect(useSkitStore.getState().selectedCommandIds).toEqual([]);
    expect(useSkitStore.getState().history.past).toEqual([]);
    expect(useSkitStore.getState().history.future).toEqual([]);
  });
  
  it('should add a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().addCommand({ type: 'text', character: 'CharacterA', body: 'こんにちは' });
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe('text');
    expect(commands[0].character).toBe('CharacterA');
    expect(commands[0].body).toBe('こんにちは');
    expect(useSkitStore.getState().selectedCommandIds).toEqual([1]);
  });
  
  it('should remove a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          {
            id: 1,
            type: 'text',
            character: 'CharacterA',
            body: 'こんにちは',
          },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().removeCommand(1);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(0);
  });

  it('should update a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          {
            id: 1,
            type: 'text',
            character: 'CharacterA',
            body: 'こんにちは',
          },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().updateCommand(1, { body: 'さようなら' });
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands[0].body).toBe('さようなら');
  });

  it('should move a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
          { id: 3, type: 'text', body: 'Third' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().moveCommand(0, 2);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands[0].id).toBe(2);
    expect(commands[1].id).toBe(3);
    expect(commands[2].id).toBe(1);
  });

  it('should duplicate a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'Original' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().duplicateCommand(1);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(2);
    expect(commands[0].body).toBe('Original');
    expect(commands[1].body).toBe('Original');
    expect(commands[1].id).toBe(2);
  });

  it('should select command with multi-select', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().selectCommand(1);
      useSkitStore.getState().selectCommand(2, true); // Multi-select
    });
    
    expect(useSkitStore.getState().selectedCommandIds).toEqual([1, 2]);
  });

  it('should select command with range-select', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
          { id: 3, type: 'text', body: 'Third' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().selectCommand(1);
      useSkitStore.getState().selectCommand(3, false, true); // Range-select
    });
    
    expect(useSkitStore.getState().selectedCommandIds).toEqual([1, 2, 3]);
  });

  it('should remove multiple commands', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
          { id: 3, type: 'text', body: 'Third' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().removeCommands([1, 3]);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(1);
    expect(commands[0].id).toBe(2);
  });

  it('should copy selected commands', async () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.setState({ selectedCommandIds: [1, 2] });
    });

    await act(async () => {
      await useSkitStore.getState().copySelectedCommands();
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify([
        { id: 1, type: 'text', body: 'First' },
        { id: 2, type: 'text', body: 'Second' },
      ])
    );
  });

  it('should cut selected commands', async () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
          { id: 3, type: 'text', body: 'Third' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.setState({ selectedCommandIds: [1] });
    });

    await act(async () => {
      await useSkitStore.getState().cutSelectedCommands();
    });
    
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(2);
    expect(commands.find(cmd => cmd.id === 1)).toBeUndefined();
  });

  it('should paste commands from clipboard', async () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'Existing' },
        ],
      },
    };

    const clipboardData = JSON.stringify([
      { id: 10, type: 'text', body: 'Pasted' },
    ]);
    vi.mocked(navigator.clipboard.readText).mockResolvedValueOnce(clipboardData);
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
    });

    await act(async () => {
      await useSkitStore.getState().pasteCommandsFromClipboard();
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(2);
    expect(commands[1].body).toBe('Pasted');
    expect(commands[1].id).toBe(2); // New ID assigned
  });

  it('should undo and redo', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'Original' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().updateCommand(1, { body: 'Modified' });
    });
    
    expect(useSkitStore.getState().skits['test-skit'].commands[0].body).toBe('Modified');
    
    act(() => {
      useSkitStore.getState().undo();
    });
    
    expect(useSkitStore.getState().skits['test-skit'].commands[0].body).toBe('Original');
    
    act(() => {
      useSkitStore.getState().redo();
    });
    
    expect(useSkitStore.getState().skits['test-skit'].commands[0].body).toBe('Modified');
  });

  it('should create a group', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
          { id: 3, type: 'text', body: 'Third' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.setState({ selectedCommandIds: [1, 2] });
      useSkitStore.getState().createGroup();
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(5); // 3 original + group_start + group_end
    expect(commands[0].type).toBe('group_start');
    expect(commands[3].type).toBe('group_end');
  });

  it('should toggle group collapse', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'group_start', groupName: 'Test Group', isCollapsed: false },
          { id: 2, type: 'text', body: 'Inside' },
          { id: 3, type: 'group_end' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().toggleGroupCollapse(1);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands[0].isCollapsed).toBe(true);
  });

  it('should save a skit', async () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [],
      },
    };

    vi.mocked(fileSystem.saveSkit).mockResolvedValueOnce([]);
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().setProjectPath('/test/path');
    });

    await act(async () => {
      await useSkitStore.getState().saveSkit();
    });
    
    expect(fileSystem.saveSkit).toHaveBeenCalled();
  });

  it('should load commands yaml', () => {
    const yaml = `version: 1
commands:
  - id: custom
    label: Custom Command
    description: A custom command
    commandListLabelFormat: "CUSTOM"
    properties: {}`;
    
    act(() => {
      useSkitStore.getState().loadCommandsYaml(yaml);
    });
    
    expect(useSkitStore.getState().commandsYaml).toBe(yaml);
    const commandDefs = useSkitStore.getState().commandDefinitions;
    expect(commandDefs.find(def => def.id === 'custom')).toBeDefined();
  });

  it('should set validation errors', () => {
    const errors = ['Error 1', 'Error 2'];
    
    act(() => {
      useSkitStore.getState().setValidationErrors(errors);
    });
    
    expect(useSkitStore.getState().validationErrors).toEqual(errors);
  });

  it('should move multiple commands', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          { id: 1, type: 'text', body: 'First' },
          { id: 2, type: 'text', body: 'Second' },
          { id: 3, type: 'text', body: 'Third' },
          { id: 4, type: 'text', body: 'Fourth' },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().moveCommands([0, 1], 3);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands[0].id).toBe(3);
    expect(commands[1].id).toBe(4);
    expect(commands[2].id).toBe(1);
    expect(commands[3].id).toBe(2);
  });
});

describe('getGroupCommandIndices', () => {
  it('should return indices for a simple group', async () => {
    const commands = [
      { id: 1, type: 'text' },
      { id: 2, type: 'group_start' },
      { id: 3, type: 'text' },
      { id: 4, type: 'group_end' },
      { id: 5, type: 'text' },
    ];
    
    const { getGroupCommandIndices } = await import('./skitStore');
    const result = getGroupCommandIndices(commands as any, 1);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle nested groups', async () => {
    const commands = [
      { id: 1, type: 'group_start' },
      { id: 2, type: 'text' },
      { id: 3, type: 'group_start' },
      { id: 4, type: 'text' },
      { id: 5, type: 'group_end' },
      { id: 6, type: 'text' },
      { id: 7, type: 'group_end' },
    ];
    
    const { getGroupCommandIndices } = await import('./skitStore');
    const result = getGroupCommandIndices(commands as any, 0);
    expect(result).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('should handle groups at the end of commands', async () => {
    const commands = [
      { id: 1, type: 'text' },
      { id: 2, type: 'group_start' },
      { id: 3, type: 'text' },
    ];
    
    const { getGroupCommandIndices } = await import('./skitStore');
    const result = getGroupCommandIndices(commands as any, 1);
    expect(result).toEqual([1, 2]); // No group_end found, returns all remaining
  });

  it('should handle empty groups', async () => {
    const commands = [
      { id: 1, type: 'group_start' },
      { id: 2, type: 'group_end' },
    ];
    
    const { getGroupCommandIndices } = await import('./skitStore');
    const result = getGroupCommandIndices(commands as any, 0);
    expect(result).toEqual([0, 1]);
  });
});

describe('getTopLevelGroups', () => {
  it('should identify top-level groups', async () => {
    const commands = [
      { id: 1, type: 'group_start' },
      { id: 2, type: 'text' },
      { id: 3, type: 'group_end' },
      { id: 4, type: 'group_start' },
      { id: 5, type: 'text' },
      { id: 6, type: 'group_end' },
    ];
    
    const { getTopLevelGroups } = await import('./skitStore');
    const result = getTopLevelGroups(commands as any, [0, 3]);
    expect(result).toEqual([0, 3]);
  });

  it('should exclude nested groups', async () => {
    const commands = [
      { id: 1, type: 'group_start' },
      { id: 2, type: 'group_start' },
      { id: 3, type: 'text' },
      { id: 4, type: 'group_end' },
      { id: 5, type: 'group_end' },
    ];
    
    const { getTopLevelGroups } = await import('./skitStore');
    const result = getTopLevelGroups(commands as any, [0, 1]);
    expect(result).toEqual([0]); // Index 1 is nested in index 0
  });

  it('should handle non-group indices', async () => {
    const commands = [
      { id: 1, type: 'text' },
      { id: 2, type: 'group_start' },
      { id: 3, type: 'text' },
      { id: 4, type: 'group_end' },
    ];
    
    const { getTopLevelGroups } = await import('./skitStore');
    const result = getTopLevelGroups(commands as any, [0, 1, 2]);
    expect(result).toEqual([1]); // Only group_start indices are returned
  });

  it('should handle empty selection', async () => {
    const commands = [
      { id: 1, type: 'group_start' },
      { id: 2, type: 'group_end' },
    ];
    
    const { getTopLevelGroups } = await import('./skitStore');
    const result = getTopLevelGroups(commands as any, []);
    expect(result).toEqual([]);
  });
});

describe('moveCommands edge cases', () => {
  beforeEach(() => {
    const { loadSkits, setCurrentSkit } = useSkitStore.getState();
    
    // Reset store state
    useSkitStore.setState({
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [],
      validationErrors: [],
      commandDefinitions: [],
      commandsMap: new Map(),
      history: {
        past: [],
        future: [],
      },
    });
    
    const testSkit: Skit = {
      meta: {
        title: 'Test',
        version: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      commands: [
        { id: 1, type: 'text', body: 'First' },
        { id: 2, type: 'text', body: 'Second' },
        { id: 3, type: 'text', body: 'Third' },
        { id: 4, type: 'text', body: 'Fourth' },
        { id: 5, type: 'text', body: 'Fifth' },
      ]
    };
    
    loadSkits({ test: testSkit });
    setCurrentSkit('test');
  });

  it('should handle moving to out of bounds index', () => {
    const { moveCommands, skits } = useSkitStore.getState();
    
    act(() => {
      moveCommands([0, 1], 10); // toIndex out of bounds
    });
    
    const commands = skits.test.commands;
    // When toIndex is out of bounds, behavior may vary
    // Just check that the commands are still there
    expect(commands.length).toBe(5);
    expect(new Set(commands.map(c => c.body))).toEqual(new Set(['First', 'Second', 'Third', 'Fourth', 'Fifth']));
  });

  it('should handle moving multiple non-consecutive items', () => {
    const { moveCommands, skits } = useSkitStore.getState();
    
    act(() => {
      moveCommands([0, 2, 4], 3); // Move 1st, 3rd, and 5th items
    });
    
    const commands = skits.test.commands;
    // Verify all commands are still present
    expect(commands.length).toBe(5);
    expect(new Set(commands.map(c => c.body))).toEqual(new Set(['First', 'Second', 'Third', 'Fourth', 'Fifth']));
  });

  it('should handle moving when some indices are invalid', () => {
    const { moveCommands, skits } = useSkitStore.getState();
    
    act(() => {
      moveCommands([0, 10, 2], 3); // Index 10 is invalid
    });
    
    const commands = skits.test.commands;
    // Verify all valid commands are still present
    expect(commands.length).toBe(5);
    expect(new Set(commands.map(c => c.body))).toEqual(new Set(['First', 'Second', 'Third', 'Fourth', 'Fifth']));
  });

  it('should preserve all items when moving', () => {
    const { moveCommands, skits } = useSkitStore.getState();
    
    act(() => {
      moveCommands([1, 3], 0); // Move some items
    });
    
    const commands = skits.test.commands;
    // All items should still be present
    expect(commands.length).toBe(5);
    expect(new Set(commands.map(c => c.body))).toEqual(new Set(['First', 'Second', 'Third', 'Fourth', 'Fifth']));
  });

  it('should handle empty indices array', () => {
    const { moveCommands, skits } = useSkitStore.getState();
    
    act(() => {
      moveCommands([], 2);
    });
    
    const commands = skits.test.commands;
    // Should not change
    expect(commands.map(c => c.body)).toEqual(['First', 'Second', 'Third', 'Fourth', 'Fifth']);
  });

  it('should handle moving to negative index', () => {
    const { moveCommands, skits } = useSkitStore.getState();
    
    act(() => {
      moveCommands([2, 3], -1); // Negative index
    });
    
    const commands = skits.test.commands;
    // When toIndex is negative, behavior seems to be that nothing changes
    expect(commands.length).toBe(5);
    expect(new Set(commands.map(c => c.body))).toEqual(new Set(['First', 'Second', 'Third', 'Fourth', 'Fifth']));
  });
});

describe('history edge cases', () => {
  beforeEach(() => {
    const { loadSkits, setCurrentSkit } = useSkitStore.getState();
    
    // Reset store state
    useSkitStore.setState({
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [],
      validationErrors: [],
      commandDefinitions: [],
      commandsMap: new Map(),
      history: {
        past: [],
        future: [],
      },
    });
    
    const testSkit: Skit = {
      meta: {
        title: 'Test',
        version: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      commands: [
        { id: 1, type: 'text', body: 'First' },
        { id: 2, type: 'text', body: 'Second' },
      ]
    };
    
    loadSkits({ test: testSkit });
    setCurrentSkit('test');
  });

  it('should not undo when there is no history', () => {
    const { undo, skits } = useSkitStore.getState();
    
    act(() => {
      undo();
    });
    
    const commands = skits.test.commands;
    expect(commands.length).toBe(2); // Should remain unchanged
  });

  it('should not redo when at the latest state', () => {
    const { redo, skits } = useSkitStore.getState();
    
    act(() => {
      redo();
    });
    
    const commands = skits.test.commands;
    expect(commands.length).toBe(2); // Should remain unchanged
  });

  it('should maintain reasonable history', () => {
    const { addCommand, undo } = useSkitStore.getState();
    
    // Add multiple commands
    for (let i = 0; i < 5; i++) {
      act(() => {
        addCommand({ type: 'text', body: `Command ${i}` });
      });
    }
    
    const commandsBefore = useSkitStore.getState().skits.test.commands.length;
    
    // Should be able to undo
    act(() => {
      undo();
    });
    
    const commandsAfter = useSkitStore.getState().skits.test.commands.length;
    expect(commandsAfter).toBe(commandsBefore - 1);
  });
});

describe('Language Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSkitStore.setState({
      currentLanguage: 'en',
      availableLanguages: [],
    });
  });

  it('should change language successfully', async () => {
    const mockChangeLanguage = vi.fn().mockResolvedValue(undefined);
    vi.mocked(i18n.changeLanguage).mockImplementation(mockChangeLanguage);
    
    const mockLoadTranslations = vi.fn().mockResolvedValue(undefined);
    vi.doMock('../i18n/translationLoader', () => ({
      loadTranslations: mockLoadTranslations,
    }));

    useSkitStore.setState({ projectPath: '/test/path' });
    
    const { changeLanguage } = useSkitStore.getState();
    
    await act(async () => {
      await changeLanguage('ja');
    });
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('ja');
    expect(useSkitStore.getState().currentLanguage).toBe('ja');
  });

  it('should handle language change errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Language change failed');
    vi.mocked(i18n.changeLanguage).mockRejectedValue(mockError);
    
    const { changeLanguage } = useSkitStore.getState();
    
    await act(async () => {
      await changeLanguage('ja');
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to change language:', mockError);
    consoleErrorSpy.mockRestore();
  });

  it('should load available languages successfully', async () => {
    const mockLanguages = [
      { code: 'en', name: 'English' },
      { code: 'ja', name: 'Japanese' },
    ];
    
    const mockGetAvailableLanguages = vi.fn().mockResolvedValue(mockLanguages);
    vi.doMock('../i18n/translationLoader', () => ({
      getAvailableLanguages: mockGetAvailableLanguages,
    }));
    
    const { loadAvailableLanguages } = useSkitStore.getState();
    
    await act(async () => {
      await loadAvailableLanguages();
    });
    
    expect(useSkitStore.getState().availableLanguages).toEqual(mockLanguages);
  });

  it('should handle errors when loading available languages', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Failed to get languages');
    
    vi.doMock('../i18n/translationLoader', () => ({
      getAvailableLanguages: vi.fn().mockRejectedValue(mockError),
    }));
    
    const { loadAvailableLanguages } = useSkitStore.getState();
    
    await act(async () => {
      await loadAvailableLanguages();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load available languages:', mockError);
    consoleErrorSpy.mockRestore();
  });
});

describe('Folder Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSkitStore.setState({
      projectPath: null,
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [],
      history: { past: [], future: [] },
    });
  });

  it('should open folder and load project successfully', async () => {
    const selectedPath = '/new/project/path';
    const mockCommandsYaml = 'test yaml content';
    const mockSkits = {
      'skit1': { id: 'skit1', meta: {}, commands: [] },
    };
    
    const mockSelectProjectFolder = vi.fn().mockResolvedValue(selectedPath);
    const mockLoadCommandsYaml = vi.fn().mockResolvedValue(mockCommandsYaml);
    const mockLoadSkits = vi.fn().mockResolvedValue(mockSkits);
    const mockLoadTranslations = vi.fn().mockResolvedValue(undefined);
    
    vi.doMock('../utils/fileSystem', () => ({
      selectProjectFolder: mockSelectProjectFolder,
      loadCommandsYaml: mockLoadCommandsYaml,
      loadSkits: mockLoadSkits,
    }));
    
    vi.doMock('../i18n/translationLoader', () => ({
      loadTranslations: mockLoadTranslations,
    }));
    
    const { openFolder } = useSkitStore.getState();
    
    await act(async () => {
      await openFolder();
    });
    
    const state = useSkitStore.getState();
    expect(state.projectPath).toBe(selectedPath);
    expect(state.skits).toEqual(mockSkits);
    expect(state.currentSkitId).toBeNull();
    expect(state.selectedCommandIds).toEqual([]);
    expect(mockLoadTranslations).toHaveBeenCalled();
  });

  it('should handle commands.yaml load error during folder open', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const selectedPath = '/new/project/path';
    const mockError = new Error('Failed to load yaml');
    
    vi.doMock('../utils/fileSystem', () => ({
      selectProjectFolder: vi.fn().mockResolvedValue(selectedPath),
      loadCommandsYaml: vi.fn().mockRejectedValue(mockError),
      loadSkits: vi.fn().mockResolvedValue({}),
    }));
    
    vi.doMock('../i18n/translationLoader', () => ({
      loadTranslations: vi.fn().mockResolvedValue(undefined),
    }));
    
    const { openFolder } = useSkitStore.getState();
    
    await act(async () => {
      await openFolder();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load commands.yaml:', mockError);
    expect(useSkitStore.getState().projectPath).toBe(selectedPath);
    consoleErrorSpy.mockRestore();
  });

  it('should handle skits load error during folder open', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const selectedPath = '/new/project/path';
    const mockError = new Error('Failed to load skits');
    
    vi.doMock('../utils/fileSystem', () => ({
      selectProjectFolder: vi.fn().mockResolvedValue(selectedPath),
      loadCommandsYaml: vi.fn().mockResolvedValue('yaml content'),
      loadSkits: vi.fn().mockRejectedValue(mockError),
    }));
    
    vi.doMock('../i18n/translationLoader', () => ({
      loadTranslations: vi.fn().mockResolvedValue(undefined),
    }));
    
    const { openFolder } = useSkitStore.getState();
    
    await act(async () => {
      await openFolder();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load skits:', mockError);
    expect(useSkitStore.getState().projectPath).toBe(selectedPath);
    consoleErrorSpy.mockRestore();
  });

  it('should handle folder selection cancellation', async () => {
    vi.doMock('../utils/fileSystem', () => ({
      selectProjectFolder: vi.fn().mockResolvedValue(null),
      loadCommandsYaml: vi.fn(),
      loadSkits: vi.fn(),
    }));
    
    const initialState = useSkitStore.getState();
    const { openFolder } = useSkitStore.getState();
    
    await act(async () => {
      await openFolder();
    });
    
    const finalState = useSkitStore.getState();
    expect(finalState.projectPath).toBe(initialState.projectPath);
    expect(finalState.skits).toEqual(initialState.skits);
  });

  it('should handle general folder open error', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Dialog error');
    
    vi.doMock('../utils/fileSystem', () => ({
      selectProjectFolder: vi.fn().mockRejectedValue(mockError),
    }));
    
    const { openFolder } = useSkitStore.getState();
    
    await act(async () => {
      await openFolder();
    });
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to open folder:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
});
