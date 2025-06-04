import { useTranslation } from 'react-i18next';
import { getTranslationWithFallback } from '../i18n/translationLoader';

export function useCommandTranslation(commandId: string) {
  const { i18n } = useTranslation();

  const tCommand = (suffix: string, fallback?: string): string => {
    const key = `command.${commandId}.${suffix}`;
    return getTranslationWithFallback(key, fallback);
  };

  const tProperty = (propertyKey: string, suffix: string, fallback?: string): string => {
    const key = `command.${commandId}.property.${propertyKey}.${suffix}`;
    return getTranslationWithFallback(key, fallback);
  };

  const tEnum = (propertyKey: string, enumValue: string, fallback?: string): string => {
    const key = `command.${commandId}.property.${propertyKey}.enum.${enumValue}`;
    return getTranslationWithFallback(key, fallback || enumValue);
  };

  return { tCommand, tProperty, tEnum };
}