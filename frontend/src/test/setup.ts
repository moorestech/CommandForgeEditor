import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('@tauri-apps/api/fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  createDir: vi.fn(),
  readDir: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  join: vi.fn(),
  resolveResource: vi.fn(),
}));
