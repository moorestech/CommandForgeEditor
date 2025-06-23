// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainLayout } from './MainLayout';
import { useSkitStore } from '@/store/skitStore';
import { useTranslation } from 'react-i18next';

// Mock dependencies
vi.mock('@/store/skitStore');
vi.mock('react-i18next');
vi.mock('../skit/SkitList', () => ({
  SkitList: () => <div data-testid="skit-list">Skit List</div>
}));
vi.mock('./LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>
}));
vi.mock('../ui/sidebar', () => ({
  Sidebar: ({ children }: any) => <div data-testid="sidebar">{children}</div>,
  SidebarProvider: ({ children, defaultOpen }: any) => (
    <div data-testid="sidebar-provider" data-default-open={defaultOpen}>
      {children}
    </div>
  ),
  SidebarHeader: ({ children, className }: any) => (
    <div data-testid="sidebar-header" className={className}>
      {children}
    </div>
  ),
  SidebarContent: ({ children }: any) => <div data-testid="sidebar-content">{children}</div>,
  SidebarFooter: ({ children, className }: any) => (
    <div data-testid="sidebar-footer" className={className}>
      {children}
    </div>
  ),
}));
vi.mock('../ui/separator', () => ({
  Separator: ({ className }: any) => <hr data-testid="separator" className={className} />
}));

describe('MainLayout', () => {
  const mockOpenFolder = vi.fn();
  const mockT = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useSkitStore).mockReturnValue({
      projectPath: '/path/to/project',
      openFolder: mockOpenFolder,
    } as any);
    
    mockT.mockImplementation((key) => {
      const translations: Record<string, string> = {
        'editor.toolbar.currentDirectory': '現在のディレクトリ',
        'editor.toolbar.noFolderOpen': 'フォルダが開かれていません',
        'editor.toolbar.folder': 'フォルダ',
        'skitList.title': 'スキット一覧',
        'language.label': '言語',
      };
      return translations[key] || key;
    });
    
    vi.mocked(useTranslation).mockReturnValue({
      t: mockT,
      i18n: {} as any,
      ready: true,
    });
  });

  it('should render children', () => {
    render(
      <MainLayout>
        <div data-testid="child-content">Child Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should render sidebar components', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-footer')).toBeInTheDocument();
  });

  it('should render SidebarProvider with defaultOpen false', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const provider = screen.getByTestId('sidebar-provider');
    expect(provider).toHaveAttribute('data-default-open', 'false');
  });

  it('should display current project path', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByText('現在のディレクトリ')).toBeInTheDocument();
    expect(screen.getByText('/path/to/project')).toBeInTheDocument();
  });

  it('should display no folder open message when projectPath is null', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      projectPath: null,
      openFolder: mockOpenFolder,
    } as any);
    
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByText('フォルダが開かれていません')).toBeInTheDocument();
  });

  it('should render folder open button', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const button = screen.getByRole('button', { name: /フォルダ/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('w-full', 'justify-start');
  });

  it('should call openFolder when button is clicked', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const button = screen.getByRole('button', { name: /フォルダ/i });
    fireEvent.click(button);
    
    expect(mockOpenFolder).toHaveBeenCalledTimes(1);
  });

  it('should render folder icon in button', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const icon = document.querySelector('.lucide-folder-open');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('mr-2', 'h-4', 'w-4');
  });

  it('should render skit list title', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByText('スキット一覧')).toBeInTheDocument();
  });

  it('should render SkitList component', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('skit-list')).toBeInTheDocument();
  });

  it('should render LanguageSwitcher component', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
  });

  it('should render language label', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByText('言語')).toBeInTheDocument();
  });

  it('should render separators', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const separators = screen.getAllByTestId('separator');
    expect(separators).toHaveLength(2);
    expect(separators[0]).toHaveClass('mt-3');
    expect(separators[1]).toHaveClass('mb-3');
  });

  it('should apply correct layout classes', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const layoutContainer = screen.getByTestId('sidebar-provider').firstChild;
    expect(layoutContainer).toHaveClass('flex', 'h-screen', 'w-full');
  });

  it('should apply correct content container classes', () => {
    render(
      <MainLayout>
        <div data-testid="child">Content</div>
      </MainLayout>
    );
    
    const childContainer = screen.getByTestId('child').parentElement;
    expect(childContainer).toHaveClass('flex-1', 'flex', 'flex-col', 'overflow-hidden', 'w-full');
  });

  it('should apply title attribute to project path for truncation', () => {
    const longPath = '/very/long/path/to/project/folder/that/might/be/truncated';
    vi.mocked(useSkitStore).mockReturnValue({
      projectPath: longPath,
      openFolder: mockOpenFolder,
    } as any);
    
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const pathElement = screen.getByText(longPath);
    expect(pathElement).toHaveAttribute('title', longPath);
    expect(pathElement).toHaveClass('text-sm', 'font-mono', 'truncate');
  });

  it('should not set title attribute when projectPath is null', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      projectPath: null,
      openFolder: mockOpenFolder,
    } as any);
    
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    const pathElement = screen.getByText('フォルダが開かれていません');
    expect(pathElement).not.toHaveAttribute('title');
  });

  it('should render multiple children', () => {
    render(
      <MainLayout>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
        <div data-testid="child3">Child 3</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
    expect(screen.getByTestId('child3')).toBeInTheDocument();
  });

  it('should apply correct spacing classes', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    );
    
    expect(screen.getByTestId('sidebar-header')).toHaveClass('p-4', 'space-y-3');
    expect(screen.getByTestId('sidebar-footer')).toHaveClass('p-4', 'pt-2');
  });
});