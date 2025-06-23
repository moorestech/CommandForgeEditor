// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandEditor } from './CommandEditor';
import { useSkitStore } from '../../store/skitStore';
import { CommandDefinition, Skit, SkitCommand } from '../../types';

// Mock dependencies
vi.mock('../../store/skitStore');

vi.mock('../../hooks/useCommandTranslation', () => ({
  useCommandTranslation: (_commandType: string) => ({
    tCommand: (_key: string, fallback: string) => fallback,
    tProperty: (_propKey: string, _key: string, fallback: string) => fallback,
    tEnum: (_propKey: string, _value: string, fallback: string, _masterKey?: string) => fallback,
  })
}));

vi.mock('../ui/color-picker', () => ({
  ColorPicker: ({ value, onChange, placeholder, isMixed }: any) => (
    <input
      data-testid="color-picker"
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      data-mixed={isMixed}
    />
  )
}));

vi.mock('../ui/vector-input', () => ({
  VectorInput: ({ value, dimension, integer, onChange, isMixed }: any) => (
    <div data-testid="vector-input" data-dimension={dimension} data-integer={integer} data-mixed={isMixed}>
      {Array.from({ length: dimension }).map((_, i) => (
        <input
          key={i}
          type="number"
          value={value?.[i] || ''}
          onChange={(e) => {
            const newValue = [...(value || [])];
            newValue[i] = integer ? parseInt(e.target.value) : parseFloat(e.target.value);
            onChange(newValue);
          }}
        />
      ))}
    </div>
  )
}));

