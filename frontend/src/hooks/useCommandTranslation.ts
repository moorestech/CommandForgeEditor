import { useTranslation } from 'react-i18next';
import { getTranslationWithFallback } from '../i18n/translationLoader';

export function useCommandTranslation(commandId: string) {
  useTranslation(); // Ensure translation context is available

  const tCommand = (suffix: string, fallback?: string): string => {
    const key = `command.${commandId}.${suffix}`;
    return getTranslationWithFallback(key, fallback);
  };

  const tProperty = (propertyKey: string, suffix: string, fallback?: string): string => {
    const key = `command.${commandId}.property.${propertyKey}.${suffix}`;
    return getTranslationWithFallback(key, fallback);
  };

  const tEnum = (propertyKey: string, enumValue: string, fallback?: string, masterKey?: string): string => {
    // If masterKey is provided, prioritize master data translation
    if (masterKey) {
      const masterDataKey = `master.${masterKey}.${enumValue}`;
      const masterTranslation = getTranslationWithFallback(masterDataKey, undefined);
      
      // If master translation exists, use it
      if (masterTranslation !== masterDataKey) {
        return masterTranslation;
      }
    }
    
    // Fall back to command-specific enum translation
    const key = `command.${commandId}.property.${propertyKey}.enum.${enumValue}`;
    return getTranslationWithFallback(key, fallback || enumValue);
  };

  return { tCommand, tProperty, tEnum };
}