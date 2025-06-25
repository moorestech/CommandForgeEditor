// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSampleCommandsYaml, loadSampleSkit } from './devFileSystem';

// Mock fetch globally
global.fetch = vi.fn();

describe('devFileSystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('loadSampleCommandsYaml', () => {
    it('should load commands.yaml successfully', async () => {
      const mockYamlContent = `version: 1
commands:
  - id: text
    label: Text
    description: Display text
    properties: {}`;

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => mockYamlContent
      } as Response);

      const result = await loadSampleCommandsYaml();
      
      expect(result).toBe(mockYamlContent);
      expect(global.fetch).toHaveBeenCalledWith('/src/sample/commands.yaml');
      expect(console.log).toHaveBeenCalledWith('Loading commands.yaml for web environment');
      expect(console.log).toHaveBeenCalledWith('Successfully loaded commands.yaml');
    });

    it('should throw error when fetch fails with non-ok status', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found'
      } as Response);

      await expect(loadSampleCommandsYaml()).rejects.toThrow('Failed to fetch commands.yaml: 404');
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error when fetch rejects', async () => {
      const fetchError = new Error('Network error');
      vi.mocked(global.fetch).mockRejectedValueOnce(fetchError);

      await expect(loadSampleCommandsYaml()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Failed to load commands.yaml:', fetchError);
    });

    it('should handle 500 server error', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error'
      } as Response);

      await expect(loadSampleCommandsYaml()).rejects.toThrow('Failed to fetch commands.yaml: 500');
    });
  });

  describe('loadSampleSkit', () => {
    it('should load sample skit successfully', async () => {
      const mockSkitContent = {
        meta: {
          title: 'Sample Skit',
          version: 1,
          created: '2023-01-01T00:00:00Z',
          modified: '2023-01-01T00:00:00Z'
        },
        commands: [
          { id: 1, type: 'text', body: 'Hello' }
        ]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockSkitContent)
      } as Response);

      const result = await loadSampleSkit();
      
      expect(result).toEqual({ sample: mockSkitContent });
      expect(global.fetch).toHaveBeenCalledWith('/src/sample/skits/sample_skit.json');
      expect(console.log).toHaveBeenCalledWith('Loading sample-skit.json for web environment');
      expect(console.log).toHaveBeenCalledWith('Successfully loaded sample-skit.json');
    });

    it('should throw error when fetch fails with non-ok status', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found'
      } as Response);

      await expect(loadSampleSkit()).rejects.toThrow('Failed to fetch sample-skit.json: 404');
      expect(console.error).toHaveBeenCalled();
    });

    it('should throw error when fetch rejects', async () => {
      const fetchError = new Error('Network error');
      vi.mocked(global.fetch).mockRejectedValueOnce(fetchError);

      await expect(loadSampleSkit()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Failed to load sample-skit.json:', fetchError);
    });

    it('should throw error when JSON parsing fails', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => 'invalid json'
      } as Response);

      await expect(loadSampleSkit()).rejects.toThrow();
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '{}'
      } as Response);

      const result = await loadSampleSkit();
      
      expect(result).toEqual({ sample: {} });
    });

    it('should handle complex skit structure', async () => {
      const complexSkit = {
        meta: {
          title: 'Complex Skit',
          version: 2,
          created: '2023-01-01T00:00:00Z',
          modified: '2023-01-02T00:00:00Z'
        },
        commands: [
          { id: 1, type: 'text', character: 'Alice', body: 'Hello' },
          { id: 2, type: 'choice', options: ['Yes', 'No'] },
          { id: 3, type: 'jump', target: 1 }
        ]
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(complexSkit)
      } as Response);

      const result = await loadSampleSkit();
      
      expect(result).toEqual({ sample: complexSkit });
    });
  });
});