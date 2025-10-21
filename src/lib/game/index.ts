/**
 * Game logic module exports
 * Provides all game-related functionality for Reversi
 */

// Types
export type {
  Board,
  Cell,
  Player,
  Position,
  StoneCount,
  GameStatus,
  GameState,
} from './types';

// Board operations
export {
  createInitialBoard,
  countStones,
  cloneBoard,
  getCellAt,
  setCellAt,
} from './board';

// Move validation
export {
  validateMove,
  findAllFlips,
  findFlipsInDirection,
  DIRECTIONS,
} from './move-validator';
export type { Direction, InvalidMoveError, Result } from './move-validator';

// Game logic
export { applyMove, calculateValidMoves } from './game-logic';
export type { MoveApplicationError } from './game-logic';

// Game end detection
export { checkGameEnd } from './game-end';
export type { GameEndResult } from './game-end';
