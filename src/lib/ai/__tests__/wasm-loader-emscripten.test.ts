/**
 * Unit tests for WASM Loader - Emscripten Integration
 * Tests Emscripten Module loading approach
 */

import { loadWASM } from '../wasm-loader';

// Web Worker global function declaration for tests
declare function importScripts(...urls: string[]): void;

// Mock Emscripten Module
const mockEmscriptenModule = {
  _init_ai: jest.fn(),
  _malloc: jest.fn(),
  _free: jest.fn(),
  _calc_value: jest.fn(),
  _ai_js: jest.fn(),
  _resume: jest.fn(),
  _stop: jest.fn(),
  memory: {} as WebAssembly.Memory,
  HEAP8: new Int8Array(64),
  HEAPU8: new Uint8Array(64),
  HEAP32: new Int32Array(64),
  onRuntimeInitialized: undefined as (() => void) | undefined,
};

describe('loadWASM - Emscripten Integration', () => {
  let originalImportScripts: typeof importScripts | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    // Save original importScripts if it exists
    originalImportScripts =
      typeof importScripts !== 'undefined' ? importScripts : undefined;
  });

  afterEach(() => {
    // Restore importScripts
    if (originalImportScripts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).importScripts = originalImportScripts;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (global as any).importScripts;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).Module;
  });

  it('should load WASM via Emscripten Module in Web Worker context', async () => {
    // Mock Web Worker environment
    const mockImportScripts = jest.fn().mockImplementation(() => {
      // Simulate Emscripten ai.js loading Module into global scope
      const emscriptenModule = { ...mockEmscriptenModule };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;

      // Trigger onRuntimeInitialized on next tick (before promise microtask)
      process.nextTick(() => {
        if (emscriptenModule.onRuntimeInitialized) {
          emscriptenModule.onRuntimeInitialized();
        }
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = mockImportScripts;

    const result = await loadWASM('/ai.wasm');

    // Should call importScripts with ai.js path
    expect(mockImportScripts).toHaveBeenCalledWith('/ai.js');

    // Should successfully return Module
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBeDefined();
      expect(result.value._init_ai).toBeDefined();
      expect(result.value._malloc).toBeDefined();
      expect(result.value._calc_value).toBeDefined();
    }
  });

  it('should wait for onRuntimeInitialized callback', async () => {
    let callbackWasSet = false;

    const mockImportScripts = jest.fn().mockImplementation(() => {
      // Create emscripten module without _malloc initially to simulate uninitialized state
      const uninitializedEmscriptenModule = {
        _init_ai: jest.fn(),
        _calc_value: jest.fn(),
        _resume: jest.fn(),
        _stop: jest.fn(),
        memory: {} as WebAssembly.Memory,
        HEAP8: new Int8Array(64),
        HEAPU8: new Uint8Array(64),
        HEAP32: new Int32Array(64),
        _malloc: undefined as unknown as (size: number) => number,
        _free: undefined as unknown as (ptr: number) => void,
        set onRuntimeInitialized(callback: () => void) {
          callbackWasSet = true;
          // Simulate async initialization with nextTick
          process.nextTick(() => {
            // Populate functions to simulate runtime initialization
            uninitializedEmscriptenModule._malloc = jest.fn();
            uninitializedEmscriptenModule._free = jest.fn();
            callback();
          });
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = uninitializedEmscriptenModule;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = mockImportScripts;

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(true);
    expect(callbackWasSet).toBe(true);
  });

  it('should return error when importScripts is not available (not in Worker)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).importScripts;

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
      expect(result.error.message).toContain('importScripts');
    }
  });

  it('should return error when importScripts throws', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn().mockImplementation(() => {
      throw new Error('Script load failed');
    });

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('fetch_failed');
      expect(result.error.message).toContain('Script load failed');
    }
  });

  it('should return error when Module is not available after importScripts', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn(); // No Module set

    const result = await loadWASM('/ai.wasm');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('instantiation_failed');
      expect(result.error.message).toContain('Module not found');
    }
  });

  it.skip('should timeout if onRuntimeInitialized never called', async () => {
    // Mock a short timeout for this test
    jest.useFakeTimers();

    const mockModule = {
      ...mockEmscriptenModule,
      set onRuntimeInitialized(_callback: () => void) {
        // Never call the callback (simulate hang)
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn().mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = mockModule;
    });

    const loadPromise = loadWASM('/ai.wasm');

    // Fast-forward timers to trigger timeout
    jest.advanceTimersByTime(10001);

    const result = await loadPromise;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_load_error');
      expect(result.error.reason).toBe('initialization_timeout');
    }

    jest.useRealTimers();
  });

  it('should call _init_ai after runtime initialization', async () => {
    const initAiMock = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = jest.fn().mockImplementation(() => {
      const emscriptenModule = {
        ...mockEmscriptenModule,
        _init_ai: initAiMock,
        set onRuntimeInitialized(callback: () => void) {
          process.nextTick(() => callback());
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;
    });

    await loadWASM('/ai.wasm');

    expect(initAiMock).toHaveBeenCalledTimes(1);
  });

  it('should derive ai.js path from wasm path', async () => {
    const mockImportScripts = jest.fn().mockImplementation(() => {
      const emscriptenModule = { ...mockEmscriptenModule };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).Module = emscriptenModule;
      process.nextTick(() => {
        if (emscriptenModule.onRuntimeInitialized) {
          emscriptenModule.onRuntimeInitialized();
        }
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).importScripts = mockImportScripts;

    await loadWASM('/ai.wasm');
    expect(mockImportScripts).toHaveBeenNthCalledWith(1, '/ai.js');

    await loadWASM('/path/to/ai.wasm');
    expect(mockImportScripts).toHaveBeenNthCalledWith(2, '/path/to/ai.js');

    await loadWASM('ai.wasm');
    expect(mockImportScripts).toHaveBeenNthCalledWith(3, 'ai.js');
  });
});
