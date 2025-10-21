/**
 * WASM Loader
 * Handles loading and initialization of the Egaroucid WebAssembly module
 */

import type {
  EgaroucidWASMModule,
  WASMLoadError,
  Result,
} from './types';

/**
 * Load WASM module from the specified path
 * @param wasmPath - Path to the WASM file (e.g., '/ai.wasm')
 * @returns Result with loaded WASM module or error
 */
export async function loadWASM(
  wasmPath: string
): Promise<Result<EgaroucidWASMModule, WASMLoadError>> {
  try {
    // Fetch WASM binary
    let response: Response;
    let wasmBuffer: ArrayBuffer;

    try {
      response = await fetch(wasmPath);
    } catch (fetchError) {
      // Network or fetch-related errors
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: fetchError instanceof Error ? fetchError.message : 'Network error',
        },
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: `Failed to fetch WASM file: HTTP ${response.status}`,
        },
      };
    }

    try {
      wasmBuffer = await response.arrayBuffer();
    } catch (bufferError) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'fetch_failed',
          message: bufferError instanceof Error ? bufferError.message : 'Failed to read response',
        },
      };
    }

    // Instantiate WASM module
    let wasmModule: WebAssembly.WebAssemblyInstantiatedSource;
    try {
      wasmModule = await WebAssembly.instantiate(wasmBuffer, {});
    } catch (instantiateError) {
      return {
        success: false,
        error: {
          type: 'wasm_load_error',
          reason: 'instantiation_failed',
          message: instantiateError instanceof Error ? instantiateError.message : 'Instantiation failed',
        },
      };
    }

    // Extract exports
    const exports = wasmModule.instance.exports as unknown as EgaroucidWASMModule;

    // Initialize AI
    if (typeof exports._init_ai === 'function') {
      exports._init_ai();
    }

    return {
      success: true,
      value: exports,
    };
  } catch (error) {
    // Catch-all for unexpected errors
    return {
      success: false,
      error: {
        type: 'wasm_load_error',
        reason: 'instantiation_failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Check if WASM module is ready to use
 * @param module - WASM module to check
 * @returns True if module has all required functions
 */
export function isModuleReady(
  module: EgaroucidWASMModule | null | undefined
): module is EgaroucidWASMModule {
  if (!module) {
    return false;
  }

  // Check for required functions
  return (
    typeof module._calc_value === 'function' &&
    typeof module._malloc === 'function' &&
    typeof module._free === 'function' &&
    typeof module._init_ai === 'function'
  );
}
