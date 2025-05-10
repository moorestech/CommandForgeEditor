import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSkitStore } from './skitStore';
import { act } from '@testing-library/react';

// Mock the fileSystem module
vi.mock('../utils/fileSystem', () => ({
  saveSkit: vi.fn(),
}));

// Mock the validation module
vi.mock('../utils/validation', () => ({
  validateSkitData: vi.fn().mockReturnValue([]),
}));

describe('skitStore', () => {
  beforeEach(() => {
    // Reset the store to a clean state
    act(() => {
      useSkitStore.setState({
        skits: {},
        currentSkitId: null,
        selectedCommandId: null,
        commandsYaml: null,
        validationErrors: [],
        history: {
          past: [],
          future: [],
        },
      });
    });
  });
  
  it('should load skits', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          {
            id: 1,
            type: 'text',
            character: 'キャラA',
            body: 'こんにちは',
          },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
    });
    
    expect(useSkitStore.getState().skits).toEqual(testSkits);
  });
  
  it('should set current skit', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
    });
    
    expect(useSkitStore.getState().currentSkitId).toBe('test-skit');
  });
  
  it('should add a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().addCommand({ type: 'text', character: 'キャラA', body: 'こんにちは' });
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(1);
    expect(commands[0].type).toBe('text');
    expect(commands[0].character).toBe('キャラA');
    expect(commands[0].body).toBe('こんにちは');
  });
  
  it('should remove a command', () => {
    const testSkits = {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2025-05-10T12:00:00+09:00',
          modified: '2025-05-10T12:34:56+09:00',
        },
        commands: [
          {
            id: 1,
            type: 'text',
            character: 'キャラA',
            body: 'こんにちは',
          },
        ],
      },
    };
    
    act(() => {
      useSkitStore.getState().loadSkits(testSkits);
      useSkitStore.getState().setCurrentSkit('test-skit');
      useSkitStore.getState().removeCommand(1);
    });
    
    const commands = useSkitStore.getState().skits['test-skit'].commands;
    expect(commands.length).toBe(0);
  });
});
