import { checkGameEnd } from '../game-end';
import { createInitialBoard, setCellAt, countStones } from '../board';
import { calculateValidMoves } from '../game-logic';
import { Board } from '../types';

describe('Game End Logic', () => {
  describe('checkGameEnd', () => {
    it('should return not ended for initial board', () => {
      const board = createInitialBoard();
      const blackMoves = calculateValidMoves(board, 'black');
      const whiteMoves = calculateValidMoves(board, 'white');

      const result = checkGameEnd(board, blackMoves, whiteMoves);
      expect(result.ended).toBe(false);
    });

    it('should detect game end when board is full', () => {
      let board = createInitialBoard();
      // Fill entire board with black
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          board = setCellAt(board, { row, col }, 'black');
        }
      }

      const result = checkGameEnd(board, [], []);
      expect(result.ended).toBe(true);
      if (result.ended) {
        expect(result.winner).toBe('black');
      }
    });

    it('should detect game end when both players have no valid moves', () => {
      const board = createInitialBoard();
      const blackMoves: any[] = [];
      const whiteMoves: any[] = [];

      const result = checkGameEnd(board, blackMoves, whiteMoves);
      expect(result.ended).toBe(true);
    });

    it('should determine black as winner when black has more stones', () => {
      let board = createInitialBoard();
      // Create scenario where black has more stones
      for (let col = 0; col < 5; col++) {
        board = setCellAt(board, { row: 0, col }, 'black');
      }
      for (let col = 0; col < 3; col++) {
        board = setCellAt(board, { row: 1, col }, 'white');
      }

      const result = checkGameEnd(board, [], []);
      expect(result.ended).toBe(true);
      if (result.ended) {
        expect(result.winner).toBe('black');
      }
    });

    it('should determine white as winner when white has more stones', () => {
      let board = createInitialBoard();
      // Create scenario where white has more stones
      for (let col = 0; col < 5; col++) {
        board = setCellAt(board, { row: 0, col }, 'white');
      }
      for (let col = 0; col < 3; col++) {
        board = setCellAt(board, { row: 1, col }, 'black');
      }

      const result = checkGameEnd(board, [], []);
      expect(result.ended).toBe(true);
      if (result.ended) {
        expect(result.winner).toBe('white');
      }
    });

    it('should determine draw when both players have equal stones', () => {
      let board = createInitialBoard();
      // Create scenario with equal stones
      for (let col = 0; col < 4; col++) {
        board = setCellAt(board, { row: 0, col }, 'black');
        board = setCellAt(board, { row: 1, col }, 'white');
      }

      const result = checkGameEnd(board, [], []);
      expect(result.ended).toBe(true);
      if (result.ended) {
        expect(result.winner).toBe('draw');
      }
    });

    it('should continue game when at least one player has valid moves', () => {
      const board = createInitialBoard();
      const blackMoves = calculateValidMoves(board, 'black');
      const whiteMoves: any[] = []; // White has no moves but black does

      const result = checkGameEnd(board, blackMoves, whiteMoves);
      expect(result.ended).toBe(false);
    });

    it('should handle edge case with single player having all stones', () => {
      let board = createInitialBoard();
      // All stones are black
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          board = setCellAt(board, { row, col }, 'black');
        }
      }

      const result = checkGameEnd(board, [], []);
      expect(result.ended).toBe(true);
      if (result.ended) {
        expect(result.winner).toBe('black');
        const stones = countStones(board);
        expect(stones.black).toBe(64);
        expect(stones.white).toBe(0);
      }
    });

    it('should correctly count stones when determining winner', () => {
      let board = createInitialBoard();
      board = setCellAt(board, { row: 0, col: 0 }, 'black');
      board = setCellAt(board, { row: 0, col: 1 }, 'black');
      board = setCellAt(board, { row: 0, col: 2 }, 'white');

      const result = checkGameEnd(board, [], []);
      expect(result.ended).toBe(true);
      if (result.ended) {
        const stones = countStones(board);
        // 2 initial black + 2 new = 4 black, 2 initial white + 1 new = 3 white
        expect(stones.black).toBe(4);
        expect(stones.white).toBe(3);
        expect(result.winner).toBe('black');
      }
    });
  });
});
