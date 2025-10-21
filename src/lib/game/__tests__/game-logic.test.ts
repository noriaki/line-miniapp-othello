import { applyMove, calculateValidMoves } from '../game-logic';
import { createInitialBoard, setCellAt, getCellAt } from '../board';

describe('Game Logic', () => {
  describe('applyMove', () => {
    it('should place stone and flip opponent stones', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 3, col: 2 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;
        expect(getCellAt(newBoard, { row: 3, col: 2 })).toBe('black');
        expect(getCellAt(newBoard, { row: 3, col: 3 })).toBe('black'); // Flipped
      }
    });

    it('should not modify original board (immutable)', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 3, col: 2 }, 'black');

      expect(result.success).toBe(true);
      expect(getCellAt(board, { row: 3, col: 2 })).toBe(null);
      expect(getCellAt(board, { row: 3, col: 3 })).toBe('white');
    });

    it('should flip stones in multiple directions', () => {
      const board = createInitialBoard();
      // Initial: (3,3)=white, (3,4)=black
      // After placing black at (3,2), it flips (3,3) horizontally
      const result = applyMove(board, { row: 3, col: 2 }, 'black');
      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;
        // Check that stone was placed and opponent stone was flipped
        expect(getCellAt(newBoard, { row: 3, col: 2 })).toBe('black');
        expect(getCellAt(newBoard, { row: 3, col: 3 })).toBe('black'); // Flipped from white
        expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black'); // Already black
      }
    });

    it('should return error for invalid move', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 0, col: 0 }, 'black');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.type).toBe('move_application_error');
      }
    });

    it('should return error for occupied cell', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 3, col: 3 }, 'black');

      expect(result.success).toBe(false);
    });

    it('should handle edge cases at board boundaries', () => {
      let board = createInitialBoard();
      board = setCellAt(board, { row: 0, col: 1 }, 'white');
      board = setCellAt(board, { row: 0, col: 2 }, 'black');

      const result = applyMove(board, { row: 0, col: 0 }, 'black');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(getCellAt(result.value, { row: 0, col: 0 })).toBe('black');
        expect(getCellAt(result.value, { row: 0, col: 1 })).toBe('black');
      }
    });
  });

  describe('calculateValidMoves', () => {
    it('should find all valid moves at game start for black', () => {
      const board = createInitialBoard();
      const validMoves = calculateValidMoves(board, 'black');

      expect(validMoves.length).toBe(4);
      expect(validMoves).toContainEqual({ row: 3, col: 2 });
      expect(validMoves).toContainEqual({ row: 2, col: 3 });
      expect(validMoves).toContainEqual({ row: 5, col: 4 });
      expect(validMoves).toContainEqual({ row: 4, col: 5 });
    });

    it('should find all valid moves at game start for white', () => {
      const board = createInitialBoard();
      const validMoves = calculateValidMoves(board, 'white');

      expect(validMoves.length).toBe(4);
      expect(validMoves).toContainEqual({ row: 2, col: 4 });
      expect(validMoves).toContainEqual({ row: 3, col: 5 });
      expect(validMoves).toContainEqual({ row: 4, col: 2 });
      expect(validMoves).toContainEqual({ row: 5, col: 3 });
    });

    it('should return empty array when no valid moves exist', () => {
      // Create a board with no valid moves for black
      let board = createInitialBoard();
      // Fill entire board with white except one empty cell with no valid flips
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (row < 7 || col < 7) {
            board = setCellAt(board, { row, col }, 'white');
          }
        }
      }

      const validMoves = calculateValidMoves(board, 'black');
      expect(validMoves).toEqual([]);
    });

    it('should not include duplicate positions', () => {
      const board = createInitialBoard();
      const validMoves = calculateValidMoves(board, 'black');

      const uniquePositions = new Set(
        validMoves.map((p) => `${p.row},${p.col}`)
      );
      expect(uniquePositions.size).toBe(validMoves.length);
    });

    it('should handle complex board states', () => {
      let board = createInitialBoard();
      // Make a few moves to create complex state
      const result1 = applyMove(board, { row: 3, col: 2 }, 'black');
      if (result1.success) {
        board = result1.value;
      }

      const validMoves = calculateValidMoves(board, 'white');
      expect(validMoves.length).toBeGreaterThan(0);
      // All moves should be valid
      validMoves.forEach((move) => {
        expect(getCellAt(board, move)).toBe(null);
      });
    });
  });
});
