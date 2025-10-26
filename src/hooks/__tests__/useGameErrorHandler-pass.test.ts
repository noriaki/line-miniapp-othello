/**
 * Game Error Handler Hook Tests - Pass Notification
 * Task 1.2: Replace skip notification with pass notification
 * Test-Driven Development: Tests written BEFORE implementation
 */

import { renderHook, act } from '@testing-library/react';
import { useGameErrorHandler } from '../useGameErrorHandler';

describe('useGameErrorHandler - Pass Notification (Task 1.2)', () => {
  describe('RED: Pass notification functionality', () => {
    it('should set pass notification when player passes', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('black');
      });

      expect(result.current.passNotification).toBe('black');
    });

    it('should clear pass notification after timeout', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('white');
      });

      expect(result.current.passNotification).toBe('white');

      // Fast-forward time by 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(result.current.passNotification).toBeNull();

      jest.useRealTimers();
    });

    it('should provide pass message for user (black player)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('black');
      });

      expect(result.current.getPassMessage()).toBe(
        '有効な手がありません。パスしました。'
      );
    });

    it('should provide pass message for AI (white player)', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      act(() => {
        result.current.notifyPass('white');
      });

      expect(result.current.getPassMessage()).toBe(
        'AIに有効な手がありません。AIがパスしました。'
      );
    });

    it('should return null when no pass notification is active', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      expect(result.current.getPassMessage()).toBeNull();
    });

    it('should clear existing timer when new pass notification is set', () => {
      jest.useFakeTimers();
      const { result } = renderHook(() => useGameErrorHandler());

      // First notification
      act(() => {
        result.current.notifyPass('black');
      });

      expect(result.current.passNotification).toBe('black');

      // Advance time partially
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // Second notification before first timer expires
      act(() => {
        result.current.notifyPass('white');
      });

      expect(result.current.passNotification).toBe('white');

      // Advance time by remaining 1.5 seconds (total 3 seconds from first)
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      // First timer should have been cleared, second notification still active
      expect(result.current.passNotification).toBe('white');

      // Advance another 1.5 seconds to clear second notification
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(result.current.passNotification).toBeNull();

      jest.useRealTimers();
    });
  });

  describe('RED: Skip notification should be removed', () => {
    it('should not have skipNotification property', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - skipNotification should not exist after migration
      expect(result.current.skipNotification).toBeUndefined();
    });

    it('should not have notifyTurnSkip method', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - notifyTurnSkip should not exist after migration
      expect(result.current.notifyTurnSkip).toBeUndefined();
    });

    it('should not have getSkipMessage method', () => {
      const { result } = renderHook(() => useGameErrorHandler());

      // @ts-expect-error - getSkipMessage should not exist after migration
      expect(result.current.getSkipMessage).toBeUndefined();
    });
  });
});
