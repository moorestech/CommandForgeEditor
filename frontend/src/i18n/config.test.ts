// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import i18n, { initializeI18n } from './config';
import { loadTranslations } from './translationLoader';

// Mock the translationLoader module
vi.mock('./translationLoader', () => ({
  loadTranslations: vi.fn(),
}));

describe('i18n/config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('i18n initialization', () => {
    it('should initialize i18n with correct configuration', () => {
      expect(i18n.isInitialized).toBe(true);
      expect(i18n.language).toBe('ja');
      expect(i18n.options.fallbackLng).toEqual(['en']);
      expect(i18n.options.debug).toBe(false);
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
      expect(i18n.options.react?.useSuspense).toBe(false);
    });

    it('should have editor translations for English', () => {
      const enTranslations = i18n.getResourceBundle('en', 'translation');
      expect(enTranslations).toBeDefined();
      expect(enTranslations.editor).toBeDefined();
      expect(enTranslations.editor.menu.file.new).toBe('New');
      expect(enTranslations.editor.menu.file.open).toBe('Open');
      expect(enTranslations.editor.menu.file.save).toBe('Save');
      expect(enTranslations.editor.menu.file.saveAs).toBe('Save As');
      
      expect(enTranslations.editor.menu.edit.undo).toBe('Undo');
      expect(enTranslations.editor.menu.edit.redo).toBe('Redo');
      expect(enTranslations.editor.menu.edit.cut).toBe('Cut');
      expect(enTranslations.editor.menu.edit.copy).toBe('Copy');
      expect(enTranslations.editor.menu.edit.paste).toBe('Paste');
      expect(enTranslations.editor.menu.edit.delete).toBe('Delete');
      expect(enTranslations.editor.menu.edit.selectAll).toBe('Select All');
      
      expect(enTranslations.editor.toolbar.addCommand).toBe('Add');
      expect(enTranslations.editor.toolbar.deleteCommand).toBe('Delete Command');
      expect(enTranslations.editor.toolbar.groupCommands).toBe('Group Commands');
      expect(enTranslations.editor.toolbar.ungroupCommands).toBe('Ungroup Commands');
      expect(enTranslations.editor.toolbar.commandAdded).toBe('{{command}} added');
      expect(enTranslations.editor.toolbar.projectLoaded).toBe('Project folder loaded');
      expect(enTranslations.editor.toolbar.projectLoadFailed).toBe('Failed to load project');
      expect(enTranslations.editor.toolbar.skitSaved).toBe('Skit saved');
      expect(enTranslations.editor.toolbar.saveFailed).toBe('Failed to save: {{error}}');
      expect(enTranslations.editor.toolbar.openProjectFolder).toBe('Open project folder');
      expect(enTranslations.editor.toolbar.folder).toBe('Folder');
      expect(enTranslations.editor.toolbar.currentDirectory).toBe('Current Directory');
      expect(enTranslations.editor.toolbar.noFolderOpen).toBe('No folder open');
      
      expect(enTranslations.editor.panel.commandList).toBe('Command List');
      expect(enTranslations.editor.panel.commandEditor).toBe('Command Editor');
      expect(enTranslations.editor.panel.validation).toBe('Validation');
      
      expect(enTranslations.editor.dialog.unsavedChanges).toBe('You have unsaved changes. Do you want to save them?');
      expect(enTranslations.editor.dialog.confirmDelete).toBe('Are you sure you want to delete the selected commands?');
      expect(enTranslations.editor.dialog.save).toBe('Save');
      expect(enTranslations.editor.dialog.cancel).toBe('Cancel');
      expect(enTranslations.editor.dialog.discard).toBe('Discard');
      
      expect(enTranslations.editor.error.fileNotFound).toBe('File not found');
      expect(enTranslations.editor.error.invalidCommand).toBe('Invalid command');
      expect(enTranslations.editor.error.loadFailed).toBe('Failed to load file');
      expect(enTranslations.editor.error.saveFailed).toBe('Failed to save file');
      
      expect(enTranslations.editor.validation.required).toBe('This field is required');
      expect(enTranslations.editor.validation.invalidType).toBe('Invalid type');
      expect(enTranslations.editor.validation.invalidValue).toBe('Invalid value');
      
      expect(enTranslations.editor.noSkitSelected).toBe('No skit selected');
      expect(enTranslations.editor.noCommandSelected).toBe('No command selected');
      expect(enTranslations.editor.commandDefinitionNotFound).toBe('Command definition not found');
      expect(enTranslations.editor.backgroundColor).toBe('Background Color');
      expect(enTranslations.editor.itemsSelected).toBe('{{count}} items selected');
      expect(enTranslations.editor.newSkit).toBe('New Skit');
      expect(enTranslations.editor.createNewSkit).toBe('Create New Skit');
      expect(enTranslations.editor.title).toBe('Title');
      expect(enTranslations.editor.enterSkitTitle).toBe('Enter skit title');
      expect(enTranslations.editor.create).toBe('Create');
      expect(enTranslations.editor.cancel).toBe('Cancel');
      expect(enTranslations.editor.creating).toBe('Creating...');
      expect(enTranslations.editor.enterTitle).toBe('Please enter a title');
      expect(enTranslations.editor.skitCreated).toBe('New skit created');
      expect(enTranslations.editor.skitCreationError).toBe('Skit creation error');
      expect(enTranslations.editor.skitCreationFailed).toBe('Failed to create skit');
      expect(enTranslations.editor.selectProjectFolder).toBe('Please select a project folder');
      expect(enTranslations.editor.errorLabel).toBe('Error');
      expect(enTranslations.editor.selectPlease).toBe('Please select');
      expect(enTranslations.editor.yes).toBe('Yes');
      expect(enTranslations.editor.no).toBe('No');
      
      expect(enTranslations.language.label).toBe('Language');
      expect(enTranslations.skitList.title).toBe('Skit List');
    });

    it('should have editor translations for Japanese', () => {
      const jaTranslations = i18n.getResourceBundle('ja', 'translation');
      expect(jaTranslations).toBeDefined();
      expect(jaTranslations.editor).toBeDefined();
      expect(jaTranslations.editor.menu.file.new).toBe('新規');
      expect(jaTranslations.editor.menu.file.open).toBe('開く');
      expect(jaTranslations.editor.menu.file.save).toBe('保存');
      expect(jaTranslations.editor.menu.file.saveAs).toBe('名前を付けて保存');
      
      expect(jaTranslations.editor.menu.edit.undo).toBe('元に戻す');
      expect(jaTranslations.editor.menu.edit.redo).toBe('やり直し');
      expect(jaTranslations.editor.menu.edit.cut).toBe('切り取り');
      expect(jaTranslations.editor.menu.edit.copy).toBe('コピー');
      expect(jaTranslations.editor.menu.edit.paste).toBe('貼り付け');
      expect(jaTranslations.editor.menu.edit.delete).toBe('削除');
      expect(jaTranslations.editor.menu.edit.selectAll).toBe('すべて選択');
      
      expect(jaTranslations.editor.toolbar.addCommand).toBe('追加');
      expect(jaTranslations.editor.toolbar.deleteCommand).toBe('コマンドを削除');
      expect(jaTranslations.editor.toolbar.groupCommands).toBe('コマンドをグループ化');
      expect(jaTranslations.editor.toolbar.ungroupCommands).toBe('グループを解除');
      expect(jaTranslations.editor.toolbar.commandAdded).toBe('{{command}}を追加しました');
      expect(jaTranslations.editor.toolbar.projectLoaded).toBe('プロジェクトフォルダを読み込みました');
      expect(jaTranslations.editor.toolbar.projectLoadFailed).toBe('プロジェクトの読み込みに失敗しました');
      expect(jaTranslations.editor.toolbar.skitSaved).toBe('スキットを保存しました');
      expect(jaTranslations.editor.toolbar.saveFailed).toBe('保存に失敗しました: {{error}}');
      expect(jaTranslations.editor.toolbar.openProjectFolder).toBe('プロジェクトフォルダを開く');
      expect(jaTranslations.editor.toolbar.folder).toBe('フォルダ');
      expect(jaTranslations.editor.toolbar.currentDirectory).toBe('現在のディレクトリ');
      expect(jaTranslations.editor.toolbar.noFolderOpen).toBe('フォルダが開かれていません');
      
      expect(jaTranslations.editor.panel.commandList).toBe('コマンドリスト');
      expect(jaTranslations.editor.panel.commandEditor).toBe('コマンドエディター');
      expect(jaTranslations.editor.panel.validation).toBe('検証');
      
      expect(jaTranslations.editor.dialog.unsavedChanges).toBe('保存されていない変更があります。保存しますか？');
      expect(jaTranslations.editor.dialog.confirmDelete).toBe('選択したコマンドを削除してもよろしいですか？');
      expect(jaTranslations.editor.dialog.save).toBe('保存');
      expect(jaTranslations.editor.dialog.cancel).toBe('キャンセル');
      expect(jaTranslations.editor.dialog.discard).toBe('破棄');
      
      expect(jaTranslations.editor.error.fileNotFound).toBe('ファイルが見つかりません');
      expect(jaTranslations.editor.error.invalidCommand).toBe('無効なコマンド');
      expect(jaTranslations.editor.error.loadFailed).toBe('ファイルの読み込みに失敗しました');
      expect(jaTranslations.editor.error.saveFailed).toBe('ファイルの保存に失敗しました');
      
      expect(jaTranslations.editor.validation.required).toBe('この項目は必須です');
      expect(jaTranslations.editor.validation.invalidType).toBe('無効な型です');
      expect(jaTranslations.editor.validation.invalidValue).toBe('無効な値です');
      
      expect(jaTranslations.editor.noSkitSelected).toBe('スキットが選択されていません');
      expect(jaTranslations.editor.noCommandSelected).toBe('コマンドが選択されていません');
      expect(jaTranslations.editor.commandDefinitionNotFound).toBe('コマンド定義が見つかりません');
      expect(jaTranslations.editor.backgroundColor).toBe('背景色');
      expect(jaTranslations.editor.itemsSelected).toBe('{{count}}個選択中');
      expect(jaTranslations.editor.newSkit).toBe('新規作成');
      expect(jaTranslations.editor.createNewSkit).toBe('新規スキット作成');
      expect(jaTranslations.editor.title).toBe('タイトル');
      expect(jaTranslations.editor.enterSkitTitle).toBe('スキットのタイトルを入力');
      expect(jaTranslations.editor.create).toBe('作成');
      expect(jaTranslations.editor.cancel).toBe('キャンセル');
      expect(jaTranslations.editor.creating).toBe('作成中...');
      expect(jaTranslations.editor.enterTitle).toBe('タイトルを入力してください');
      expect(jaTranslations.editor.skitCreated).toBe('新しいスキットを作成しました');
      expect(jaTranslations.editor.skitCreationError).toBe('スキット作成エラー');
      expect(jaTranslations.editor.skitCreationFailed).toBe('スキット作成に失敗しました');
      expect(jaTranslations.editor.selectProjectFolder).toBe('プロジェクトフォルダを選択してください');
      expect(jaTranslations.editor.errorLabel).toBe('エラー');
      expect(jaTranslations.editor.selectPlease).toBe('選択してください');
      expect(jaTranslations.editor.yes).toBe('はい');
      expect(jaTranslations.editor.no).toBe('いいえ');
      
      expect(jaTranslations.language.label).toBe('言語');
      expect(jaTranslations.skitList.title).toBe('スキット一覧');
    });

    it('should translate keys correctly', () => {
      // Test Japanese translations (default language)
      expect(i18n.t('editor.menu.file.new')).toBe('新規');
      expect(i18n.t('editor.toolbar.addCommand')).toBe('追加');
      expect(i18n.t('language.label')).toBe('言語');
      expect(i18n.t('skitList.title')).toBe('スキット一覧');
      
      // Test interpolation
      expect(i18n.t('editor.toolbar.commandAdded', { command: 'テキスト' })).toBe('テキストを追加しました');
      expect(i18n.t('editor.toolbar.saveFailed', { error: 'ファイルエラー' })).toBe('保存に失敗しました: ファイルエラー');
      expect(i18n.t('editor.itemsSelected', { count: 3 })).toBe('3個選択中');
    });

    it('should provide English translations when specifying language', () => {
      expect(i18n.t('editor.menu.file.new', { lng: 'en' })).toBe('New');
      expect(i18n.t('editor.toolbar.addCommand', { lng: 'en' })).toBe('Add');
      expect(i18n.t('language.label', { lng: 'en' })).toBe('Language');
      expect(i18n.t('skitList.title', { lng: 'en' })).toBe('Skit List');
      
      // Test interpolation in English
      expect(i18n.t('editor.toolbar.commandAdded', { command: 'text', lng: 'en' })).toBe('text added');
      expect(i18n.t('editor.toolbar.saveFailed', { error: 'file error', lng: 'en' })).toBe('Failed to save: file error');
      expect(i18n.t('editor.itemsSelected', { count: 3, lng: 'en' })).toBe('3 items selected');
    });

    it('should fallback to English for missing Japanese translations', () => {
      // Add a test key only in English
      i18n.addResource('en', 'translation', 'testKey', 'Test Value');
      
      // Should fallback to English value
      expect(i18n.t('testKey')).toBe('Test Value');
    });

    it('should return key if translation is missing in all languages', () => {
      const missingKey = 'this.key.does.not.exist';
      expect(i18n.t(missingKey)).toBe(missingKey);
    });
  });

  describe('initializeI18n', () => {
    it('should call loadTranslations and return i18n instance', async () => {
      const result = await initializeI18n();
      
      expect(vi.mocked(loadTranslations)).toHaveBeenCalledOnce();
      expect(result).toBe(i18n);
    });

    it('should handle errors in loadTranslations', async () => {
      vi.mocked(loadTranslations).mockRejectedValueOnce(new Error('Load error'));
      
      // Should not throw, just log the error (if any logging is implemented)
      await expect(initializeI18n()).rejects.toThrow('Load error');
    });
  });

  describe('i18n language switching', () => {
    it('should allow changing language', async () => {
      // Change to English
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      expect(i18n.t('editor.menu.file.new')).toBe('New');
      
      // Change back to Japanese
      await i18n.changeLanguage('ja');
      expect(i18n.language).toBe('ja');
      expect(i18n.t('editor.menu.file.new')).toBe('新規');
    });

    it('should emit languageChanged event', async () => {
      const languageChangedHandler = vi.fn();
      i18n.on('languageChanged', languageChangedHandler);
      
      await i18n.changeLanguage('en');
      expect(languageChangedHandler).toHaveBeenCalledWith('en');
      
      await i18n.changeLanguage('ja');
      expect(languageChangedHandler).toHaveBeenCalledWith('ja');
      
      i18n.off('languageChanged', languageChangedHandler);
    });
  });

  describe('i18n resource management', () => {
    it('should allow adding new resources', () => {
      i18n.addResource('en', 'translation', 'newKey', 'New Value');
      expect(i18n.t('newKey', { lng: 'en' })).toBe('New Value');
      
      i18n.addResource('ja', 'translation', 'newKey', '新しい値');
      expect(i18n.t('newKey', { lng: 'ja' })).toBe('新しい値');
    });

    it('should allow adding nested resources', () => {
      i18n.addResource('en', 'translation', 'nested.key.value', 'Nested Value');
      expect(i18n.t('nested.key.value', { lng: 'en' })).toBe('Nested Value');
    });

    it('should check if resource exists', () => {
      expect(i18n.exists('editor.menu.file.new')).toBe(true);
      expect(i18n.exists('nonexistent.key')).toBe(false);
    });
  });
});