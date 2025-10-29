/**
 * WASM Bridge
 * Handles data conversion between JavaScript and WebAssembly
 */

import type { Board, Position } from '../game/types';
import type {
  EgaroucidWASMModule,
  WASMPointer,
  EncodeError,
  DecodeError,
  WASMCallError,
  Result,
} from './types';

/**
 * Encode board state to WASM memory
 * @param module - WASM module instance
 * @param board - 8x8 board state
 * @returns Result with memory pointer or error
 *
 * Board encoding: 256 bytes (8x8 grid in row-major order, Int32Array)
 * Cell values: -1 = empty, 0 = black, 1 = white
 */
export function encodeBoard(
  module: EgaroucidWASMModule,
  board: Board
): Result<WASMPointer, EncodeError> {
  // Validate board dimensions
  if (!board || board.length !== 8) {
    return {
      success: false,
      error: {
        type: 'encode_error',
        reason: 'invalid_board',
        message: 'Board must be 8x8',
      },
    };
  }

  for (const row of board) {
    if (!row || row.length !== 8) {
      return {
        success: false,
        error: {
          type: 'encode_error',
          reason: 'invalid_board',
          message: 'Board must be 8x8',
        },
      };
    }
  }

  // Allocate WASM memory (256 bytes = 64 Int32 elements)
  const boardPtr = module._malloc(256);

  if (boardPtr === 0) {
    return {
      success: false,
      error: {
        type: 'encode_error',
        reason: 'memory_allocation_failed',
        message: 'Failed to allocate WASM memory',
      },
    };
  }

  // Access memory as Int32Array
  // Try multiple sources for buffer in Web Worker context
  const buffer =
    module.memory?.buffer ||
    module.HEAP32?.buffer ||
    module.HEAPU8?.buffer ||
    module.HEAP8?.buffer;

  if (!buffer) {
    module._free(boardPtr);
    return {
      success: false,
      error: {
        type: 'encode_error',
        reason: 'memory_allocation_failed',
        message: 'WASM memory buffer not accessible',
      },
    };
  }

  const heap = new Int32Array(buffer, boardPtr, 64);

  // Encode board to WASM memory
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      const index = row * 8 + col;

      let value: number;
      if (cell === null) {
        value = -1; // Empty
      } else if (cell === 'black') {
        value = 0; // Black
      } else if (cell === 'white') {
        value = 1; // White
      } else {
        // Invalid cell value
        module._free(boardPtr);
        return {
          success: false,
          error: {
            type: 'encode_error',
            reason: 'invalid_board',
            message: `Invalid cell value at [${row}, ${col}]`,
          },
        };
      }

      heap[index] = value;
    }
  }

  return {
    success: true,
    value: boardPtr,
  };
}

/**
 * Decode WASM _ai_js response to Position
 * @param encodedResult - Encoded result from _ai_js (format: 1000*(63-policy)+100+value)
 * @returns Result with Position or error
 *
 * Response format: 1000*(63-policy)+100+value
 * - policy: bit position (0-63)
 * - value: evaluation score
 *
 * Decoding steps:
 * 1. policy = 63 - Math.floor(result / 1000)
 * 2. value = (result % 1000) - 100
 * 3. index = 63 - policy
 * 4. row = Math.floor(index / 8), col = index % 8
 */
export function decodeResponse(
  encodedResult: number
): Result<Position, DecodeError> {
  // Minimum valid response is 100 (policy=63, value=0)
  if (encodedResult < 100) {
    return {
      success: false,
      error: {
        type: 'decode_error',
        reason: 'invalid_response',
        message: `Invalid response: ${encodedResult} (minimum is 100)`,
      },
    };
  }

  // Decode: policy = 63 - Math.floor(result / 1000)
  // IMPORTANT: Do NOT subtract 100 before dividing! The value is encoded in the last 3 digits.
  const policy = 63 - Math.floor(encodedResult / 1000);

  // Validate policy range
  if (policy < 0 || policy > 63) {
    return {
      success: false,
      error: {
        type: 'decode_error',
        reason: 'invalid_response',
        message: `Invalid policy: ${policy} (must be 0-63)`,
      },
    };
  }

  // Convert policy (bit position) to array index
  const index = 63 - policy;
  const row = Math.floor(index / 8);
  const col = index % 8;

  return {
    success: true,
    value: { row, col },
  };
}

/**
 * Free WASM memory
 * @param module - WASM module instance
 * @param pointer - Memory pointer to free
 */
export function freeMemory(
  module: EgaroucidWASMModule,
  pointer: WASMPointer
): void {
  if (pointer !== 0) {
    module._free(pointer);
  }
}

/**
 * Call WASM AI function (_ai_js)
 * @param module - WASM module instance
 * @param boardPointer - Pointer to board data in WASM memory
 * @param level - AI difficulty level (0-60)
 * @param ai_player - AI player (0=black, 1=white)
 * @returns Result with encoded result or error
 *
 * WASM function signature: _ai_js(boardPtr: number, level: number, ai_player: number): number
 * Returns: 1000*(63-policy)+100+value
 */
export function callAIFunction(
  module: EgaroucidWASMModule,
  boardPointer: WASMPointer,
  level: number,
  ai_player: number
): Result<number, WASMCallError> {
  if (boardPointer === 0) {
    return {
      success: false,
      error: {
        type: 'wasm_call_error',
        reason: 'null_pointer',
        message: 'Board pointer is null',
      },
    };
  }

  try {
    // Call _ai_js WASM function
    const encodedResult = module._ai_js!(boardPointer, level, ai_player);

    return {
      success: true,
      value: encodedResult,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        type: 'wasm_call_error',
        reason: 'execution_failed',
        message:
          error instanceof Error ? error.message : 'WASM execution failed',
      },
    };
  }
}
