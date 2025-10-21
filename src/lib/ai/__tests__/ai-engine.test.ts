/**
 * Unit tests for AI Engine Service
 * Tests high-level AI API
 */

import { AIEngine } from '../ai-engine';
import type { Board } from '../../game/types';

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  postMessage(): void {
    // Simulate async response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(
          new MessageEvent('message', {
            data: {
              type: 'success',
              payload: {
                move: { row: 2, col: 3 },
                calculationTimeMs: 500,
              },
            },
          })
        );
      }
    }, 10);
  }

  terminate(): void {
    // Mock terminate
  }

  addEventListener(type: string, listener: EventListener): void {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent) => void;
    } else if (type === 'error') {
      this.onerror = listener as (event: ErrorEvent) => void;
    }
  }

  removeEventListener(type: string): void {
    if (type === 'message') {
      this.onmessage = null;
    } else if (type === 'error') {
      this.onerror = null;
    }
  }
}

// Mock Worker constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Worker = MockWorker;

describe('AIEngine', () => {
  let aiEngine: AIEngine;
  const emptyBoard: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  beforeEach(() => {
    aiEngine = new AIEngine();
  });

  afterEach(() => {
    aiEngine.dispose();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const result = await aiEngine.initialize();

      expect(result.success).toBe(true);
      expect(aiEngine.isReady()).toBe(true);
    });
  });

  describe('calculateMove', () => {
    it('should calculate AI move successfully', async () => {
      await aiEngine.initialize();

      const result = await aiEngine.calculateMove(emptyBoard, 'white');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeDefined();
        expect(result.value.row).toBeGreaterThanOrEqual(0);
        expect(result.value.row).toBeLessThan(8);
        expect(result.value.col).toBeGreaterThanOrEqual(0);
        expect(result.value.col).toBeLessThan(8);
      }
    }, 10000);

    it('should return error when not initialized', async () => {
      const result = await aiEngine.calculateMove(emptyBoard, 'white');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('ai_calculation_error');
        expect(result.error.reason).toBe('not_initialized');
      }
    });

    it('should handle timeout correctly', async () => {
      await aiEngine.initialize();

      // Mock worker that never responds
      const slowWorker = new MockWorker();
      slowWorker.postMessage = jest.fn(); // Does not call onmessage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (aiEngine as any).worker = slowWorker;

      const result = await aiEngine.calculateMove(emptyBoard, 'white', 100);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('ai_calculation_error');
        expect(result.error.reason).toBe('timeout');
      }
    }, 10000);
  });

  describe('isReady', () => {
    it('should return false before initialization', () => {
      expect(aiEngine.isReady()).toBe(false);
    });

    it('should return true after initialization', async () => {
      await aiEngine.initialize();
      expect(aiEngine.isReady()).toBe(true);
    });

    it('should return false after disposal', async () => {
      await aiEngine.initialize();
      aiEngine.dispose();
      expect(aiEngine.isReady()).toBe(false);
    });
  });

  describe('dispose', () => {
    it('should clean up worker resources', async () => {
      await aiEngine.initialize();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worker = (aiEngine as any).worker;
      const terminateSpy = jest.spyOn(worker, 'terminate');

      aiEngine.dispose();

      expect(terminateSpy).toHaveBeenCalled();
      expect(aiEngine.isReady()).toBe(false);
    });

    it('should be safe to call multiple times', async () => {
      await aiEngine.initialize();

      expect(() => {
        aiEngine.dispose();
        aiEngine.dispose();
      }).not.toThrow();
    });
  });
});
