import type { Board } from '../types';
import {
  createInitialBoard,
  countStones,
  cloneBoard,
  getCellAt,
  setCellAt,
} from '../board';

describe('Board Data Model', () => {
  describe('createInitialBoard', () => {
    it('should create an 8x8 board', () => {
      const board = createInitialBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
    });

    it('should place 2 black and 2 white stones in the center', () => {
      const board = createInitialBoard();
      // Center positions: (3,3), (3,4), (4,3), (4,4)
      // Initial setup: (3,3)=white, (3,4)=black, (4,3)=black, (4,4)=white
      expect(board[3][3]).toBe('white');
      expect(board[3][4]).toBe('black');
      expect(board[4][3]).toBe('black');
      expect(board[4][4]).toBe('white');
    });

    it('should have all other cells as null', () => {
      const board = createInitialBoard();
      let nullCount = 0;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (board[row][col] === null) {
            nullCount++;
          }
        }
      }
      expect(nullCount).toBe(60); // 64 - 4 initial stones
    });

    it('should create immutable nested arrays', () => {
      const board = createInitialBoard();
      expect(Object.isFrozen(board)).toBe(true);
      expect(Object.isFrozen(board[0])).toBe(true);
    });
  });

  describe('countStones', () => {
    it('should count initial board correctly', () => {
      const board = createInitialBoard();
      const count = countStones(board);
      expect(count).toEqual({ black: 2, white: 2 });
    });

    it('should count an empty board', () => {
      const emptyBoard: Board = Object.freeze(
        Array(8)
          .fill(null)
          .map(() => Object.freeze(Array(8).fill(null)))
      );
      const count = countStones(emptyBoard);
      expect(count).toEqual({ black: 0, white: 0 });
    });

    it('should count a board with more stones', () => {
      const board = createInitialBoard();
      const mutableBoard = board.map((row) => [...row]);
      mutableBoard[0][0] = 'black';
      mutableBoard[0][1] = 'white';
      mutableBoard[7][7] = 'black';
      const testBoard: Board = Object.freeze(
        mutableBoard.map((row) => Object.freeze(row))
      );
      const count = countStones(testBoard);
      expect(count).toEqual({ black: 4, white: 3 });
    });
  });

  describe('cloneBoard', () => {
    it('should create a deep copy of the board', () => {
      const original = createInitialBoard();
      const clone = cloneBoard(original);
      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });

    it('should not modify original when clone is modified', () => {
      const original = createInitialBoard();
      const clone = cloneBoard(original);
      const mutableClone = clone.map((row) => [...row]);
      mutableClone[0][0] = 'black';
      expect(original[0][0]).toBe(null);
    });
  });

  describe('getCellAt', () => {
    it('should get the correct cell value', () => {
      const board = createInitialBoard();
      expect(getCellAt(board, { row: 3, col: 3 })).toBe('white');
      expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
    });

    it('should throw error for out of bounds position', () => {
      const board = createInitialBoard();
      expect(() => getCellAt(board, { row: -1, col: 0 })).toThrow();
      expect(() => getCellAt(board, { row: 0, col: 8 })).toThrow();
    });
  });

  describe('setCellAt', () => {
    it('should return a new board with updated cell', () => {
      const board = createInitialBoard();
      const newBoard = setCellAt(board, { row: 0, col: 0 }, 'black');
      expect(getCellAt(newBoard, { row: 0, col: 0 })).toBe('black');
      expect(getCellAt(board, { row: 0, col: 0 })).toBe(null);
    });

    it('should throw error for out of bounds position', () => {
      const board = createInitialBoard();
      expect(() => setCellAt(board, { row: 8, col: 0 }, 'black')).toThrow();
    });

    it('should return an immutable board', () => {
      const board = createInitialBoard();
      const newBoard = setCellAt(board, { row: 0, col: 0 }, 'black');
      expect(Object.isFrozen(newBoard)).toBe(true);
      expect(Object.isFrozen(newBoard[0])).toBe(true);
    });
  });
});
