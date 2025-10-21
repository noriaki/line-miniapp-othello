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
 * Board encoding: 64 bytes (8x8 grid in row-major order)
 * Cell values: 0 = empty, 1 = black, 2 = white
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

  // Allocate WASM memory (64 bytes)
  const boardPtr = module._malloc(64);

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

  // Encode board to WASM memory
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      const index = row * 8 + col;

      let value: number;
      if (cell === null) {
        value = 0; // Empty
      } else if (cell === 'black') {
        value = 1; // Black
      } else if (cell === 'white') {
        value = 2; // White
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

      module.HEAPU8[boardPtr + index] = value;
    }
  }

  return {
    success: true,
    value: boardPtr,
  };
}

/**
 * Decode WASM response to Position
 * @param encodedPosition - Encoded position (0-63)
 * @returns Result with Position or error
 *
 * Position decoding:
 * - row = Math.floor(encodedPosition / 8)
 * - col = encodedPosition % 8
 */
export function decodeResponse(
  encodedPosition: number
): Result<Position, DecodeError> {
  // Validate range
  if (encodedPosition < 0 || encodedPosition >= 64) {
    return {
      success: false,
      error: {
        type: 'decode_error',
        reason: 'invalid_response',
        message: `Invalid position: ${encodedPosition} (must be 0-63)`,
      },
    };
  }

  const row = Math.floor(encodedPosition / 8);
  const col = encodedPosition % 8;

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
 * Call WASM AI function
 * @param module - WASM module instance
 * @param boardPointer - Pointer to board data in WASM memory
 * @returns Result with encoded position or error
 */
export function callAIFunction(
  module: EgaroucidWASMModule,
  boardPointer: WASMPointer
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
    // Call WASM function
    // Note: Actual signature is _calc_value(a0, a1?, a2?, a3?)
    // For now, we only pass the board pointer
    // Additional parameters can be added when their purpose is determined
    const encodedPosition = module._calc_value(boardPointer);

    return {
      success: true,
      value: encodedPosition,
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
