import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { loadTranslations } from './translationLoader';

// Fixed translations for editor UI
const editorTranslations = {
  en: {
    translation: {
      editor: {
        menu: {
          file: {
            new: 'New',
            open: 'Open',
            save: 'Save',
            saveAs: 'Save As',
          },
          edit: {
            undo: 'Undo',
            redo: 'Redo',
            cut: 'Cut',
            copy: 'Copy',
            paste: 'Paste',
            delete: 'Delete',
            selectAll: 'Select All',
          },
        },
        toolbar: {
          addCommand: 'Add',
          deleteCommand: 'Delete Command',
          groupCommands: 'Group Commands',
          ungroupCommands: 'Ungroup Commands',
          commandAdded: '{{command}} added',
          projectLoaded: 'Project folder loaded',
          projectLoadFailed: 'Failed to load project',
          skitSaved: 'Skit saved',
          saveFailed: 'Failed to save: {{error}}',
          openProjectFolder: 'Open project folder',
          folder: 'Folder',
        },
        panel: {
          commandList: 'Command List',
          commandEditor: 'Command Editor',
          validation: 'Validation',
        },
        dialog: {
          unsavedChanges: 'You have unsaved changes. Do you want to save them?',
          confirmDelete: 'Are you sure you want to delete the selected commands?',
          save: 'Save',
          cancel: 'Cancel',
          discard: 'Discard',
        },
        error: {
          fileNotFound: 'File not found',
          invalidCommand: 'Invalid command',
          loadFailed: 'Failed to load file',
          saveFailed: 'Failed to save file',
        },
        validation: {
          required: 'This field is required',
          invalidType: 'Invalid type',
          invalidValue: 'Invalid value',
        },
        noSkitSelected: 'No skit selected',
        noCommandSelected: 'No command selected',
        commandDefinitionNotFound: 'Command definition not found',
        backgroundColor: 'Background Color',
        itemsSelected: '{{count}} items selected',
        newSkit: 'New Skit',
        createNewSkit: 'Create New Skit',
        title: 'Title',
        enterSkitTitle: 'Enter skit title',
        create: 'Create',
        cancel: 'Cancel',
        creating: 'Creating...',
        enterTitle: 'Please enter a title',
        skitCreated: 'New skit created',
        skitCreationError: 'Skit creation error',
        skitCreationFailed: 'Failed to create skit',
        selectProjectFolder: 'Please select a project folder',
        errorLabel: 'Error',
        selectPlease: 'Please select',
        yes: 'Yes',
        no: 'No',
      },
    },
  },
  ja: {
    translation: {
      editor: {
        menu: {
          file: {
            new: '新規',
            open: '開く',
            save: '保存',
            saveAs: '名前を付けて保存',
          },
          edit: {
            undo: '元に戻す',
            redo: 'やり直し',
            cut: '切り取り',
            copy: 'コピー',
            paste: '貼り付け',
            delete: '削除',
            selectAll: 'すべて選択',
          },
        },
        toolbar: {
          addCommand: '追加',
          deleteCommand: 'コマンドを削除',
          groupCommands: 'コマンドをグループ化',
          ungroupCommands: 'グループを解除',
          commandAdded: '{{command}}を追加しました',
          projectLoaded: 'プロジェクトフォルダを読み込みました',
          projectLoadFailed: 'プロジェクトの読み込みに失敗しました',
          skitSaved: 'スキットを保存しました',
          saveFailed: '保存に失敗しました: {{error}}',
          openProjectFolder: 'プロジェクトフォルダを開く',
          folder: 'フォルダ',
        },
        panel: {
          commandList: 'コマンドリスト',
          commandEditor: 'コマンドエディター',
          validation: '検証',
        },
        dialog: {
          unsavedChanges: '保存されていない変更があります。保存しますか？',
          confirmDelete: '選択したコマンドを削除してもよろしいですか？',
          save: '保存',
          cancel: 'キャンセル',
          discard: '破棄',
        },
        error: {
          fileNotFound: 'ファイルが見つかりません',
          invalidCommand: '無効なコマンド',
          loadFailed: 'ファイルの読み込みに失敗しました',
          saveFailed: 'ファイルの保存に失敗しました',
        },
        validation: {
          required: 'この項目は必須です',
          invalidType: '無効な型です',
          invalidValue: '無効な値です',
        },
        noSkitSelected: 'スキットが選択されていません',
        noCommandSelected: 'コマンドが選択されていません',
        commandDefinitionNotFound: 'コマンド定義が見つかりません',
        backgroundColor: '背景色',
        itemsSelected: '{{count}}個選択中',
        newSkit: '新規作成',
        createNewSkit: '新規スキット作成',
        title: 'タイトル',
        enterSkitTitle: 'スキットのタイトルを入力',
        create: '作成',
        cancel: 'キャンセル',
        creating: '作成中...',
        enterTitle: 'タイトルを入力してください',
        skitCreated: '新しいスキットを作成しました',
        skitCreationError: 'スキット作成エラー',
        skitCreationFailed: 'スキット作成に失敗しました',
        selectProjectFolder: 'プロジェクトフォルダを選択してください',
        errorLabel: 'エラー',
        selectPlease: '選択してください',
        yes: 'はい',
        no: 'いいえ',
      },
    },
  },
};

// Initialize i18n immediately
i18n
  .use(initReactI18next)
  .init({
    resources: editorTranslations,
    lng: 'ja', // 強制的に日本語を使用
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Suspenseを無効化
    },
  });

export async function initializeI18n() {
  // Load dynamic translations
  await loadTranslations();
  return i18n;
}

export default i18n;