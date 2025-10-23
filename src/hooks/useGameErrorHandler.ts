/**
 * Game Error Handler Hook
 * Manages user input errors and business logic error handling
 * Requirements: 2.2, 2.4, 9.2, 9.4
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { Position, Player } from '@/lib/game/types';

type InvalidMoveReason = 'occupied' | 'no_flips' | 'out_of_bounds';
type InconsistencyReason = 'invalid_board_size' | 'corrupted_state';

interface UseGameErrorHandlerReturn {
  // Invalid move state
  invalidMovePosition: Position | null;
  invalidMoveReason: InvalidMoveReason | null;
  handleInvalidMove: (position: Position, reason: InvalidMoveReason) => void;
  getErrorMessage: () => string | null;

  // Turn skip state
  skipNotification: Player | null;
  notifyTurnSkip: (player: Player) => void;
  getSkipMessage: () => string | null;

  // Game state inconsistency
  hasInconsistency: boolean;
  inconsistencyReason: InconsistencyReason | null;
  detectInconsistency: (reason: InconsistencyReason) => void;
  clearInconsistency: () => void;
  getInconsistencyMessage: () => string | null;
}

/**
 * Custom hook for game error handling
 * Provides centralized error state management for user inputs and game logic
 */
export function useGameErrorHandler(): UseGameErrorHandlerReturn {
  // Invalid move feedback state
  const [invalidMovePosition, setInvalidMovePosition] =
    useState<Position | null>(null);
  const [invalidMoveReason, setInvalidMoveReason] =
    useState<InvalidMoveReason | null>(null);

  // Turn skip notification state
  const [skipNotification, setSkipNotification] = useState<Player | null>(null);

  // Game state inconsistency state
  const [hasInconsistency, setHasInconsistency] = useState<boolean>(false);
  const [inconsistencyReason, setInconsistencyReason] =
    useState<InconsistencyReason | null>(null);

  // Timers for auto-clearing feedback
  const invalidMoveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const skipNotificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (invalidMoveTimerRef.current) {
        clearTimeout(invalidMoveTimerRef.current);
      }
      if (skipNotificationTimerRef.current) {
        clearTimeout(skipNotificationTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle invalid move feedback
   * Sets error state and auto-clears after 2 seconds
   */
  const handleInvalidMove = useCallback(
    (position: Position, reason: InvalidMoveReason) => {
      // Clear existing timer
      if (invalidMoveTimerRef.current) {
        clearTimeout(invalidMoveTimerRef.current);
      }

      // Set error state
      setInvalidMovePosition(position);
      setInvalidMoveReason(reason);

      // Auto-clear after 2 seconds
      invalidMoveTimerRef.current = setTimeout(() => {
        setInvalidMovePosition(null);
        setInvalidMoveReason(null);
      }, 2000);
    },
    []
  );

  /**
   * Get user-friendly error message for invalid move
   */
  const getErrorMessage = useCallback((): string | null => {
    if (!invalidMoveReason) {
      return null;
    }

    switch (invalidMoveReason) {
      case 'occupied':
        return 'そのマスには既に石が置かれています';
      case 'no_flips':
        return 'そのマスに置いても石を反転できません';
      case 'out_of_bounds':
        return '無効な位置です';
      default:
        return '無効な手です';
    }
  }, [invalidMoveReason]);

  /**
   * Notify turn skip
   * Sets notification and auto-clears after 3 seconds
   */
  const notifyTurnSkip = useCallback((player: Player) => {
    // Clear existing timer
    if (skipNotificationTimerRef.current) {
      clearTimeout(skipNotificationTimerRef.current);
    }

    // Set notification
    setSkipNotification(player);

    // Auto-clear after 3 seconds
    skipNotificationTimerRef.current = setTimeout(() => {
      setSkipNotification(null);
    }, 3000);
  }, []);

  /**
   * Get skip notification message
   */
  const getSkipMessage = useCallback((): string | null => {
    if (!skipNotification) {
      return null;
    }

    if (skipNotification === 'black') {
      return '有効な手がありません。あなたのターンをスキップします。';
    } else {
      return '有効な手がありません。AIのターンをスキップします。';
    }
  }, [skipNotification]);

  /**
   * Detect game state inconsistency
   */
  const detectInconsistency = useCallback((reason: InconsistencyReason) => {
    setHasInconsistency(true);
    setInconsistencyReason(reason);
  }, []);

  /**
   * Clear inconsistency flag
   */
  const clearInconsistency = useCallback(() => {
    setHasInconsistency(false);
    setInconsistencyReason(null);
  }, []);

  /**
   * Get inconsistency message
   */
  const getInconsistencyMessage = useCallback((): string | null => {
    if (!hasInconsistency) {
      return null;
    }

    return 'ゲーム状態に不整合が検出されました。ゲームをリセットすることをお勧めします。';
  }, [hasInconsistency]);

  return {
    invalidMovePosition,
    invalidMoveReason,
    handleInvalidMove,
    getErrorMessage,
    skipNotification,
    notifyTurnSkip,
    getSkipMessage,
    hasInconsistency,
    inconsistencyReason,
    detectInconsistency,
    clearInconsistency,
    getInconsistencyMessage,
  };
}
