/**
 * Unit tests for WASM Loader
 * Tests WASM module loading and initialization
 */

import { loadWASM, isModuleReady } from '../wasm-loader';
import type { EgaroucidWASMModule } from '../types';

// Mock WebAssembly API
const mockWASMModule = {
  _init_ai: jest.fn(),
  _malloc: jest.fn(),
  _free: jest.fn(),
  _calc_value: jest.fn(),
  _resume: jest.fn(),
  _stop: jest.fn(),
  memory: {} as WebAssembly.Memory,
  HEAP8: new Int8Array(64),
  HEAPU8: new Uint8Array(64),
};

describe('loadWASM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully load WASM module from valid path', async () => {
    // Mock fetch and WebAssembly.instantiate
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });

    global.WebAssembly.instantiate = jest.fn().mockResolvedValue({
      instance: {
        exports: mockWASMModule,
      },
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBeDefined();
      expect(result.value._init_ai).toBeDefined();
      expect(result.value._malloc).toBeDefined();
      expect(result.value._calc_value).toBeDefined();
    }
  });

  it('should return error when fetch fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    const result = await loadWASM('/nonexistent.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
      expect(result.error.message).toContain('404');
    }
  });

  it('should return error when WebAssembly.instantiate fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });

    global.WebAssembly.instantiate = jest
      .fn()
      .mockRejectedValue(new Error('Invalid WASM binary'));

    const result = await loadWASM('/invalid.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toContain('Invalid WASM binary');
    }
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
    }
  });

  it('should call _init_ai after successful load', async () => {
    const initAiMock = jest.fn();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
    });

    global.WebAssembly.instantiate = jest.fn().mockResolvedValue({
      instance: {
        exports: {
          ...mockWASMModule,
          _init_ai: initAiMock,
        },
      },
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(true);
    expect(initAiMock).toHaveBeenCalledTimes(1);
  });
});

describe('isModuleReady', () => {
  it('should return true for valid module', () => {
    expect(isModuleReady(mockWASMModule)).toBe(true);
  });

  it('should return false for null module', () => {
    expect(isModuleReady(null)).toBe(false);
  });

  it('should return false for undefined module', () => {
    expect(isModuleReady(undefined)).toBe(false);
  });

  it('should return false for module missing required functions', () => {
    const incompleteModule: Partial<EgaroucidWASMModule> = {
      _malloc: jest.fn(),
      // Missing _calc_value and other required functions
    };

    expect(isModuleReady(incompleteModule as EgaroucidWASMModule)).toBe(false);
  });
});
