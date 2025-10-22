/**
 * Integration tests for AI module exports
 * Ensures all exports from index.ts are accessible and functional
 */

import {
  AIEngine,
  loadWASM,
  isModuleReady,
  encodeBoard,
  decodeResponse,
  callAIFunction,
  freeMemory,
} from '../index';

describe('AI Module Exports', () => {
  describe('Class Exports', () => {
    it('should export AIEngine class', () => {
      expect(AIEngine).toBeDefined();
      expect(typeof AIEngine).toBe('function');

      const engine = new AIEngine();
      expect(engine).toBeInstanceOf(AIEngine);
      engine.dispose();
    });
  });

  describe('Function Exports', () => {
    it('should export loadWASM function', () => {
      expect(loadWASM).toBeDefined();
      expect(typeof loadWASM).toBe('function');
    });

    it('should export isModuleReady function', () => {
      expect(isModuleReady).toBeDefined();
      expect(typeof isModuleReady).toBe('function');
    });

    it('should export encodeBoard function', () => {
      expect(encodeBoard).toBeDefined();
      expect(typeof encodeBoard).toBe('function');
    });

    it('should export decodeResponse function', () => {
      expect(decodeResponse).toBeDefined();
      expect(typeof decodeResponse).toBe('function');
    });

    it('should export callAIFunction function', () => {
      expect(callAIFunction).toBeDefined();
      expect(typeof callAIFunction).toBe('function');
    });

    it('should export freeMemory function', () => {
      expect(freeMemory).toBeDefined();
      expect(typeof freeMemory).toBe('function');
    });
  });

  describe('Integration', () => {
    it('should allow AIEngine to be instantiated and used', () => {
      const engine = new AIEngine('/test-worker.js');

      expect(engine.isReady()).toBe(false);

      engine.dispose();
    });

    it('should allow decodeResponse to work with valid input', () => {
      // FIXED: Use _ai_js response format
      // Row 3, Col 3 → index 27 → bit position 36
      // policy = 36, value = 5
      // encoded = 1000*(63-36)+100+5 = 27105
      const result = decodeResponse(27105);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.row).toBe(3);
        expect(result.value.col).toBe(3);
      }
    });

    it('should allow isModuleReady to check module validity', () => {
      expect(isModuleReady(null)).toBe(false);
      expect(isModuleReady(undefined)).toBe(false);
    });
  });
});
