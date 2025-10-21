/**
 * AI Worker
 * Executes WASM AI calculations in a Web Worker thread to prevent UI blocking
 */

import { loadWASM } from '../lib/ai/wasm-loader';
import {
  encodeBoard,
  decodeResponse,
  callAIFunction,
  freeMemory,
} from '../lib/ai/wasm-bridge';
import type {
  EgaroucidWASMModule,
  AIWorkerRequest,
  AIWorkerResponse,
} from '../lib/ai/types';

let wasmModule: EgaroucidWASMModule | null = null;

/**
 * Initialize WASM module (one-time operation)
 */
async function initializeWASM(): Promise<void> {
  if (wasmModule) {
    return; // Already initialized
  }

  const result = await loadWASM('/ai.wasm');

  if (!result.success) {
    throw new Error(`WASM load failed: ${result.error.message}`);
  }

  wasmModule = result.value;
}

/**
 * Calculate AI move
 */
async function calculateMove(
  request: AIWorkerRequest
): Promise<AIWorkerResponse> {
  const startTime = performance.now();

  try {
    // Initialize WASM if needed
    if (!wasmModule) {
      await initializeWASM();
    }

    if (!wasmModule) {
      throw new Error('WASM module not initialized');
    }

    // Encode board to WASM memory
    const encodeBoardResult = encodeBoard(
      wasmModule,
      request.payload.board,
      request.payload.currentPlayer
    );

    if (!encodeBoardResult.success) {
      throw new Error(`Board encoding failed: ${encodeBoardResult.error.message}`);
    }

    const boardPtr = encodeBoardResult.value;

    try {
      // Call WASM function (synchronous, but in worker thread)
      const callResult = callAIFunction(wasmModule, boardPtr, {
        timeout: request.payload.timeoutMs,
      });

      if (!callResult.success) {
        throw new Error(`WASM call failed: ${callResult.error.message}`);
      }

      const encodedPosition = callResult.value;

      // Decode response
      const decodeResult = decodeResponse(encodedPosition);

      if (!decodeResult.success) {
        throw new Error(`Response decode failed: ${decodeResult.error.message}`);
      }

      const move = decodeResult.value;
      const calculationTimeMs = performance.now() - startTime;

      return {
        type: 'success',
        payload: {
          move,
          calculationTimeMs,
        },
      };
    } finally {
      // Always free memory
      freeMemory(wasmModule, boardPtr);
    }
  } catch (error) {
    return {
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Message handler
 */
self.onmessage = async (event: MessageEvent<AIWorkerRequest>) => {
  const { type, payload } = event.data;

  if (type === 'calculate') {
    const response = await calculateMove(event.data);
    self.postMessage(response);
  }
};
