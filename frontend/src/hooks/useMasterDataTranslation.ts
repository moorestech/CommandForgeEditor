import { useTranslation } from 'react-i18next';

/**
 * Hook for translating master data values
 * 
 * Translation key pattern:
 * - master.<masterKey>.<value>
 * 
 * Example:
 * - master.characters.CharacterA -> "主人公" (in Japanese)
 * - master.emotions.Happy -> "喜び" (in Japanese)
 */
export function useMasterDataTranslation() {
  const { t } = useTranslation();

  /**
   * Translate a master data value
   * @param masterKey - The master data key (e.g., 'characters', 'emotions')
   * @param value - The value to translate (e.g., 'CharacterA', 'Happy')
   * @param fallback - Optional fallback value, defaults to the value itself
   * @returns The translated value or fallback
   */
  const tMaster = (masterKey: string, value: string, fallback?: string): string => {
    const key = `master.${masterKey}.${value}`;
    const translated = t(key);
    
    // If translation key not found, use fallback or original value
    if (translated === key) {
      return fallback ?? value;
    }
    
    return translated;
  };

  /**
   * Get all translations for a master data key
   * @param masterKey - The master data key (e.g., 'characters', 'emotions')
   * @param values - Array of values to translate
   * @returns Array of objects with value and translated label
   */
  const tMasterList = (masterKey: string, values: string[]): Array<{ value: string; label: string }> => {
    return values.map(value => ({
      value,
      label: tMaster(masterKey, value)
    }));
  };

  /**
   * Check if a master data key has translations
   * @param masterKey - The master data key to check
   * @param value - The value to check
   * @returns true if translation exists, false otherwise
   */
  const hasMasterTranslation = (masterKey: string, value: string): boolean => {
    const key = `master.${masterKey}.${value}`;
    const translated = t(key);
    return translated !== key;
  };

  return {
    tMaster,
    tMasterList,
    hasMasterTranslation
  };
}