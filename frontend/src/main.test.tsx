import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

describe('main.tsx', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    
    // Mock the DOM
    const root = document.createElement('div');
    root.id = 'root';
    document.body.appendChild(root);
    
    return () => {
      document.body.innerHTML = '';
    };
  });

  it('should initialize i18n before rendering', async () => {
    const mockInitializeI18n = vi.fn().mockResolvedValue({});
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
    
    vi.doMock('./i18n/config', () => ({
      initializeI18n: mockInitializeI18n
    }));
    
    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
    
    vi.doMock('./App', () => ({
      default: () => null
    }));
    
    await import('./main');
    
    await vi.waitFor(() => {
      expect(mockInitializeI18n).toHaveBeenCalled();
    });
  });

  it('should render App component after i18n initialization', async () => {
    const mockInitializeI18n = vi.fn().mockResolvedValue({});
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
    
    vi.doMock('./i18n/config', () => ({
      initializeI18n: mockInitializeI18n
    }));
    
    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
    
    vi.doMock('./App', () => ({
      default: () => null
    }));
    
    await import('./main');
    
    await vi.waitFor(() => {
      expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
      expect(mockRender).toHaveBeenCalled();
    });
  });

  it('should set localStorage language to ja in development mode', async () => {
    (import.meta as any).env = { DEV: true };
    const mockGetItem = vi.fn().mockReturnValue('en');
    const mockSetItem = vi.fn();
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
      configurable: true,
    });
    
    const mockInitializeI18n = vi.fn().mockResolvedValue({});
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
    
    vi.doMock('./i18n/config', () => ({
      initializeI18n: mockInitializeI18n
    }));
    
    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
    
    vi.doMock('./App', () => ({
      default: () => null
    }));
    
    await import('./main');
    
    await vi.waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('i18nextLng', 'ja');
    });
  });

  it('should not set localStorage if already ja in development mode', async () => {
    (import.meta as any).env = { DEV: true };
    const mockGetItem = vi.fn().mockReturnValue('ja');
    const mockSetItem = vi.fn();
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: mockGetItem,
        setItem: mockSetItem,
      },
      configurable: true,
    });
    
    const mockInitializeI18n = vi.fn().mockResolvedValue({});
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
    
    vi.doMock('./i18n/config', () => ({
      initializeI18n: mockInitializeI18n
    }));
    
    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
    
    vi.doMock('./App', () => ({
      default: () => null
    }));
    
    await import('./main');
    
    await vi.waitFor(() => {
      expect(mockInitializeI18n).toHaveBeenCalled();
    });
    
    expect(mockSetItem).not.toHaveBeenCalled();
  });

  it('should find root element by id', async () => {
    const mockInitializeI18n = vi.fn().mockResolvedValue({});
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
    
    vi.doMock('./i18n/config', () => ({
      initializeI18n: mockInitializeI18n
    }));
    
    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
    
    vi.doMock('./App', () => ({
      default: () => null
    }));
    
    await import('./main');
    
    await vi.waitFor(() => {
      expect(mockCreateRoot).toHaveBeenCalledWith(document.getElementById('root'));
      const rootElement = mockCreateRoot.mock.calls[0][0];
      expect(rootElement.id).toBe('root');
    });
  });

  it('should render in StrictMode', async () => {
    const mockInitializeI18n = vi.fn().mockResolvedValue({});
    const mockRender = vi.fn();
    const mockCreateRoot = vi.fn().mockReturnValue({ render: mockRender });
    
    vi.doMock('./i18n/config', () => ({
      initializeI18n: mockInitializeI18n
    }));
    
    vi.doMock('react-dom/client', () => ({
      createRoot: mockCreateRoot
    }));
    
    vi.doMock('./App', () => ({
      default: () => null
    }));
    
    await import('./main');
    
    await vi.waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
      const renderArg = mockRender.mock.calls[0][0];
      expect(renderArg.type).toBe(React.StrictMode);
    });
  });
});