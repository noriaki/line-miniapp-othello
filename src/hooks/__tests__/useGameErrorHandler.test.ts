/**
 * Game Error Handler Hook Tests
 * Task 7.3: ユーザ入力とビジネスロジックのエラーハンドリング
 * Test-Driven Development: Tests written BEFORE implementation
 */

import { renderHook, act } from '@testing-library/react';
import { useGameErrorHandler } from '../useGameErrorHandler';

describe('useGameErrorHandler', () => {
  describe('RED: Invalid move feedback', () => {
    it('should set invalid move position when invalid move is attempted', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.handleInvalidMove({ row: 2, col: 3 }, 'occupied');
      });

      expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });
      expect(result.current.invalidMoveReason).toBe('occupied');
    });

    it('should clear invalid move feedback after timeout', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.handleInvalidMove({ row: 2, col: 3 }, 'no_flips');
      });

      expect(result.current.invalidMovePosition).toEqual({ row: 2, col: 3 });

      // Fast-forward time by 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      expect(result.current.invalidMovePosition).toBeNull();
      expect(result.current.invalidMoveReason).toBeNull();

      jest.useRealTimers();
    });

    it('should provide user-friendly error message for each reason', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.handleInvalidMove({ row: 0, col: 0 }, 'occupied');
      });
      expect(result.current.getErrorMessage()).toBe(
        'そのマスには既に石が置かれています'
      );

      act(() => {
        result.current.handleInvalidMove({ row: 0, col: 0 }, 'no_flips');
      });
      expect(result.current.getErrorMessage()).toBe(
        'そのマスに置いても石を反転できません'
      );

      act(() => {
        result.current.handleInvalidMove({ row: 0, col: 0 }, 'out_of_bounds');
      });
      expect(result.current.getErrorMessage()).toBe('無効な位置です');
    });
  });

  describe('RED: Turn skip notification', () => {
    it('should set skip notification when player has no valid moves', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyTurnSkip('black');
      });

      expect(result.current.skipNotification).toBe('black');
    });

    it('should clear skip notification after timeout', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyTurnSkip('white');
      });

      expect(result.current.skipNotification).toBe('white');

      // Fast-forward time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.skipNotification).toBeNull();

      jest.useRealTimers();
    });

    it('should provide skip message for each player', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyTurnSkip('black');
      });
      expect(result.current.getSkipMessage()).toBe(
        '有効な手がありません。あなたのターンをスキップします。'
      );

      act(() => {
        result.current.notifyTurnSkip('white');
      });
      expect(result.current.getSkipMessage()).toBe(
        '有効な手がありません。AIのターンをスキップします。'
      );
    });
  });

  describe('RED: Game state inconsistency detection', () => {
    it('should detect invalid board state', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.detectInconsistency('invalid_board_size');
      });

      expect(result.current.hasInconsistency).toBe(true);
      expect(result.current.inconsistencyReason).toBe('invalid_board_size');
    });

    it('should provide reset suggestion message', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.detectInconsistency('corrupted_state');
      });

      expect(result.current.getInconsistencyMessage()).toBe(
        'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。'
      );
    });

    it('should allow clearing inconsistency flag', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.detectInconsistency('invalid_board_size');
      });

      expect(result.current.hasInconsistency).toBe(true);

      act(() => {
        result.current.clearInconsistency();
      });

      expect(result.current.hasInconsistency).toBe(false);
      expect(result.current.inconsistencyReason).toBeNull();
    });
  });
});
