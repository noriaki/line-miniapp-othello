/**
 * Type definitions for AI Engine and WASM integration
 */

import type { Board, Player, Position } from '../game/types';

/**
 * Result type for error handling (Railway-oriented programming pattern)
 */
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Egaroucid WASM Module Interface
 * Represents the exported functions and memory from ai.wasm
 */
export interface EgaroucidWASMModule {
  // AI calculation (main function)
  // Actual signature: _calc_value(a0, a1?, a2?, a3?)
  // Simplified: first parameter (boardPtr) is mandatory
  _calc_value(boardPtr: number, ...args: unknown[]): number;

  // AI initialization (called once at app startup)
  // Actual signature: _init_ai(a0?)
  // Simplified: can be called without parameters
  _init_ai(config?: unknown): void;

  // Alternative AI calculation function (found in ai-ex.js, usage TBD)
  _ai_js?(board: unknown, level?: number, other?: unknown): unknown;

  // Calculation control
  _resume(): void; // Resume paused calculation
  _stop(): void; // Stop calculation

  // Memory management (Emscripten standard)
  _malloc(size: number): number; // Allocate WASM memory
  _free(ptr: number): void; // Free memory

  // Exported memory and heap views
  memory: WebAssembly.Memory;
  HEAP8: Int8Array;
  HEAPU8: Uint8Array;
}

/**
 * WASM pointer type (number representing memory address)
 */
export type WASMPointer = number;

/**
 * WASM Load Error
 */
export interface WASMLoadError {
  readonly type: 'wasm_load_error';
  readonly reason:
    | 'fetch_failed'
    | 'instantiation_failed'
    | 'initialization_timeout';
  readonly message: string;
}

/**
 * WASM Initialization Error
 */
export interface InitializationError {
  readonly type: 'initialization_error';
  readonly reason:
    | 'wasm_load_failed'
    | 'wasm_instantiation_failed'
    | 'test_call_failed';
  readonly message: string;
}

/**
 * Board Encoding Error
 */
export interface EncodeError {
  readonly type: 'encode_error';
  readonly reason:
    | 'invalid_board'
    | 'memory_allocation_failed'
    | 'invalid_player';
  readonly message: string;
}

/**
 * WASM Call Error
 */
export interface WASMCallError {
  readonly type: 'wasm_call_error';
  readonly reason: 'module_not_ready' | 'execution_failed' | 'null_pointer';
  readonly message: string;
}

/**
 * Response Decode Error
 */
export interface DecodeError {
  readonly type: 'decode_error';
  readonly reason: 'invalid_response';
  readonly message: string;
}

/**
 * AI Calculation Error
 */
export interface AICalculationError {
  readonly type: 'ai_calculation_error';
  readonly reason:
    | 'not_initialized'
    | 'timeout'
    | 'invalid_response'
    | 'wasm_error';
  readonly message: string;
}

/**
 * AI Worker Request Message
 */
export interface AIWorkerRequest {
  type: 'calculate';
  payload: {
    board: Board;
    currentPlayer: Player;
    timeoutMs?: number;
  };
}

/**
 * AI Worker Response Message
 */
export interface AIWorkerResponse {
  type: 'success' | 'error';
  payload: {
    move?: Position;
    error?: string;
    calculationTimeMs?: number;
  };
}
