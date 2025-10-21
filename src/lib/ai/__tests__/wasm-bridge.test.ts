/**
 * Unit tests for WASM Bridge
 * Tests board encoding, decoding, and WASM function calls
 */

import {
  encodeBoard,
  decodeResponse,
  freeMemory,
  callAIFunction,
} from '../wasm-bridge';
import type { Board } from '../../game/types';
import type { EgaroucidWASMModule } from '../types';

// Mock WASM module
const createMockModule = (): EgaroucidWASMModule => {
  const memory = new Uint8Array(256); // 256 bytes of mock memory
  let nextPointer = 64; // Start at 64 to avoid null pointer (0)

  return {
    _init_ai: jest.fn(),
    _calc_value: jest.fn(),
    _resume: jest.fn(),
    _stop: jest.fn(),
    _malloc: jest.fn((size: number) => {
      const pointer = nextPointer;
      nextPointer += size;
      return pointer;
    }),
    _free: jest.fn(),
    memory: {} as WebAssembly.Memory,
    HEAP8: new Int8Array(memory.buffer),
    HEAPU8: memory,
  };
};

describe('encodeBoard', () => {
  it('should encode empty board correctly', () => {
    const wasmModule = createMockModule();
    const board: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(true);
    if (result.success) {
      const pointer = result.value;
      expect(pointer).toBeGreaterThanOrEqual(0);
      expect(wasmModule._malloc).toHaveBeenCalledWith(64);

      // Check that all cells are encoded as 0 (empty)
      for (let i = 0; i < 64; i++) {
        expect(wasmModule.HEAPU8[pointer + i]).toBe(0);
      }
    }
  });

  it('should encode initial board state correctly', () => {
    const wasmModule = createMockModule();
    // Create initial board with center 4 stones
    const board: Board = Array(8)
      .fill(null)
      .map((_, row) =>
        Array(8)
          .fill(null)
          .map((_, col) => {
            if (row === 3 && col === 3) return 'white';
            if (row === 3 && col === 4) return 'black';
            if (row === 4 && col === 3) return 'black';
            if (row === 4 && col === 4) return 'white';
            return null;
          })
      );

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(true);
    if (result.success) {
      const pointer = result.value;

      // Check center stones are encoded correctly
      // Row 3, Col 3 (index 3*8+3=27): white (2)
      expect(wasmModule.HEAPU8[pointer + 27]).toBe(2);
      // Row 3, Col 4 (index 3*8+4=28): black (1)
      expect(wasmModule.HEAPU8[pointer + 28]).toBe(1);
      // Row 4, Col 3 (index 4*8+3=35): black (1)
      expect(wasmModule.HEAPU8[pointer + 35]).toBe(1);
      // Row 4, Col 4 (index 4*8+4=36): white (2)
      expect(wasmModule.HEAPU8[pointer + 36]).toBe(2);

      // Check other cells are empty (0)
      expect(wasmModule.HEAPU8[pointer + 0]).toBe(0);
      expect(wasmModule.HEAPU8[pointer + 63]).toBe(0);
    }
  });

  it('should return error for invalid board size', () => {
    const wasmModule = createMockModule();
    const invalidBoard: Board = Array(7)
      .fill(null)
      .map(() => Array(7).fill(null));

    const result = encodeBoard(wasmModule, invalidBoard);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('invalid_board');
    }
  });

  it('should return error for invalid row size', () => {
    const wasmModule = createMockModule();
    // Create board with one row having wrong size
    const invalidBoard: Board = [
      Array(8).fill(null),
      Array(8).fill(null),
      Array(7).fill(null), // Invalid row size
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
    ];

    const result = encodeBoard(wasmModule, invalidBoard);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('invalid_board');
      expect(result.error.message).toContain('8x8');
    }
  });

  it('should return error and free memory for invalid cell value', () => {
    const wasmModule = createMockModule();
    // Create board with invalid cell value
    const invalidBoard = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Set invalid value (using type assertion to bypass TypeScript check)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (invalidBoard as any)[2][3] = 'invalid';

    const result = encodeBoard(wasmModule, invalidBoard);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('invalid_board');
      expect(result.error.message).toContain('[2, 3]');
    }

    // Verify that memory was freed
    expect(wasmModule._free).toHaveBeenCalled();
  });

  it('should return error when malloc fails', () => {
    const wasmModule = createMockModule();
    wasmModule._malloc = jest.fn().mockReturnValue(0); // Simulate malloc failure

    const board: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('encode_error');
      expect(result.error.reason).toBe('memory_allocation_failed');
    }
  });

  it('should handle complex board state with multiple stones', () => {
    const wasmModule = createMockModule();
    const board: Board = [
      ['black', 'white', null, null, null, null, null, null],
      [null, 'black', 'white', null, null, null, null, null],
      [null, null, 'black', 'white', null, null, null, null],
      [null, null, null, 'white', 'black', null, null, null],
      [null, null, null, 'black', 'white', null, null, null],
      [null, null, 'white', null, null, 'black', null, null],
      [null, 'white', null, null, null, null, 'black', null],
      ['white', null, null, null, null, null, null, 'black'],
    ];

    const result = encodeBoard(wasmModule, board);

    expect(result.success).toBe(true);
    if (result.success) {
      const pointer = result.value;

      // Spot check a few positions
      expect(wasmModule.HEAPU8[pointer + 0]).toBe(1); // Row 0, Col 0: black
      expect(wasmModule.HEAPU8[pointer + 1]).toBe(2); // Row 0, Col 1: white
      expect(wasmModule.HEAPU8[pointer + 2]).toBe(0); // Row 0, Col 2: null
      expect(wasmModule.HEAPU8[pointer + 63]).toBe(1); // Row 7, Col 7: black
    }
  });
});