describe('CommandEditor', () => {
  const mockUpdateCommand = vi.fn();
  
  const mockCommandDefinitions: CommandDefinition[] = [
    {
      id: 'text',
      label: 'Text',
      description: 'Display text',
      commandListLabelFormat: 'TEXT: {character}, {body}',
      properties: {
        character: {
          type: 'string',
          required: true
        },
        body: {
          type: 'string',
          required: true,
          multiline: true
        },
        delay: {
          type: 'number',
          required: false,
          default: 0,
          constraints: { min: 0, max: 5000 }
        },
        flag: {
          type: 'boolean',
          required: false
        }
      }
    },
    {
      id: 'choice',
      label: 'Choice',
      description: 'Show choices',
      commandListLabelFormat: 'CHOICE: {options}',
      properties: {
        options: {
          type: 'enum',
          required: true,
          options: ['option1', 'option2', 'option3']
        }
      }
    },
    {
      id: 'move',
      label: 'Move',
      description: 'Move object',
      commandListLabelFormat: 'MOVE: {position}',
      properties: {
        position: {
          type: 'vector3',
          required: true
        },
        gridPosition: {
          type: 'vector2Int',
          required: false
        }
      }
    },
    {
      id: 'load',
      label: 'Load',
      description: 'Load asset',
      commandListLabelFormat: 'LOAD: {asset}',
      properties: {
        asset: {
          type: 'asset',
          required: true
        }
      }
    },
    {
      id: 'jump',
      label: 'Jump',
      description: 'Jump to command',
      commandListLabelFormat: 'JUMP: {target}',
      properties: {
        target: {
          type: 'command',
          required: true
        }
      }
    }
  ];

  const mockSkit: Skit = {
    meta: {
      title: 'Test Skit',
      version: 1,
      created: '2023-01-01T00:00:00Z',
      modified: '2023-01-01T00:00:00Z'
    },
    commands: [
      {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: 'Hello',
        delay: 1000,
        flag: true,
        backgroundColor: '#ff0000'
      },
      {
        id: 2,
        type: 'text',
        character: 'Bob',
        body: 'Hi',
        delay: 2000,
        flag: false,
        backgroundColor: '#00ff00'
      },
      {
        id: 3,
        type: 'choice',
        options: 'option1'
      },
      {
        id: 4,
        type: 'move',
        position: [1, 2, 3],
        gridPosition: [10, 20]
      },
      {
        id: 5,
        type: 'load',
        asset: 'path/to/asset.png'
      },
      {
        id: 6,
        type: 'jump',
        target: 1
      }
    ]
  };

  const commandsMap = new Map(mockCommandDefinitions.map(def => [def.id, def]));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render no command selected message when no commands are selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    expect(screen.getByText('コマンドが選択されていません')).toBeInTheDocument();
  });

  it('should render no command selected message when no skit is selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    expect(screen.getByText('コマンドが選択されていません')).toBeInTheDocument();
  });

  it('should render command definition not found when command type is unknown', () => {
    const skitWithUnknownCommand = {
      ...mockSkit,
      commands: [{ id: 1, type: 'unknown' }]
    };

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': skitWithUnknownCommand },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    expect(screen.getByText(/コマンド定義が見つかりません.*unknown/)).toBeInTheDocument();
  });

  it('should render single command editor', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('背景色')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Hello')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
  });

  it('should handle string property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const characterInput = screen.getByDisplayValue('Alice');
    fireEvent.change(characterInput, { target: { value: 'Charlie' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(1, { character: 'Charlie' });
  });

  it('should handle multiline string property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const bodyTextarea = screen.getByDisplayValue('Hello');
    fireEvent.change(bodyTextarea, { target: { value: 'New message' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(1, { body: 'New message' });
  });

  it('should handle number property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const delayInput = screen.getByDisplayValue('1000');
    fireEvent.change(delayInput, { target: { value: '3000' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(1, { delay: 3000 });
  });

  it('should handle boolean property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    // Find and click the select trigger for the boolean property
    const selectTriggers = screen.getAllByRole('combobox');
    const booleanSelect = selectTriggers.find(el => el.textContent === 'はい');
    
    fireEvent.click(booleanSelect!);
    fireEvent.click(screen.getByText('いいえ'));
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(1, { flag: false });
  });

  it('should handle background color changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const colorPicker = screen.getByTestId('color-picker');
    fireEvent.change(colorPicker, { target: { value: '#0000ff' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(1, { backgroundColor: '#0000ff' });
  });

  it('should handle enum property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [3],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    fireEvent.click(screen.getByText('option2'));
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(3, { options: 'option2' });
  });

  it('should handle vector property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [4],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const vectorInputs = screen.getAllByTestId('vector-input');
    const positionInput = vectorInputs.find(el => el.getAttribute('data-dimension') === '3');
    const inputs = positionInput!.querySelectorAll('input');
    
    fireEvent.change(inputs[0], { target: { value: '5' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(4, { position: [5, 2, 3] });
  });

  it('should handle asset property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [5],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const assetInput = screen.getByDisplayValue('path/to/asset.png');
    fireEvent.change(assetInput, { target: { value: 'new/path.png' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(5, { asset: 'new/path.png' });
  });

  it('should handle command property changes', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [6],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    
    // Should show command previews - get all instances and click the one in the dropdown
    const commandOptions = screen.getAllByText('2: TEXT: Bob, Hi');
    const dropdownOption = commandOptions.find(el => el.getAttribute('id')?.includes('radix'));
    fireEvent.click(dropdownOption!);
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(6, { target: 2 });
  });

  it('should handle multiple selected commands with same properties', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1, 2], // Both text commands
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    expect(screen.getByText('Text (2個選択中)')).toBeInTheDocument();
    
    // Common properties should be shown - use getByRole to find inputs
    expect(screen.getByRole('textbox', { name: /character/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /body/i })).toBeInTheDocument();
  });

  it('should handle multiple selected commands with mixed values', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1, 2], // Different values for properties
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    // Mixed values should show placeholder
    const characterInput = screen.getByRole('textbox', { name: /character/i }) as HTMLInputElement;
    expect(characterInput.placeholder).toBe('-');
    
    // Changing a mixed value should update all selected
    fireEvent.change(characterInput, { target: { value: 'Everyone' } });
    
    expect(mockUpdateCommand).toHaveBeenCalledWith(1, { character: 'Everyone' });
    expect(mockUpdateCommand).toHaveBeenCalledWith(2, { character: 'Everyone' });
  });

  it('should handle multiple selected commands with different types', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1, 3], // text and choice commands
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    expect(screen.getByText('Text, Choice (2個選択中)')).toBeInTheDocument();
    
    // Only common properties (none in this case) should be shown
    // Background color should still be shown as it's always available
    expect(screen.getByText('背景色')).toBeInTheDocument();
  });

  it('should handle commands without definitions gracefully', () => {
    const commandWithPartialDef = {
      ...mockSkit,
      commands: [
        { id: 1, type: 'text' },
        { id: 2, type: 'undefined_type' }
      ]
    };

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': commandWithPartialDef },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1, 2],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    // Should still render the first command's type
    expect(screen.getByText(/Text/)).toBeInTheDocument();
  });

  it('should show required field indicator', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    // Required fields should have an asterisk
    const characterLabel = screen.getByText('character');
    expect(characterLabel.parentElement?.textContent).toContain('*');
  });

  it('should handle empty property values', async () => {
    const skitWithEmptyValues = {
      ...mockSkit,
      commands: [
        {
          id: 1,
          type: 'text',
          character: '',
          body: ''
        }
      ]
    };

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': skitWithEmptyValues },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.some(input => (input as HTMLInputElement).value === '')).toBe(true);
  });

  it('should use default values for number properties', () => {
    const skitWithoutDelay = {
      ...mockSkit,
      commands: [
        {
          id: 1,
          type: 'text',
          character: 'Alice',
          body: 'Hello'
          // delay is missing, should use default
        }
      ]
    };

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': skitWithoutDelay },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const delayInput = screen.getByLabelText('delay') as HTMLInputElement;
    expect(delayInput.value).toBe('0'); // default value
  });

  it('should respect number constraints', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const delayInput = screen.getByLabelText('delay') as HTMLInputElement;
    expect(delayInput.min).toBe('0');
    expect(delayInput.max).toBe('5000');
  });

  it('should handle vector2Int properties', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [4],
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const vectorInputs = screen.getAllByTestId('vector-input');
    const gridPositionInput = vectorInputs.find(el => el.getAttribute('data-dimension') === '2' && el.getAttribute('data-integer') === 'true');
    
    expect(gridPositionInput).toBeInTheDocument();
  });

  it('should handle default background color from command definition', () => {
    const commandDefsWithDefaultColor = mockCommandDefinitions.map(def => ({
      ...def,
      defaultBackgroundColor: def.id === 'text' ? '#ffff00' : undefined
    }));

    const skitWithoutBgColor = {
      ...mockSkit,
      commands: [
        {
          id: 1,
          type: 'text',
          character: 'Alice',
          body: 'Hello'
          // no backgroundColor
        }
      ]
    };

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': skitWithoutBgColor },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: commandDefsWithDefaultColor,
      commandsMap: new Map(commandDefsWithDefaultColor.map(def => [def.id, def]))
    } as any);

    render(<CommandEditor />);
    
    const colorPicker = screen.getByTestId('color-picker') as HTMLInputElement;
    expect(colorPicker.value).toBe('#ffff00');
  });

  it('should show mixed background colors correctly', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1, 2], // Different background colors
      updateCommand: mockUpdateCommand,
      commandDefinitions: mockCommandDefinitions,
      commandsMap
    } as any);

    render(<CommandEditor />);
    
    const colorPicker = screen.getByTestId('color-picker');
    expect(colorPicker.getAttribute('data-mixed')).toBe('true');
  });

  it('should handle command property with filtering', () => {
    const commandsWithTypes = mockCommandDefinitions.map(def => ({
      ...def,
      properties: {
        ...def.properties,
        target: {
          type: 'command' as const,
          required: true,
          commandTypes: ['text'] // Only show text commands
        }
      }
    }));

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': mockSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [6],
      updateCommand: mockUpdateCommand,
      commandDefinitions: commandsWithTypes,
      commandsMap: new Map(commandsWithTypes.map(def => [def.id, def]))
    } as any);

    render(<CommandEditor />);
    
    const selectTrigger = screen.getByRole('combobox');
    fireEvent.click(selectTrigger);
    
    // Should only show text commands - check the dropdown options
    const allOptions = screen.getAllByRole('option');
    const optionTexts = allOptions.map(el => el.textContent);
    expect(optionTexts).toContain('1: TEXT: Alice, Hello');
    expect(optionTexts).toContain('2: TEXT: Bob, Hi');
    expect(optionTexts.some(text => text?.includes('CHOICE'))).toBe(false);
  });

  it('should render enum property with masterKey correctly', () => {
    const commandsWithMasterKey: CommandDefinition[] = [
      {
        id: 'character_action',
        label: 'Character Action',
        description: 'Character performs action',
        commandListLabelFormat: 'ACTION: {character} {action}',
        properties: {
          character: {
            type: 'enum',
            required: true,
            options: ['alice', 'bob', 'charlie'],
            masterKey: 'characters'
          }
        }
      }
    ];

    const testCommand: SkitCommand = {
      id: 1,
      type: 'character_action',
      character: 'alice'
    };

    const testSkit: Skit = {
      meta: {
        title: 'Test Skit',
        version: 1,
        created: '2024-01-01',
        modified: '2024-01-01'
      },
      commands: [testCommand]
    };

    vi.mocked(useSkitStore).mockReturnValue({
      skits: { 'test-skit': testSkit },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      updateCommand: mockUpdateCommand,
      commandDefinitions: commandsWithMasterKey,
      commandsMap: new Map(commandsWithMasterKey.map(def => [def.id, def]))
    } as any);

    render(<CommandEditor />);

    // Check that enum select renders properly
    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeInTheDocument();
    
    // The component should render with the property that has masterKey
    fireEvent.click(selectTrigger);
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('alice');
    expect(options[1]).toHaveTextContent('bob');
    expect(options[2]).toHaveTextContent('charlie');
  });
});