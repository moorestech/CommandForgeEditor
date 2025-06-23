// AI Generated Test Code
import { describe, it, expect } from 'vitest';
import { reservedCommands } from './reservedCommands';

describe('reservedCommands', () => {
  it('should export an array of reserved commands', () => {
    expect(Array.isArray(reservedCommands)).toBe(true);
    expect(reservedCommands.length).toBeGreaterThan(0);
  });

  it('should contain group_start command', () => {
    const groupStart = reservedCommands.find(cmd => cmd.id === 'group_start');
    
    expect(groupStart).toBeDefined();
    expect(groupStart?.label).toBe('グループ開始');
    expect(groupStart?.description).toBe('グループの開始位置');
    expect(groupStart?.commandListLabelFormat).toBe('{groupName}');
    expect(groupStart?.defaultBackgroundColor).toBe('#b9b9b9');
  });

  it('should have correct properties for group_start', () => {
    const groupStart = reservedCommands.find(cmd => cmd.id === 'group_start');
    
    expect(groupStart?.properties).toBeDefined();
    expect(groupStart?.properties.groupName).toEqual({
      type: 'string',
      default: '新しいグループ',
      required: true
    });
    expect(groupStart?.properties.isCollapsed).toEqual({
      type: 'boolean',
      default: false
    });
  });

  it('should contain group_end command', () => {
    const groupEnd = reservedCommands.find(cmd => cmd.id === 'group_end');
    
    expect(groupEnd).toBeDefined();
    expect(groupEnd?.label).toBe('グループ終了');
    expect(groupEnd?.description).toBe('グループの終了位置');
    expect(groupEnd?.commandListLabelFormat).toBe('グループ終了');
    expect(groupEnd?.defaultBackgroundColor).toBe('#b9b9b9');
  });

  it('should have empty properties for group_end', () => {
    const groupEnd = reservedCommands.find(cmd => cmd.id === 'group_end');
    
    expect(groupEnd?.properties).toBeDefined();
    expect(Object.keys(groupEnd?.properties || {})).toHaveLength(0);
  });

  it('should have exactly 2 reserved commands', () => {
    expect(reservedCommands).toHaveLength(2);
  });

  it('should have unique command ids', () => {
    const ids = reservedCommands.map(cmd => cmd.id);
    const uniqueIds = [...new Set(ids)];
    
    expect(uniqueIds).toHaveLength(ids.length);
  });

  it('should have all required fields for CommandDefinition', () => {
    reservedCommands.forEach(cmd => {
      expect(cmd.id).toBeDefined();
      expect(typeof cmd.id).toBe('string');
      
      expect(cmd.label).toBeDefined();
      expect(typeof cmd.label).toBe('string');
      
      expect(cmd.description).toBeDefined();
      expect(typeof cmd.description).toBe('string');
      
      expect(cmd.commandListLabelFormat).toBeDefined();
      expect(typeof cmd.commandListLabelFormat).toBe('string');
      
      expect(cmd.properties).toBeDefined();
      expect(typeof cmd.properties).toBe('object');
    });
  });

  it('should have consistent background colors for group commands', () => {
    const groupCommands = reservedCommands.filter(cmd => 
      cmd.id === 'group_start' || cmd.id === 'group_end'
    );
    
    const backgroundColors = groupCommands.map(cmd => cmd.defaultBackgroundColor);
    expect(backgroundColors.every(color => color === '#b9b9b9')).toBe(true);
  });
});