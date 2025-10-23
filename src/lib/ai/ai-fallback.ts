/**
 * AI Fallback Logic
 * Provides fallback strategies when AI calculation fails
 * Requirements: 9.1, 9.3
 */

import type { Position } from '../game/types';

/**
 * Select a random valid move from available moves
 * Used as fallback when AI calculation times out
 * @param validMoves - Array of valid move positions
 * @returns Randomly selected position
 * @throws Error if validMoves array is empty
 */
export function selectRandomValidMove(validMoves: Position[]): Position {
  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }

  // Select random index
  const randomIndex = Math.floor(Math.random() * validMoves.length);
  return validMoves[randomIndex];
}
