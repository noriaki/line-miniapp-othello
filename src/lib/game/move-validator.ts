/**
 * Move validation and flip detection logic for Reversi
 */

import { Board, Player, Position } from './types';
import { getCellAt } from './board';

export interface Direction {
  readonly dx: number;
  readonly dy: number;
}

export const DIRECTIONS: readonly Direction[] = Object.freeze([
  { dx: -1, dy: -1 }, // 左上
  { dx: -1, dy: 0 }, // 上
  { dx: -1, dy: 1 }, // 右上
  { dx: 0, dy: -1 }, // 左
  { dx: 0, dy: 1 }, // 右
  { dx: 1, dy: -1 }, // 左下
  { dx: 1, dy: 0 }, // 下
  { dx: 1, dy: 1 }, // 右下
]);

export interface InvalidMoveError {
  readonly type: 'invalid_move';
  readonly reason: 'out_of_bounds' | 'occupied' | 'no_flips';
}

export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Finds all stones that would be flipped in a specific direction
 * Returns positions of opponent stones to flip, or empty array if no flips
 */
export function findFlipsInDirection(
  board: Board,
  position: Position,
  player: Player,
  direction: Direction
): Position[] {
  const opponent: Player = player === 'black' ? 'white' : 'black';
  const flips: Position[] = [];

  let currentRow = position.row + direction.dx;
  let currentCol = position.col + direction.dy;

  // Traverse in the direction, collecting opponent stones
  while (
    currentRow >= 0 &&
    currentRow < 8 &&
    currentCol >= 0 &&
    currentCol < 8
  ) {
    const cell = board[currentRow][currentCol];

    if (cell === null) {
      // Empty cell - no flips in this direction
      return [];
    } else if (cell === opponent) {
      // Opponent stone - add to potential flips
      flips.push({ row: currentRow, col: currentCol });
    } else if (cell === player) {
      // Our stone - flips are valid if we collected at least one opponent stone
      return flips.length > 0 ? flips : [];
    }

    currentRow += direction.dx;
    currentCol += direction.dy;
  }

  // Reached edge of board without finding our stone - no flips
  return [];
}

/**
 * Finds all stones that would be flipped by placing a stone at the given position
 * Checks all 8 directions and aggregates results
 */
export function findAllFlips(
  board: Board,
  position: Position,
  player: Player
): Position[] {
  const allFlips: Position[] = [];

  for (const direction of DIRECTIONS) {
    const flips = findFlipsInDirection(board, position, player, direction);
    allFlips.push(...flips);
  }

  return allFlips;
}

/**
 * Validates if a move is legal according to Reversi rules
 * Returns success with true if valid, or error with reason if invalid
 */
export function validateMove(
  board: Board,
  position: Position,
  player: Player
): Result<boolean, InvalidMoveError> {
  // Check bounds
  if (
    position.row < 0 ||
    position.row >= 8 ||
    position.col < 0 ||
    position.col >= 8
  ) {
    return {
      success: false,
      error: { type: 'invalid_move', reason: 'out_of_bounds' },
    };
  }

  // Check if cell is empty
  const cell = getCellAt(board, position);
  if (cell !== null) {
    return {
      success: false,
      error: { type: 'invalid_move', reason: 'occupied' },
    };
  }

  // Check if move would flip at least one opponent stone
  const flips = findAllFlips(board, position, player);
  if (flips.length === 0) {
    return {
      success: false,
      error: { type: 'invalid_move', reason: 'no_flips' },
    };
  }

  return { success: true, value: true };
}
