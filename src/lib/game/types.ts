/**
 * Core type definitions for Reversi game
 */

export type Player = 'black' | 'white';

export type Cell = Player | null;

export interface Position {
  readonly row: number;
  readonly col: number;
}

export type Board = ReadonlyArray<ReadonlyArray<Cell>>;

export interface StoneCount {
  readonly black: number;
  readonly white: number;
}

export type GameStatus =
  | { type: 'playing' }
  | { type: 'finished'; winner: Player | 'draw' }
  | { type: 'error'; message: string };

export interface GameState {
  board: Board;
  currentPlayer: Player;
  validMoves: Position[];
  gameStatus: GameStatus;
  blackCount: number;
  whiteCount: number;
  isAIThinking: boolean;
}
