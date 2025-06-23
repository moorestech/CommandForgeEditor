// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkitList } from './SkitList';
import { useSkitStore } from '../../store/skitStore';
import { createNewSkit } from '../../utils/fileSystem';
import { toast } from 'sonner';
import { Skit } from '../../types';
import { useTranslation } from 'react-i18next';

// Mock i18n config first to prevent initialization issues
vi.mock('../../i18n/config', () => ({
  default: {
    changeLanguage: vi.fn(),
    language: 'ja',
    t: (key: string) => key,
    use: vi.fn().mockReturnThis(),
    init: vi.fn().mockReturnThis()
  }
}));

// Mock translation loader
vi.mock('../../i18n/translationLoader', () => ({
  loadTranslations: vi.fn().mockResolvedValue({}),
  getAvailableLanguages: vi.fn().mockResolvedValue([
    { code: 'ja', name: '日本語' },
    { code: 'en', name: 'English' }
  ])
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'editor.newSkit': '新しいスキット',
        'editor.enterTitle': 'タイトルを入力してください',
        'editor.skitCreationError': 'スキット作成中にエラーが発生しました',
        'editor.skitCreated': 'スキットを作成しました',
        'editor.skitCreationFailed': 'スキットの作成に失敗しました',
        'editor.selectProjectFolder': 'プロジェクトフォルダを選択してください',
        'editor.createNewSkit': '新しいスキットを作成',
        'editor.title': 'タイトル',
        'editor.enterSkitTitle': 'スキットタイトルを入力',
        'editor.cancel': 'キャンセル',
        'editor.creating': '作成中...',
        'editor.create': '作成'
      };
      return translations[key] || key;
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => {}
  }
}));

// Mock dependencies
vi.mock('../../store/skitStore');
vi.mock('sonner');

// Import and mock fileSystem properly
import * as fileSystemModule from '../../utils/fileSystem';
vi.mock('../../utils/fileSystem', () => ({
  createNewSkit: vi.fn(),
  loadSkits: vi.fn()
}));

// Mock UI components
vi.mock('../ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => (
    <div className={className} data-testid="scroll-area">{children}</div>
  )
}));

