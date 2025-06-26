// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadTranslations, generateCommandTranslationKeys, getAvailableLanguages, getTranslationWithFallback } from './translationLoader';
import i18n from 'i18next';
import * as tauriApi from '@tauri-apps/api';
import * as tauriFs from '@tauri-apps/api/fs';
import * as tauriPath from '@tauri-apps/api/path';

// Mock modules
vi.mock('i18next', () => ({
  default: {
    t: vi.fn((key, _options) => key),
    addResourceBundle: vi.fn(),
    services: {
      resourceStore: {
        data: {
          en: {},
          ja: {},
        },
      },
    },
  },
}));

vi.mock('@tauri-apps/api', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/api/fs', () => ({
  exists: vi.fn(),
  readTextFile: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(),
  dirname: vi.fn(),
}));

// Mock the store
vi.mock('../store/skitStore', () => ({
  useSkitStore: {
    getState: vi.fn(() => ({
      projectPath: null,
    })),
  },
}));

// Mock fetch for development mode
global.fetch = vi.fn();

describe('translationLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.__TAURI__
    (window as any).__TAURI__ = undefined;
    (import.meta as any).env = { MODE: 'test' };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('loadTranslations', () => {
    it('should load development translations when not in Tauri environment', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locale: 'en',
          name: 'English',
          translations: { 'hello': 'Hello' },
        }),
      } as Response);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          locale: 'ja',
          name: 'Japanese',
          translations: { 'hello': 'こんにちは' },
        }),
      } as Response);

      await loadTranslations();

      expect(mockFetch).toHaveBeenCalledWith('/src/sample/i18n/english.json');
      expect(mockFetch).toHaveBeenCalledWith('/src/sample/i18n/japanese.json');
      expect(i18n.addResourceBundle).toHaveBeenCalledWith('en', 'translation', { 'hello': 'Hello' }, true, true);
      expect(i18n.addResourceBundle).toHaveBeenCalledWith('ja', 'translation', { 'hello': 'こんにちは' }, true, true);
    });

    it('should handle fetch errors in development mode', async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockRejectedValue(new Error('Network error'));

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await loadTranslations();

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load'), expect.any(Error));
      
      consoleWarnSpy.mockRestore();
    });

    it('should load translations from Tauri filesystem', async () => {
      (window as any).__TAURI__ = true;
      (import.meta as any).env = { MODE: 'production' };

      // Mock store to return a project path
      const { useSkitStore } = await import('../store/skitStore');
      vi.mocked(useSkitStore.getState).mockReturnValue({
        projectPath: '/path/to/project',
      } as any);

      vi.mocked(tauriPath.join).mockImplementation(async (...args) => args.join('/'));
      vi.mocked(tauriFs.exists).mockResolvedValue(true);
      vi.mocked(tauriFs.readTextFile).mockResolvedValue(JSON.stringify({
        locale: 'en',
        name: 'English',
        translations: { 'test': 'Test' },
      }));

      await loadTranslations();

      expect(tauriFs.exists).toHaveBeenCalledWith('/path/to/project/i18n');
      expect(tauriFs.readTextFile).toHaveBeenCalled();
      expect(i18n.addResourceBundle).toHaveBeenCalled();
    });

    it('should fallback to development mode when project path not found', async () => {
      (window as any).__TAURI__ = true;
      
      // Mock store to return no project path
      const { useSkitStore } = await import('../store/skitStore');
      vi.mocked(useSkitStore.getState).mockReturnValue({
        projectPath: null,
      } as any);

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
      } as Response);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await loadTranslations();

      expect(consoleWarnSpy).toHaveBeenCalledWith('No project path set, using development translations');
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle missing i18n directory', async () => {
      (window as any).__TAURI__ = true;
      (import.meta as any).env = { MODE: 'production' };

      // Mock store to return a project path
      const { useSkitStore } = await import('../store/skitStore');
      vi.mocked(useSkitStore.getState).mockReturnValue({
        projectPath: '/path/to/project',
      } as any);

      vi.mocked(tauriPath.join).mockImplementation(async (...args) => args.join('/'));
      vi.mocked(tauriFs.exists).mockResolvedValue(false);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await loadTranslations();

      expect(consoleWarnSpy).toHaveBeenCalledWith('i18n directory not found, using development translations');
      
      consoleWarnSpy.mockRestore();
    });

    it('should handle JSON parse errors', async () => {
      (window as any).__TAURI__ = true;
      (import.meta as any).env = { MODE: 'production' };

      // Mock store to return a project path
      const { useSkitStore } = await import('../store/skitStore');
      vi.mocked(useSkitStore.getState).mockReturnValue({
        projectPath: '/path/to/project',
      } as any);

      vi.mocked(tauriPath.join).mockImplementation(async (...args) => args.join('/'));
      vi.mocked(tauriFs.exists).mockResolvedValue(true);
      vi.mocked(tauriFs.readTextFile).mockResolvedValue('invalid json');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await loadTranslations();

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to load'), expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it('should skip non-existent language files', async () => {
      (window as any).__TAURI__ = true;
      (import.meta as any).env = { MODE: 'production' };

      // Mock store to return a project path
      const { useSkitStore } = await import('../store/skitStore');
      vi.mocked(useSkitStore.getState).mockReturnValue({
        projectPath: '/path/to/project',
      } as any);

      vi.mocked(tauriPath.join).mockImplementation(async (...args) => args.join('/'));
      
      // Only i18n directory exists, but no language files
      vi.mocked(tauriFs.exists)
        .mockResolvedValueOnce(true) // i18n directory
        .mockResolvedValue(false); // language files

      await loadTranslations();

      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('should handle development mode even with __TAURI__ present', async () => {
      (window as any).__TAURI__ = true;
      (import.meta as any).env = { MODE: 'development' };

      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: false,
      } as Response);

      await loadTranslations();

      // In development mode, it will try to load from Tauri first, then fallback to fetch
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('generateCommandTranslationKeys', () => {
    it('should generate basic command translation keys', () => {
      const command = {
        id: 'test-command',
      };

      const keys = generateCommandTranslationKeys(command);

      expect(keys).toEqual([
        'command.test-command.name',
        'command.test-command.description',
      ]);
    });

    it('should generate property translation keys', () => {
      const command = {
        id: 'test-command',
        properties: [
          {
            key: 'text',
            type: 'string',
          },
        ],
      };

      const keys = generateCommandTranslationKeys(command);

      expect(keys).toContain('command.test-command.property.text.name');
      expect(keys).toContain('command.test-command.property.text.description');
      expect(keys).toContain('command.test-command.property.text.placeholder');
    });

    it('should generate enum translation keys', () => {
      const command = {
        id: 'test-command',
        properties: [
          {
            key: 'type',
            type: 'enum',
            enum: ['option1', 'option2'],
          },
        ],
      };

      const keys = generateCommandTranslationKeys(command);

      expect(keys).toContain('command.test-command.property.type.enum.option1');
      expect(keys).toContain('command.test-command.property.type.enum.option2');
    });

    it('should handle commands without properties', () => {
      const command = {
        id: 'simple-command',
        properties: undefined,
      };

      const keys = generateCommandTranslationKeys(command);

      expect(keys).toHaveLength(2);
      expect(keys).toEqual([
        'command.simple-command.name',
        'command.simple-command.description',
      ]);
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return available languages from i18n resource store', async () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockImplementation(((key: string, options?: any) => {
        if (key === 'language.en' && options?.lng === 'en') return 'English';
        if (key === 'language.ja' && options?.lng === 'ja') return '日本語';
        return key;
      }) as any);

      const languages = await getAvailableLanguages();

      expect(languages).toEqual([
        { code: 'en', name: 'English' },
        { code: 'ja', name: '日本語' },
      ]);
    });

    it('should use language code as fallback name', async () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockImplementation(((key: string) => key) as any);

      const languages = await getAvailableLanguages();

      expect(languages).toEqual([
        { code: 'en', name: 'language.en' },
        { code: 'ja', name: 'language.ja' },
      ]);
    });
  });

  describe('getTranslationWithFallback', () => {
    it('should return translation when available', () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockReturnValue('Translated text');

      const result = getTranslationWithFallback('test.key');

      expect(result).toBe('Translated text');
    });

    it('should return fallback when translation equals key', () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockReturnValue('test.key');

      const result = getTranslationWithFallback('test.key', 'Fallback text');

      expect(result).toBe('Fallback text');
    });

    it('should return key when no translation and no fallback', () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockReturnValue('test.key');

      const result = getTranslationWithFallback('test.key');

      expect(result).toBe('test.key');
    });

    it('should handle non-string translations', () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockReturnValue({ some: 'object' } as any);

      const result = getTranslationWithFallback('test.key', 'Fallback');

      expect(result).toBe('Fallback');
    });

    it('should pass options to i18n.t', () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockReturnValue('Translated with options');

      const _options = { lng: 'en', count: 5 };
      const result = getTranslationWithFallback('test.key', 'Fallback', _options);

      expect(mockT).toHaveBeenCalledWith('test.key', _options);
      expect(result).toBe('Translated with options');
    });

    it('should return key when translation is non-string and no fallback', () => {
      const mockT = vi.mocked(i18n.t);
      mockT.mockReturnValue(null as any);

      const result = getTranslationWithFallback('test.key');

      expect(result).toBe('test.key');
    });
  });

  describe('loadDevelopmentTranslations error handling', () => {
    it('should handle errors when loading development translations', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockFetch = vi.mocked(global.fetch);
      
      // Make fetch throw an error instead of rejecting
      mockFetch.mockImplementation(() => {
        throw new Error('Network error');
      });

      // Call loadTranslations which will call loadDevelopmentTranslations
      await loadTranslations();

      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('loadTranslations production error handling', () => {
    it('should handle general error and fallback to development translations', async () => {
      (window as any).__TAURI__ = true;
      (import.meta as any).env = { MODE: 'production' };
      
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Make the store import throw an error
      vi.doMock('../store/skitStore', () => {
        throw new Error('Store import error');
      });
      
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ locale: 'en', translations: { test: 'value' } })
      } as Response);

      await loadTranslations();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load translations in Tauri mode:', expect.any(Error));
      // Should fallback to development translations
      expect(mockFetch).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });
});