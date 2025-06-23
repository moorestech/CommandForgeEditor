// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useSkitStore } from '../../store/skitStore';

// Mock dependencies
vi.mock('../../store/skitStore');
vi.mock('../ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid="select" data-value={value}>
      <button onClick={() => onValueChange && onValueChange('en')} data-testid="select-trigger">
        {children}
      </button>
    </div>
  ),
  SelectTrigger: ({ children, className }: any) => (
    <button role="combobox" data-value={children} className={className} data-testid="select-trigger-inner">
      {children}
    </button>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <div role="option" data-value={value} onClick={() => {}}>{children}</div>
  ),
  SelectValue: () => <span>日本語</span>,
}));

describe('LanguageSwitcher', () => {
  const mockChangeLanguage = vi.fn();
  const mockLanguages = [
    { code: 'ja', name: '日本語' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useSkitStore).mockReturnValue({
      currentLanguage: 'ja',
      availableLanguages: mockLanguages,
      changeLanguage: mockChangeLanguage,
    } as any);
  });

  it('should render with globe icon', () => {
    render(<LanguageSwitcher />);
    
    const globeIcon = document.querySelector('.lucide-globe');
    expect(globeIcon).toBeInTheDocument();
  });

  it('should display current language', () => {
    render(<LanguageSwitcher />);
    
    // SelectValue should display the current language name
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render Select trigger', () => {
    render(<LanguageSwitcher />);
    
    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveClass('w-full');
  });

  it('should render all available languages', () => {
    render(<LanguageSwitcher />);
    
    // Check that the Select has the correct value
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', 'ja');
    
    // Check that all languages are rendered as options
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    
    // Check each option
    expect(options[0]).toHaveAttribute('data-value', 'ja');
    expect(options[1]).toHaveAttribute('data-value', 'en');
    expect(options[2]).toHaveAttribute('data-value', 'zh');
  });

  it('should call changeLanguage when selecting a language', () => {
    render(<LanguageSwitcher />);
    
    // Mock onValueChange will call with 'en' when trigger is clicked
    const trigger = screen.getByTestId('select-trigger');
    fireEvent.click(trigger);
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });

  it('should handle empty language list', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      currentLanguage: 'ja',
      availableLanguages: [],
      changeLanguage: mockChangeLanguage,
    } as any);
    
    render(<LanguageSwitcher />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    // Should not crash and should render empty content
    expect(trigger).toBeInTheDocument();
  });

  it('should display current language value in trigger', () => {
    render(<LanguageSwitcher />);
    
    // The select component should have the current language value
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', 'ja');
  });

  it('should apply correct styles to container', () => {
    render(<LanguageSwitcher />);
    
    const container = document.querySelector('.flex.items-center.gap-2');
    expect(container).toBeInTheDocument();
  });

  it('should apply correct styles to globe icon', () => {
    render(<LanguageSwitcher />);
    
    const globeIcon = document.querySelector('.lucide-globe');
    expect(globeIcon).toHaveClass('h-4', 'w-4', 'text-muted-foreground');
  });

  it('should maintain language order', () => {
    render(<LanguageSwitcher />);
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('日本語');
    expect(options[1]).toHaveTextContent('English');
    expect(options[2]).toHaveTextContent('中文');
  });

  it('should update when language changes externally', () => {
    const { rerender } = render(<LanguageSwitcher />);
    
    // Change the current language
    vi.mocked(useSkitStore).mockReturnValue({
      currentLanguage: 'en',
      availableLanguages: mockLanguages,
      changeLanguage: mockChangeLanguage,
    } as any);
    
    rerender(<LanguageSwitcher />);
    
    const select = screen.getByTestId('select');
    expect(select).toHaveAttribute('data-value', 'en');
  });

  it('should handle single language', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      currentLanguage: 'ja',
      availableLanguages: [{ code: 'ja', name: '日本語' }],
      changeLanguage: mockChangeLanguage,
    } as any);
    
    render(<LanguageSwitcher />);
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveAttribute('data-value', 'ja');
    expect(screen.queryByText('English')).not.toBeInTheDocument();
  });
});