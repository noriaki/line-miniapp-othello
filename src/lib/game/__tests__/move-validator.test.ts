import {
  validateMove,
  findAllFlips,
  findFlipsInDirection,
} from '../move-validator';
import { createInitialBoard, setCellAt } from '../board';

describe('Move Validator', () => {
  describe('findFlipsInDirection', () => {
    it('should find flips in horizontal direction', () => {
      const board = createInitialBoard();
      // Place black at (3,2), so (3,2)-black, (3,3)-white, (3,4)-black
      const testBoard = setCellAt(board, { row: 3, col: 2 }, 'black');

      const flips = findFlipsInDirection(
        testBoard,
        { row: 3, col: 5 },
        'white',
        { dx: 0, dy: -1 }
      );

      expect(flips).toEqual([{ row: 3, col: 4 }]);
    });

    it('should return empty array when no flips are possible', () => {
      const board = createInitialBoard();
      const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
        dx: 1,
        dy: 0,
      });
      expect(flips).toEqual([]);
    });

    it('should find flips in diagonal direction', () => {
      let board = createInitialBoard();
      board = setCellAt(board, { row: 2, col: 2 }, 'black');
      // (2,2)-black, (3,3)-white, (4,4)-white
      const flips = findFlipsInDirection(board, { row: 5, col: 5 }, 'black', {
        dx: -1,
        dy: -1,
      });
      expect(flips).toEqual([
        { row: 4, col: 4 },
        { row: 3, col: 3 },
      ]);
    });

    it('should stop at edge of board', () => {
      const board = createInitialBoard();
      const flips = findFlipsInDirection(board, { row: 0, col: 0 }, 'black', {
        dx: 1,
        dy: 1,
      });
      expect(flips).toEqual([]);
    });
  });

  describe('findAllFlips', () => {
    it('should find flips in multiple directions', () => {
      const board = createInitialBoard();
      // Set up scenario where placing at (3,2) flips (3,3)
      const flips = findAllFlips(board, { row: 3, col: 2 }, 'black');
      expect(flips).toContainEqual({ row: 3, col: 3 });
    });

    it('should return empty array when no flips are possible', () => {
      const board = createInitialBoard();
      const flips = findAllFlips(board, { row: 0, col: 0 }, 'black');
      expect(flips).toEqual([]);
    });

    it('should handle complex multi-directional flips', () => {
      let board = createInitialBoard();
      // Initial: (3,3)=white, (3,4)=black, (4,3)=black, (4,4)=white
      // Add (2,2)=black, so placing at (5,5) should flip (4,4)=white diagonally
      board = setCellAt(board, { row: 2, col: 2 }, 'black');

      const flips = findAllFlips(board, { row: 5, col: 5 }, 'black');
      // Should flip (4,4) diagonally
      expect(flips).toContainEqual({ row: 4, col: 4 });
    });

    it('should not include duplicates', () => {
      const board = createInitialBoard();
      const flips = findAllFlips(board, { row: 3, col: 2 }, 'black');
      const uniqueFlips = new Set(flips.map((p) => `${p.row},${p.col}`));
      expect(uniqueFlips.size).toBe(flips.length);
    });
  });

  describe('validateMove', () => {
    it('should validate a legal move at game start', () => {
      const board = createInitialBoard();
      const result = validateMove(board, { row: 3, col: 2 }, 'black');
      expect(result.success).toBe(true);
    });

    it('should reject move on occupied cell', () => {
      const board = createInitialBoard();
      const result = validateMove(board, { row: 3, col: 3 }, 'black');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.reason).toBe('occupied');
      }
    });

    it('should reject move out of bounds', () => {
      const board = createInitialBoard();
      const result = validateMove(board, { row: 8, col: 0 }, 'black');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.reason).toBe('out_of_bounds');
      }
    });

    it('should reject move with no flips', () => {
      const board = createInitialBoard();
      const result = validateMove(board, { row: 0, col: 0 }, 'black');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.reason).toBe('no_flips');
      }
    });

    it('should validate corner moves when valid', () => {
      let board = createInitialBoard();
      // Set up a scenario where corner is valid
      board = setCellAt(board, { row: 0, col: 1 }, 'white');
      board = setCellAt(board, { row: 0, col: 2 }, 'black');

      const result = validateMove(board, { row: 0, col: 0 }, 'black');
      expect(result.success).toBe(true);
    });

    it('should handle edge cases at board boundaries', () => {
      let board = createInitialBoard();
      board = setCellAt(board, { row: 7, col: 6 }, 'white');
      board = setCellAt(board, { row: 7, col: 5 }, 'black');

      const result = validateMove(board, { row: 7, col: 7 }, 'black');
      expect(result.success).toBe(true);
    });
  });
});
