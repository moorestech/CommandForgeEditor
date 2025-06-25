// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { useSkitStore } from './store/skitStore';
import * as fileSystem from './utils/fileSystem';
import * as devFileSystem from './utils/devFileSystem';
import React from 'react';
import i18n from './i18n/config';

// Mock modules
vi.mock('./store/skitStore');
vi.mock('./utils/fileSystem');
vi.mock('./utils/devFileSystem');
vi.mock('./hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

// Mock UI components to avoid complex setup
vi.mock('./components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div>,
}));

vi.mock('./components/skit/CommandList', () => ({
  CommandList: () => <div data-testid="command-list">Command List</div>,
}));

vi.mock('./components/skit/CommandEditor', () => ({
  CommandEditor: () => <div data-testid="command-editor">Command Editor</div>,
}));

vi.mock('./components/skit/Toolbar', () => ({
  Toolbar: () => <div data-testid="toolbar">Toolbar</div>,
}));

vi.mock('./components/skit/ValidationLog', () => ({
  ValidationLog: () => <div data-testid="validation-log">Validation Log</div>,
}));

vi.mock('./components/dnd/DndProvider', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="dnd-provider">{children}</div>,
}));

vi.mock('./components/ui/resizable', () => ({
  ResizablePanelGroup: ({ children }: any) => <div data-testid="resizable-panel-group">{children}</div>,
  ResizablePanel: ({ children }: any) => <div data-testid="resizable-panel">{children}</div>,
  ResizableHandle: () => <div data-testid="resizable-handle" />,
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock('react-i18next', () => ({
  I18nextProvider: ({ children }: any) => <div data-testid="i18next-provider">{children}</div>,
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: vi.fn(),
      language: 'ja',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

describe('App', () => {
  const mockLoadCommandsYaml = vi.fn();
  const mockLoadSkits = vi.fn();
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Initialize i18n
    if (!i18n.isInitialized) {
      await i18n.init();
    }
    
    vi.mocked(useSkitStore).mockReturnValue({
      loadCommandsYaml: mockLoadCommandsYaml,
      loadSkits: mockLoadSkits,
      projectPath: '/test/path',
    } as any);
    
    // Reset import.meta.env
    (import.meta as any).env = { DEV: false };
  });

  it('should render all main components', () => {
    render(<App />);
    
    expect(screen.getByTestId('i18next-provider')).toBeInTheDocument();
    expect(screen.getByTestId('dnd-provider')).toBeInTheDocument();
    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('command-list')).toBeInTheDocument();
    expect(screen.getByTestId('command-editor')).toBeInTheDocument();
    expect(screen.getByTestId('validation-log')).toBeInTheDocument();
    expect(screen.getByTestId('toaster')).toBeInTheDocument();
  });

  it('should load initial data on mount', async () => {
    const mockCommandsYaml = 'test yaml content';
    const mockSkitsData = { 
      'test-skit': { 
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2024-01-01T00:00:00Z',
          modified: '2024-01-01T00:00:00Z'
        }, 
        commands: [] 
      } 
    };
    
    vi.mocked(fileSystem.loadCommandsYaml).mockResolvedValue(mockCommandsYaml);
    vi.mocked(fileSystem.loadSkits).mockResolvedValue(mockSkitsData);
    
    render(<App />);
    
    await waitFor(() => {
      expect(fileSystem.loadCommandsYaml).toHaveBeenCalledWith('/test/path');
      expect(fileSystem.loadSkits).toHaveBeenCalledWith('/test/path');
      expect(mockLoadCommandsYaml).toHaveBeenCalledWith(mockCommandsYaml);
      expect(mockLoadSkits).toHaveBeenCalledWith(mockSkitsData);
    });
  });


  it('should load sample data in development mode when main data fails', async () => {
    (import.meta as any).env = { DEV: true };
    
    const mockSampleSkits = { 
      'sample-skit': { 
        meta: {
          title: 'Sample Skit',
          version: 1,
          created: '2024-01-01T00:00:00Z',
          modified: '2024-01-01T00:00:00Z'
        }, 
        commands: [] 
      } 
    };
    const mockSampleYaml = 'sample yaml';
    
    vi.mocked(fileSystem.loadCommandsYaml).mockRejectedValue(new Error('Load error'));
    vi.mocked(fileSystem.loadSkits).mockRejectedValue(new Error('Load error'));
    vi.mocked(devFileSystem.loadSampleSkit).mockResolvedValue(mockSampleSkits);
    vi.mocked(devFileSystem.loadSampleCommandsYaml).mockResolvedValue(mockSampleYaml);
    
    render(<App />);
    
    await waitFor(() => {
      expect(devFileSystem.loadSampleSkit).toHaveBeenCalled();
      expect(devFileSystem.loadSampleCommandsYaml).toHaveBeenCalled();
      expect(mockLoadSkits).toHaveBeenCalledWith(mockSampleSkits);
      expect(mockLoadCommandsYaml).toHaveBeenCalledWith(mockSampleYaml);
    });
  });

  it('should handle errors when loading sample skit data', async () => {
    (import.meta as any).env = { DEV: true };
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(fileSystem.loadCommandsYaml).mockRejectedValue(new Error('Load error'));
    vi.mocked(fileSystem.loadSkits).mockRejectedValue(new Error('Load error'));
    vi.mocked(devFileSystem.loadSampleSkit).mockRejectedValue(new Error('Sample load error'));
    vi.mocked(devFileSystem.loadSampleCommandsYaml).mockResolvedValue('sample yaml');
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load sample skit:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle errors when loading sample commands yaml', async () => {
    (import.meta as any).env = { DEV: true };
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(fileSystem.loadCommandsYaml).mockRejectedValue(new Error('Load error'));
    vi.mocked(fileSystem.loadSkits).mockRejectedValue(new Error('Load error'));
    vi.mocked(devFileSystem.loadSampleSkit).mockResolvedValue({});
    vi.mocked(devFileSystem.loadSampleCommandsYaml).mockRejectedValue(new Error('Yaml load error'));
    
    render(<App />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load sample commands.yaml:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  it('should render resizable panels with correct structure', () => {
    render(<App />);
    
    expect(screen.getByTestId('resizable-panel-group')).toBeInTheDocument();
    expect(screen.getAllByTestId('resizable-panel')).toHaveLength(2);
    expect(screen.getByTestId('resizable-handle')).toBeInTheDocument();
  });

  it('should not reload data when projectPath does not change', () => {
    const { rerender } = render(<App />);
    
    // Clear mocks after initial load
    vi.clearAllMocks();
    
    // Re-render with same props
    rerender(<App />);
    
    // Should not load data again
    expect(fileSystem.loadCommandsYaml).not.toHaveBeenCalled();
    expect(fileSystem.loadSkits).not.toHaveBeenCalled();
  });

  it('should handle successful initial data load in production', async () => {
    (import.meta as any).env = { DEV: false };
    
    const mockCommandsYaml = 'production yaml';
    const mockSkitsData = { 
      'prod-skit': { 
        meta: {
          title: 'Production Skit',
          version: 1,
          created: '2024-01-01T00:00:00Z',
          modified: '2024-01-01T00:00:00Z'
        }, 
        commands: [] 
      } 
    };
    
    vi.mocked(fileSystem.loadCommandsYaml).mockResolvedValue(mockCommandsYaml);
    vi.mocked(fileSystem.loadSkits).mockResolvedValue(mockSkitsData);
    
    render(<App />);
    
    await waitFor(() => {
      expect(mockLoadCommandsYaml).toHaveBeenCalledWith(mockCommandsYaml);
      expect(mockLoadSkits).toHaveBeenCalledWith(mockSkitsData);
      // Should not call dev file system in production
      expect(devFileSystem.loadSampleSkit).not.toHaveBeenCalled();
      expect(devFileSystem.loadSampleCommandsYaml).not.toHaveBeenCalled();
    });
  });

  it('should handle when projectPath is null', async () => {
    vi.mocked(useSkitStore).mockReturnValue({
      loadCommandsYaml: mockLoadCommandsYaml,
      loadSkits: mockLoadSkits,
      projectPath: null,
    } as any);
    
    render(<App />);
    
    await waitFor(() => {
      expect(fileSystem.loadCommandsYaml).toHaveBeenCalledWith(null);
      expect(fileSystem.loadSkits).toHaveBeenCalledWith(null);
    });
  });});