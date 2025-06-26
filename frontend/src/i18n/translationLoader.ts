import i18n from 'i18next';
import { exists, readTextFile } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';

interface TranslationFile {
  locale: string;
  name: string;
  translations: Record<string, string>;
}

interface CommandDefinition {
  id: string;
  properties?: Array<{
    key: string;
    type: string;
    enum?: string[];
  }>;
}

// Development fallback for when Tauri is not available
const loadDevelopmentTranslations = async (): Promise<void> => {
  try {
    // Try to load sample translation files in development
    const languages = [
      { file: 'english', code: 'en' },
      { file: 'japanese', code: 'ja' },
    ];

    for (const { file, code } of languages) {
      try {
        const response = await fetch(`/src/sample/i18n/${file}.json`);
        if (response.ok) {
          const data: TranslationFile = await response.json();
          i18n.addResourceBundle(code, 'translation', data.translations, true, true);
        }
      } catch (error) {
        console.warn(`Failed to load ${file} translations in dev mode:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to load development translations:', error);
  }
};

// Load translations from i18n folder
export async function loadTranslations(): Promise<void> {
  console.log('loadTranslations called');
  console.log('window.__TAURI__:', window.__TAURI__);
  console.log('import.meta.env.MODE:', import.meta.env.MODE);

  // Check if we're in Tauri environment
  if (!window.__TAURI__) {
    console.log('Loading development translations (Tauri not available)');
    await loadDevelopmentTranslations();
    return;
  }

  try {
    // Get the project path from the store
    const { useSkitStore } = await import('../store/skitStore');
    const projectPath = useSkitStore.getState().projectPath;
    
    if (!projectPath) {
      console.warn('No project path set, using development translations');
      await loadDevelopmentTranslations();
      return;
    }

    const i18nPath = await join(projectPath, 'i18n');
    console.log('Calculated i18nPath:', i18nPath);
    
    // Check if i18n directory exists
    const i18nDirExists = await exists(i18nPath);
    console.log('i18n directory exists:', i18nDirExists);

    if (!i18nDirExists) {
      console.warn('i18n directory not found, using development translations');
      await loadDevelopmentTranslations();
      return;
    }

    // Load all available language files
    const languages = ['english', 'japanese', 'chinese', 'spanish'];
    
    for (const lang of languages) {
      const filePath = await join(i18nPath, `${lang}.json`);
      
      if (await exists(filePath)) {
        try {
          const content = await readTextFile(filePath);
          const translationFile: TranslationFile = JSON.parse(content);
          
          // Add translations to i18n
          i18n.addResourceBundle(
            translationFile.locale,
            'translation',
            translationFile.translations,
            true,
            true
          );
        } catch (error) {
          console.error(`Failed to load ${lang} translations:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load translations in Tauri mode:', error);
    await loadDevelopmentTranslations();
  }
}

// Generate translation keys for a command
export function generateCommandTranslationKeys(command: CommandDefinition): string[] {
  const keys: string[] = [
    `command.${command.id}.name`,
    `command.${command.id}.description`,
  ];

  if (command.properties) {
    command.properties.forEach((property) => {
      keys.push(
        `command.${command.id}.property.${property.key}.name`,
        `command.${command.id}.property.${property.key}.description`,
        `command.${command.id}.property.${property.key}.placeholder`
      );

      if (property.enum) {
        property.enum.forEach((enumValue) => {
          keys.push(
            `command.${command.id}.property.${property.key}.enum.${enumValue}`
          );
        });
      }
    });
  }

  return keys;
}

// Get available languages
export async function getAvailableLanguages(): Promise<Array<{ code: string; name: string }>> {
  const languages = Object.keys(i18n.services.resourceStore.data);
  
  return languages.map((lang) => ({
    code: lang,
    name: i18n.t(`language.${lang}`, { lng: lang, defaultValue: lang }),
  }));
}

// Helper to get translation with fallback
export function getTranslationWithFallback(
  key: string,
  fallback?: string,
  options?: any
): string {
  const translation = i18n.t(key, options);
  
  // Ensure we return a string
  if (typeof translation !== 'string') {
    return fallback || key;
  }
  
  // If translation is the same as key, use fallback
  if (translation === key && fallback) {
    return fallback;
  }
  
  return translation;
}