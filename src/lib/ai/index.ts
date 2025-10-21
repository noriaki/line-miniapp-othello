/**
 * AI Engine Module
 * Exports all AI-related functionality
 */

export { AIEngine } from './ai-engine';
export { loadWASM, isModuleReady } from './wasm-loader';
export {
  encodeBoard,
  decodeResponse,
  callAIFunction,
  freeMemory,
} from './wasm-bridge';

export type {
  EgaroucidWASMModule,
  WASMPointer,
  WASMLoadError,
  InitializationError,
  EncodeError,
  DecodeError,
  WASMCallError,
  AICalculationError,
  AIWorkerRequest,
  AIWorkerResponse,
  Result,
} from './types';