describe('decodeResponse', () => {
  it('should decode valid position (top-left corner)', () => {
    const result = decodeResponse(0);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(0);
      expect(result.value.col).toBe(0);
    }
  });

  it('should decode valid position (bottom-right corner)', () => {
    const result = decodeResponse(63);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(7);
      expect(result.value.col).toBe(7);
    }
  });

  it('should decode valid position (center)', () => {
    const result = decodeResponse(27); // Row 3, Col 3

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.row).toBe(3);
      expect(result.value.col).toBe(3);
    }
  });

  it('should return error for negative position', () => {
    const result = decodeResponse(-1);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('decode_error');
      expect(result.error.reason).toBe('invalid_response');
    }
  });

  it('should return error for out-of-range position (>63)', () => {
    const result = decodeResponse(64);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('decode_error');
      expect(result.error.reason).toBe('invalid_response');
    }
  });

  it('should decode all valid positions correctly', () => {
    for (let encoded = 0; encoded < 64; encoded++) {
      const result = decodeResponse(encoded);
      expect(result.success).toBe(true);

      if (result.success) {
        const { row, col } = result.value;
        const reEncoded = row * 8 + col;
        expect(reEncoded).toBe(encoded);
      }
    }
  });
});

describe('freeMemory', () => {
  it('should call _free with correct pointer', () => {
    const wasmModule = createMockModule();
    const pointer = 64;

    freeMemory(wasmModule, pointer);

    expect(wasmModule._free).toHaveBeenCalledWith(pointer);
    expect(wasmModule._free).toHaveBeenCalledTimes(1);
  });

  it('should handle zero pointer gracefully', () => {
    const wasmModule = createMockModule();

    // Should not throw
    expect(() => freeMemory(wasmModule, 0)).not.toThrow();
  });
});

describe('callAIFunction', () => {
  it('should successfully call WASM function', () => {
    const wasmModule = createMockModule();
    wasmModule._calc_value = jest.fn().mockReturnValue(27); // Return position (3,3)

    const boardPointer = 64;
    const result = callAIFunction(wasmModule, boardPointer);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(27);
      expect(wasmModule._calc_value).toHaveBeenCalledWith(boardPointer);
    }
  });

  it('should return error for null pointer', () => {
    const wasmModule = createMockModule();

    const result = callAIFunction(wasmModule, 0);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_call_error');
      expect(result.error.reason).toBe('null_pointer');
    }
  });

  it('should handle WASM execution errors', () => {
    const wasmModule = createMockModule();
    wasmModule._calc_value = jest.fn().mockImplementation(() => {
      throw new Error('WASM execution failed');
    });

    const boardPointer = 64;
    const result = callAIFunction(wasmModule, boardPointer);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.type).toBe('wasm_call_error');
      expect(result.error.reason).toBe('execution_failed');
      expect(result.error.message).toContain('WASM execution failed');
    }
  });

  it('should call WASM function with board pointer', () => {
    const wasmModule = createMockModule();
    wasmModule._calc_value = jest.fn().mockReturnValue(15);

    const boardPointer = 64;
    const result = callAIFunction(wasmModule, boardPointer);

    expect(result.success).toBe(true);
    expect(wasmModule._calc_value).toHaveBeenCalledWith(boardPointer);
  });
});
