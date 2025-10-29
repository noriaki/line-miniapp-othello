/**
 * Move history utilities for Reversi game
 * Converts board positions to chess notation format ([a-h][1-8])
 */

import type { Position } from './types';

/**
 * Converts a board position to chess notation format
 * @param position - Board position with row and col (0-7)
 * @returns Chess notation string (e.g., "e6", "a1", "h8")
 *          Returns "??" for out-of-range positions
 *
 * @example
 * positionToNotation({ row: 0, col: 0 }) // returns "a1"
 * positionToNotation({ row: 7, col: 7 }) // returns "h8"
 * positionToNotation({ row: 2, col: 6 }) // returns "c7"
 */
export function positionToNotation(position: Position): string {
  const { row, col } = position;

  // Validate position is within board boundaries (0-7)
  if (row < 0 || row > 7 || col < 0 || col > 7) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Invalid position: row=${row}, col=${col}`);
    }
    return '??';
  }

  // Convert row index (0-7) to letter (a-h)
  // Note: In this codebase, 'row' represents the horizontal position (column in chess notation)
  const columnLetter = String.fromCharCode('a'.charCodeAt(0) + row);

  // Convert col index (0-7) to number (1-8)
  // Note: In this codebase, 'col' represents the vertical position (row in chess notation)
  const rowNumber = String(col + 1);

  return columnLetter + rowNumber;
}
