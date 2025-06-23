// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from '@tauri-apps/api/fs';
import * as path from '@tauri-apps/api/path';
import * as dialog from '@tauri-apps/api/dialog';
import {
  selectProjectFolder,
  loadCommandsYaml,
  loadSkits,
  saveSkit,
  createNewSkit,
  validateCommandProperties
} from './fileSystem';
import * as validation from './validation';
import { Skit } from '../types';

vi.mock('@tauri-apps/api/fs');
vi.mock('@tauri-apps/api/path');
vi.mock('@tauri-apps/api/dialog');
vi.mock('./validation');

describe('fileSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default mock returns
    vi.mocked(validation.validateSkitData).mockReturnValue([]);
    vi.mocked(validation.validateCommandsYaml).mockReturnValue({ 
      config: { 
        version: 1,
        commands: [] 
      }, 
      errors: [] 
    });
  });

  describe('selectProjectFolder', () => {
    it('should return selected folder path', async () => {
      vi.mocked(dialog.open).mockResolvedValue('/path/to/project');

      const result = await selectProjectFolder();
      expect(result).toBe('/path/to/project');
      expect(dialog.open).toHaveBeenCalledWith({
        directory: true,
        multiple: false,
        title: 'プロジェクトフォルダを選択'
      });
    });

    it('should return null when cancelled', async () => {
      vi.mocked(dialog.open).mockResolvedValue(null);

      const result = await selectProjectFolder();
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(dialog.open).mockRejectedValue(new Error('Dialog error'));

      const result = await selectProjectFolder();
      expect(result).toBeNull();
    });

    it('should handle array response from dialog', async () => {
      vi.mocked(dialog.open).mockResolvedValue(['/path/to/project']);

      const result = await selectProjectFolder();
      expect(result).toEqual(['/path/to/project']); // returns array as-is
    });
  });

  describe('loadCommandsYaml', () => {
    it('should load from project path when available', async () => {
      vi.mocked(path.join).mockResolvedValue('/project/commands.yaml');
      vi.mocked(fs.exists).mockResolvedValue(true);
      vi.mocked(fs.readTextFile).mockResolvedValue('version: 1\ncommands: []');

      const result = await loadCommandsYaml('/project');
      expect(result).toBe('version: 1\ncommands: []');
      expect(path.join).toHaveBeenCalledWith('/project', 'commands.yaml');
    });

    it('should fall back to resource path when project path not found', async () => {
      vi.mocked(path.join).mockResolvedValue('/project/commands.yaml');
      vi.mocked(fs.exists).mockResolvedValue(false);
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/commands.yaml');
      vi.mocked(fs.readTextFile).mockResolvedValue('default commands');

      const result = await loadCommandsYaml('/project');
      expect(result).toBe('default commands');
      expect(path.resolveResource).toHaveBeenCalledWith('commands.yaml');
    });

    it('should load from resource path when no project path', async () => {
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/commands.yaml');
      vi.mocked(fs.readTextFile).mockResolvedValue('default commands');

      const result = await loadCommandsYaml();
      expect(result).toBe('default commands');
    });

    it('should throw error on failure', async () => {
      vi.mocked(path.resolveResource).mockRejectedValue(new Error('File not found'));

      await expect(loadCommandsYaml()).rejects.toThrow('File not found');
    });

    it('should throw error in web environment', async () => {
      // Mock web environment
      const originalWindow = (window as any).__TAURI__;
      (window as any).__TAURI__ = undefined;

      await expect(loadCommandsYaml()).rejects.toThrow('Running in web environment');

      // Restore
      (window as any).__TAURI__ = originalWindow;
    });
  });

  describe('loadSkits', () => {
    const mockSkitFiles = [
      { name: 'skit1.json', path: '/skits/skit1.json' },
      { name: 'skit2.json', path: '/skits/skit2.json' }
    ];

    const mockSkit1: Skit = {
      meta: {
        title: 'Skit 1',
        version: 1,
        created: '2023-01-01T00:00:00Z',
        modified: '2023-01-01T00:00:00Z'
      },
      commands: [{ id: 1, type: 'text' }]
    };

    const mockSkit2: Skit = {
      meta: {
        title: 'Skit 2',
        version: 1,
        created: '2023-01-02T00:00:00Z',
        modified: '2023-01-02T00:00:00Z'
      },
      commands: [{ id: 1, type: 'choice' }]
    };

    it('should load skits from project path', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.exists).mockResolvedValue(true);
      vi.mocked(fs.readDir).mockResolvedValue(mockSkitFiles);
      vi.mocked(fs.readTextFile)
        .mockImplementation(async (path) => {
          if (path.includes('skit1.json')) return JSON.stringify(mockSkit1);
          if (path.includes('skit2.json')) return JSON.stringify(mockSkit2);
          return '';
        });

      const result = await loadSkits('/project');
      expect(result).toEqual({
        skit1: mockSkit1,
        skit2: mockSkit2
      });
    });

    it('should create skits directory if not exists', async () => {
      vi.mocked(path.join).mockResolvedValue('/project/skits');
      vi.mocked(fs.exists).mockResolvedValue(false);
      vi.mocked(fs.createDir).mockResolvedValue();

      const result = await loadSkits('/project');
      expect(result).toEqual({});
      expect(fs.createDir).toHaveBeenCalledWith('/project/skits', { recursive: true });
    });

    it('should ignore non-JSON files', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.exists).mockResolvedValue(true);
      vi.mocked(fs.readDir).mockResolvedValue([
        { name: 'skit1.json', path: '/skits/skit1.json' },
        { name: 'readme.txt', path: '/skits/readme.txt' }
      ]);
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(mockSkit1));

      const result = await loadSkits('/project');
      expect(result).toEqual({ skit1: mockSkit1 });
    });

    it('should return empty object on error', async () => {
      vi.mocked(path.join).mockRejectedValue(new Error('Path error'));

      const result = await loadSkits('/project');
      expect(result).toEqual({});
    });

    it('should apply default background colors from commands.yaml', async () => {
      vi.mocked(validation.validateCommandsYaml).mockReturnValue({
        config: {
          version: 1,
          commands: [
            {
              id: 'text',
              label: 'Text',
              description: 'Text command',
              commandListLabelFormat: '{body}',
              properties: {},
              defaultBackgroundColor: '#FF0000'
            }
          ]
        },
        errors: []
      });

      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.exists).mockResolvedValue(true);
      vi.mocked(fs.readDir).mockResolvedValue([{ name: 'skit1.json', path: '/skits/skit1.json' }]);
      vi.mocked(fs.readTextFile)
        .mockResolvedValueOnce('version: 1\ncommands: []')
        .mockResolvedValueOnce(JSON.stringify(mockSkit1));

      const result = await loadSkits('/project');
      expect(result.skit1.commands[0]).toHaveProperty('backgroundColor', '#FF0000');
    });

    it('should handle missing file names in directory entries', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.exists).mockResolvedValue(true);
      vi.mocked(fs.readDir).mockResolvedValue([
        { name: null as any, path: '/skits/unknown' },
        { name: 'skit1.json', path: '/skits/skit1.json' }
      ]);
      vi.mocked(fs.readTextFile).mockResolvedValue(JSON.stringify(mockSkit1));

      const result = await loadSkits('/project');
      expect(result).toEqual({ skit1: mockSkit1 });
    });
  });

  describe('saveSkit', () => {
    const validSkit: Skit = {
      meta: {
        title: 'Test Skit',
        version: 1,
        created: '2023-01-01T00:00:00Z',
        modified: '2023-01-01T00:00:00Z'
      },
      commands: []
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-02T00:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should save valid skit', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/skits');
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      const errors = await saveSkit('test_skit', validSkit, '');
      expect(errors).toHaveLength(0);
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        '/resources/skits/test_skit.json',
        expect.stringContaining('"modified": "2023-01-02T00:00:00.000Z"')
      );
    });

    it('should use project path when provided', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      const errors = await saveSkit('test_skit', validSkit, '', '/project');
      expect(errors).toHaveLength(0);
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        '/project/skits/test_skit.json',
        expect.any(String)
      );
    });

    it('should return validation errors for invalid skit', async () => {
      vi.mocked(validation.validateSkitData).mockReturnValue(['Invalid skit']);

      const errors = await saveSkit('test_skit', {} as Skit, '');
      expect(errors).toEqual(['Invalid skit']);
      expect(fs.writeTextFile).not.toHaveBeenCalled();
    });

    it('should validate command properties when commands.yaml provided', async () => {
      vi.mocked(validation.validateCommandsYaml).mockReturnValue({
        config: {
          version: 1,
          commands: [{
            id: 'text',
            label: 'Text',
            description: 'Text command',
            commandListLabelFormat: '{body}',
            properties: {
              body: { type: 'string', required: true }
            }
          }]
        },
        errors: []
      });

      const invalidSkit: Skit = {
        ...validSkit,
        commands: [{ id: 1, type: 'text' }] // missing required 'body' property
      };

      // Mock validateCommandProperties to be called
      const errors = await saveSkit('test_skit', invalidSkit, 'version: 1\ncommands: []');
      // Since validateCommandProperties is defined in fileSystem.ts, we need to check that it's working
      expect(errors.length).toBe(1);
      expect(errors[0]).toContain('body');
    });

    it('should return error on save failure', async () => {
      vi.mocked(path.join).mockRejectedValue(new Error('Path error'));

      const errors = await saveSkit('test_skit', validSkit, '');
      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('Failed to save skit: Path error');
    });

    it('should create directory with recursive option', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/skits');
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      await saveSkit('test_skit', validSkit, '');
      expect(fs.createDir).toHaveBeenCalledWith('/resources/skits', { recursive: true });
    });
  });

  describe('createNewSkit', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create new skit with proper ID', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/skits');
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      const result = await createNewSkit('My New Skit');
      expect(result.id).toBe('my_new_skit');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle special characters in title', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/skits');
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      const result = await createNewSkit('My  Special   Skit!');
      expect(result.id).toBe('my_special_skit!');
    });

    it('should use project path when provided', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      const result = await createNewSkit('Test', '/project');
      expect(result.id).toBe('test');
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        '/project/skits/test.json',
        expect.any(String)
      );
    });

    it('should return validation errors if any', async () => {
      vi.mocked(validation.validateSkitData).mockReturnValue(['Invalid skit']);

      const result = await createNewSkit('Test');
      expect(result.errors).toEqual(['Invalid skit']);
    });

    it('should create skit with correct metadata', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(path.resolveResource).mockResolvedValue('/resources/skits');
      vi.mocked(fs.createDir).mockResolvedValue();
      vi.mocked(fs.writeTextFile).mockResolvedValue();

      await createNewSkit('Test Skit');
      
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        '/resources/skits/test_skit.json',
        expect.stringContaining('"title": "Test Skit"')
      );
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"version": 1')
      );
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"created": "2023-01-01T00:00:00.000Z"')
      );
      expect(fs.writeTextFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"commands": []')
      );
    });
  });

  describe('validateCommandProperties', () => {
    it('should return error when command definition not found', () => {
      const skit: Skit = {
        id: 'test',
        meta: { 
          title: 'Test', 
          version: 1, 
          created: new Date().toISOString(), 
          modified: new Date().toISOString() 
        },
        commands: [
          { id: 1, type: 'unknown_command', body: 'test' }
        ]
      };

      const commandsConfig = {
        version: 1,
        commands: []
      };

      const errors = validateCommandProperties(skit, commandsConfig);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Command 1: Definition not found');
    });

    it('should return error when required property is missing', () => {
      const skit: Skit = {
        id: 'test',
        meta: { 
          title: 'Test', 
          version: 1, 
          created: new Date().toISOString(), 
          modified: new Date().toISOString() 
        },
        commands: [
          { id: 1, type: 'text' } // Missing required 'body' property
        ]
      };

      const commandsConfig = {
        version: 1,
        commands: [{
          id: 'text',
          label: 'Text',
          description: 'Text command',
          commandListLabelFormat: '{body}',
          properties: {
            body: {
              type: 'string',
              required: true
            }
          }
        }]
      };

      const errors = validateCommandProperties(skit, commandsConfig);
      expect(errors).toHaveLength(1);
      expect(errors[0]).toBe('Command 1: Required property "body" is missing');
    });
  });

  describe('loadSkits with background colors', () => {
    it('should handle error when loading commands.yaml for background colors', async () => {
      vi.mocked(path.join).mockImplementation(async (...parts) => parts.join('/'));
      vi.mocked(fs.exists).mockResolvedValue(true);
      vi.mocked(fs.readDir).mockResolvedValue([
        { name: 'test_skit.json', path: '/project/skits/test_skit.json', children: undefined }
      ]);
      vi.mocked(fs.readTextFile).mockImplementation(async (path) => {
        if (path === '/project/skits/test_skit.json') {
          return JSON.stringify({
            meta: { title: 'Test Skit' },
            commands: []
          });
        }
        throw new Error('File not found');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const skits = await loadSkits('/project');
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load commands.yaml for background colors:', 
        expect.any(Error)
      );
      expect(skits).toHaveProperty('test_skit');

      consoleErrorSpy.mockRestore();
    });
  });
});