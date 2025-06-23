import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMasterDataTranslation } from './useMasterDataTranslation';
import { useCommandTranslation } from './useCommandTranslation';
import * as translationLoader from '../i18n/translationLoader';

// Mock the i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simulate translation behavior
      const translations: Record<string, string> = {
        'master.characters.CharacterA': '主人公',
        'master.characters.CharacterB': '相棒',
        'master.emotions.Happy': '喜び',
        'master.emotions.Sad': '悲しみ',
      };
      return translations[key] || key;
    }
  })
}));

describe('useMasterDataTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('tMaster', () => {
    it('should translate master data values', () => {
      const { result } = renderHook(() => useMasterDataTranslation());
      
      expect(result.current.tMaster('characters', 'CharacterA')).toBe('主人公');
      expect(result.current.tMaster('characters', 'CharacterB')).toBe('相棒');
      expect(result.current.tMaster('emotions', 'Happy')).toBe('喜び');
    });

    it('should return original value when translation not found', () => {
      const { result } = renderHook(() => useMasterDataTranslation());
      
      expect(result.current.tMaster('characters', 'UnknownCharacter')).toBe('UnknownCharacter');
    });

    it('should use fallback when provided and translation not found', () => {
      const { result } = renderHook(() => useMasterDataTranslation());
      
      expect(result.current.tMaster('characters', 'Unknown', 'Default Character')).toBe('Default Character');
    });
  });

  describe('tMasterList', () => {
    it('should translate a list of master data values', () => {
      const { result } = renderHook(() => useMasterDataTranslation());
      const values = ['CharacterA', 'CharacterB', 'CharacterC'];
      
      const translated = result.current.tMasterList('characters', values);
      
      expect(translated).toEqual([
        { value: 'CharacterA', label: '主人公' },
        { value: 'CharacterB', label: '相棒' },
        { value: 'CharacterC', label: 'CharacterC' }, // No translation, returns original
      ]);
    });
  });

  describe('hasMasterTranslation', () => {
    it('should return true when translation exists', () => {
      const { result } = renderHook(() => useMasterDataTranslation());
      
      expect(result.current.hasMasterTranslation('characters', 'CharacterA')).toBe(true);
      expect(result.current.hasMasterTranslation('emotions', 'Happy')).toBe(true);
    });

    it('should return false when translation does not exist', () => {
      const { result } = renderHook(() => useMasterDataTranslation());
      
      expect(result.current.hasMasterTranslation('characters', 'Unknown')).toBe(false);
      expect(result.current.hasMasterTranslation('unknown', 'Value')).toBe(false);
    });
  });
});

describe('useCommandTranslation with master data', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getTranslationWithFallback
    vi.spyOn(translationLoader, 'getTranslationWithFallback').mockImplementation((key: string, fallback?: string | null) => {
      const translations: Record<string, string> = {
        'master.characters.CharacterA': '主人公',
        'master.emotions.Happy': '喜び',
        'command.text.property.character.enum.CharacterA': 'テキストキャラA',
        'command.text.property.emotion.enum.Happy': 'テキスト喜び',
      };
      
      const translated = translations[key];
      if (translated) return translated;
      if (fallback !== null && fallback !== undefined) return fallback;
      return key;
    });
  });

  describe('tEnum with masterKey', () => {
    it('should prioritize master data translation when masterKey is provided', () => {
      const { result } = renderHook(() => useCommandTranslation('text'));
      
      // With masterKey - should use master translation
      expect(result.current.tEnum('character', 'CharacterA', 'Fallback', 'characters')).toBe('主人公');
      
      // Without masterKey - should use command-specific translation
      expect(result.current.tEnum('character', 'CharacterA', 'Fallback')).toBe('テキストキャラA');
    });

    it('should fall back to command-specific translation when master translation not found', () => {
      const { result } = renderHook(() => useCommandTranslation('text'));
      
      // Master translation not found, falls back to command-specific
      expect(result.current.tEnum('emotion', 'Happy', 'Fallback', 'unknownMaster')).toBe('テキスト喜び');
    });

    it('should use fallback when both master and command translations not found', () => {
      const { result } = renderHook(() => useCommandTranslation('text'));
      
      expect(result.current.tEnum('unknown', 'UnknownValue', 'DefaultValue', 'unknownMaster')).toBe('DefaultValue');
    });

    it('should use value as fallback when no explicit fallback provided', () => {
      const { result } = renderHook(() => useCommandTranslation('text'));
      
      expect(result.current.tEnum('unknown', 'UnknownValue', undefined, 'unknownMaster')).toBe('UnknownValue');
    });
  });
});

describe('Master data i18n integration', () => {
  it('should handle complex scenario with mixed translations', () => {
    // Mock translations
    vi.spyOn(translationLoader, 'getTranslationWithFallback').mockImplementation((key: string, fallback?: string | null) => {
      const translations: Record<string, string> = {
        // Master data translations
        'master.characters.CharacterA': 'ヒーロー',
        'master.characters.CharacterB': 'パートナー',
        'master.emotions.Happy': '幸せ',
        'master.emotions.Sad': '悲しい',
        
        // Command-specific overrides (should be ignored when masterKey is present)
        'command.dialogue.property.speaker.enum.CharacterA': 'ダイアログキャラA',
        'command.dialogue.property.mood.enum.Happy': 'ダイアログ幸せ',
      };
      
      const translated = translations[key];
      if (translated) return translated;
      if (fallback !== null && fallback !== undefined) return fallback;
      return key;
    });

    const { result } = renderHook(() => useCommandTranslation('dialogue'));
    
    // Test with masterKey - should use master translations
    expect(result.current.tEnum('speaker', 'CharacterA', null, 'characters')).toBe('ヒーロー');
    expect(result.current.tEnum('mood', 'Happy', null, 'emotions')).toBe('幸せ');
    
    // Test without masterKey - should use command-specific translations
    expect(result.current.tEnum('speaker', 'CharacterA')).toBe('ダイアログキャラA');
    expect(result.current.tEnum('mood', 'Happy')).toBe('ダイアログ幸せ');
    
    // Test with values that have no translations
    expect(result.current.tEnum('speaker', 'CharacterC', 'Unknown Speaker', 'characters')).toBe('Unknown Speaker');
  });
});