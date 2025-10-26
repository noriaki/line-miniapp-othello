/**
 * Game State Hook Tests
 * Task 1.1: consecutivePassCount state management
 * Test-Driven Development: Tests written BEFORE implementation
 */

import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';
import type { GameStatus } from '@/lib/game/types';

describe('useGameState', () => {
  describe('RED: Basic game state management', () => {
    it('should initialize with default game state', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.currentPlayer).toBe('black');
      expect(result.current.gameStatus).toEqual({ type: 'playing' });
      expect(result.current.isAIThinking).toBe(false);
      expect(result.current.board).toHaveLength(8);
      expect(result.current.validMoves.length).toBeGreaterThan(0);
    });

    it('should switch player from black to white', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.currentPlayer).toBe('black');

      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentPlayer).toBe('white');
    });

    it('should switch player from white to black', () => {
      const { result } = renderHook(() => useGameState());

      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentPlayer).toBe('white');

      act(() => {
        result.current.switchPlayer();
      });

      expect(result.current.currentPlayer).toBe('black');
    });

    it('should update game status', () => {
      const { result } = renderHook(() => useGameState());

      const newStatus: GameStatus = { type: 'finished', winner: 'black' };

      act(() => {
        result.current.updateGameStatus(newStatus);
      });

      expect(result.current.gameStatus).toEqual(newStatus);
    });

    it('should reset game to initial state', () => {
      const { result } = renderHook(() => useGameState());

      // Modify state
      act(() => {
        result.current.switchPlayer();
        result.current.updateGameStatus({ type: 'finished', winner: 'white' });
        result.current.setAIThinking(true);
      });

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.currentPlayer).toBe('black');
      expect(result.current.gameStatus).toEqual({ type: 'playing' });
      expect(result.current.isAIThinking).toBe(false);
    });
  });

  describe('RED: Consecutive pass count management (Task 1.1)', () => {
    it('should initialize consecutivePassCount to 0', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should increment consecutivePassCount by 1 when incrementPassCount is called', () => {
      const { result } = renderHook(() => useGameState());

      expect(result.current.consecutivePassCount).toBe(0);

      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);

      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);
    });

    it('should reset consecutivePassCount to 0 when resetPassCount is called', () => {
      const { result } = renderHook(() => useGameState());

      // Increment count first
      act(() => {
        result.current.incrementPassCount();
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);

      // Reset
      act(() => {
        result.current.resetPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should reset consecutivePassCount to 0 when resetGame is called', () => {
      const { result } = renderHook(() => useGameState());

      // Increment count
      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(1);

      // Reset game
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.consecutivePassCount).toBe(0);
    });

    it('should ensure consecutivePassCount stays within 0-2 range', () => {
      const { result } = renderHook(() => useGameState());

      // Test upper bound
      act(() => {
        result.current.incrementPassCount();
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBe(2);

      // Additional increments should not exceed 2 (game should end at 2)
      act(() => {
        result.current.incrementPassCount();
      });

      expect(result.current.consecutivePassCount).toBeLessThanOrEqual(2);

      // Test lower bound after reset
      act(() => {
        result.current.resetPassCount();
      });

      expect(result.current.consecutivePassCount).toBeGreaterThanOrEqual(0);
    });
  });
});