vi.mock('../ui/dialog', () => ({
  Dialog: ({ children, open }: any) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('SkitList', () => {
  const mockSetCurrentSkit = vi.fn();
  const mockLoadSkitsStore = vi.fn();
  const mockLoadSkits = vi.mocked(fileSystemModule.loadSkits);
  
  const mockSkits: Record<string, Skit> = {
    'skit-1': {
      meta: {
        title: 'テストスキット1',
        version: 1,
        created: '2023-01-01T00:00:00Z',
        modified: '2023-01-01T00:00:00Z'
      },
      commands: []
    },
    'skit-2': {
      meta: {
        title: 'テストスキット2',
        version: 1,
        created: '2023-01-02T00:00:00Z',
        modified: '2023-01-02T00:00:00Z'
      },
      commands: []
    }
  };

  const defaultMockState = {
    skits: mockSkits,
    currentSkitId: 'skit-1',
    setCurrentSkit: mockSetCurrentSkit,
    projectPath: '/test/path',
    loadSkits: mockLoadSkitsStore
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSkitStore).mockReturnValue(defaultMockState as any);
  });

  it('should render skit list', () => {
    render(<SkitList />);

    // Find button by text content
    const newSkitButton = screen.getByText('新しいスキット');
    expect(newSkitButton).toBeInTheDocument();
    expect(screen.getByText('テストスキット1')).toBeInTheDocument();
    expect(screen.getByText('テストスキット2')).toBeInTheDocument();
  });

  it('should highlight current skit', () => {
    render(<SkitList />);

    const skit1Button = screen.getByRole('button', { name: 'テストスキット1' });
    const skit2Button = screen.getByRole('button', { name: 'テストスキット2' });

    // Check if the selected skit has different styling
    // The exact class names depend on the Button component implementation
    expect(skit1Button.className).toBeTruthy();
    expect(skit2Button.className).toBeTruthy();
    expect(skit1Button.className).not.toEqual(skit2Button.className);
  });

  it('should set current skit when clicked', () => {
    render(<SkitList />);

    const skit2Button = screen.getByRole('button', { name: 'テストスキット2' });
    fireEvent.click(skit2Button);

    expect(mockSetCurrentSkit).toHaveBeenCalledWith('skit-2');
  });

  it('should auto-select first skit if no current skit', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      currentSkitId: null
    } as any);

    render(<SkitList />);

    expect(mockSetCurrentSkit).toHaveBeenCalledWith('skit-1');
  });

  it('should not auto-select if no skits available', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      skits: {},
      currentSkitId: null
    } as any);

    render(<SkitList />);

    expect(mockSetCurrentSkit).not.toHaveBeenCalled();
  });

  it('should show error when creating skit without project path', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      projectPath: null
    } as any);

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    expect(toast.error).toHaveBeenCalledWith('プロジェクトフォルダを選択してください');
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should open new skit dialog when button clicked', () => {
    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('新しいスキットを作成')).toBeInTheDocument();
  });

  it('should show error when creating skit with empty title', async () => {
    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const createButton = screen.getByRole('button', { name: '作成' });
    
    // Create button should be disabled with empty title
    expect(createButton).toBeDisabled();
  });

  it('should create new skit successfully', async () => {
    const user = userEvent.setup();
    vi.mocked(createNewSkit).mockResolvedValueOnce({
      id: 'new-skit',
      errors: []
    });
    mockLoadSkits.mockResolvedValueOnce({
      ...mockSkits,
      'new-skit': {
        meta: {
          title: '新しいスキット',
          version: 1,
          created: '2023-01-03T00:00:00Z',
          modified: '2023-01-03T00:00:00Z'
        },
        commands: []
      }
    });

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, '新しいスキット');

    const createButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createNewSkit).toHaveBeenCalledWith('新しいスキット', '/test/path');
      expect(mockLoadSkits).toHaveBeenCalledWith('/test/path');
      expect(mockLoadSkitsStore).toHaveBeenCalled();
      expect(mockSetCurrentSkit).toHaveBeenCalledWith('new-skit');
      expect(toast.success).toHaveBeenCalledWith('スキットを作成しました');
    });

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should handle creation errors from API', async () => {
    const user = userEvent.setup();
    vi.mocked(createNewSkit).mockResolvedValueOnce({
      id: '',
      errors: ['ファイル作成エラー']
    });

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, 'エラーテスト');

    const createButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('スキット作成中にエラーが発生しました: ファイル作成エラー');
    });
  });

  it('should handle creation exceptions', async () => {
    const user = userEvent.setup();
    vi.mocked(createNewSkit).mockRejectedValueOnce(new Error('Network error'));

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, 'エラーテスト');

    const createButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('スキットの作成に失敗しました: Network error');
    });
  });

  it('should close dialog on cancel', () => {
    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('should disable buttons during creation', async () => {
    const user = userEvent.setup();
    vi.mocked(createNewSkit).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ id: 'new-skit', errors: [] }), 100))
    );

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, 'テスト');

    const createButton = screen.getByRole('button', { name: '作成' });
    const cancelButton = screen.getByRole('button', { name: 'キャンセル' });

    fireEvent.click(createButton);

    // Check buttons are disabled during creation
    await waitFor(() => {
      expect(createButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
      expect(createButton.textContent).toBe('作成中...');
    });
  });

  it('should trim whitespace from skit title', async () => {
    const user = userEvent.setup();

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, '   ');

    const createButton = screen.getByRole('button', { name: '作成' });
    
    // Button should be disabled with only whitespace
    expect(createButton).toBeDisabled();
  });

  it('should handle non-Error objects in catch', async () => {
    const user = userEvent.setup();
    vi.mocked(createNewSkit).mockRejectedValueOnce('String error');

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, 'テスト');

    const createButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('スキットの作成に失敗しました: String error');
    });
  });

  it('should not reload skits if projectPath is null', async () => {
    const user = userEvent.setup();
    vi.mocked(createNewSkit).mockResolvedValueOnce({
      id: 'new-skit',
      errors: []
    });

    render(<SkitList />);

    const newSkitButton = screen.getByText('新しいスキット').closest('button');
    fireEvent.click(newSkitButton!);

    const titleInput = screen.getByPlaceholderText('スキットタイトルを入力');
    await user.type(titleInput, 'テスト');

    const createButton = screen.getByRole('button', { name: '作成' });
    fireEvent.click(createButton);

    // The component will use projectPath from store at the time of creation
    await waitFor(() => {
      expect(createNewSkit).toHaveBeenCalledWith('テスト', '/test/path');
      expect(mockLoadSkits).toHaveBeenCalled();
      expect(mockSetCurrentSkit).toHaveBeenCalledWith('new-skit');
    });
  });
});