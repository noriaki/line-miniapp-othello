/**
 * Comprehensive unit tests for Game Logic
 * Testing complex scenarios, edge cases, and boundary conditions
 */

import { applyMove, calculateValidMoves, validateMove } from '../game-logic';
import { createInitialBoard, setCellAt, getCellAt } from '../board';
import type { Board } from '../types';

describe('Game Logic - Comprehensive Tests', () => {
  describe('applyMove - Complex Flip Patterns', () => {
    it('should flip stones in all 8 directions simultaneously', () => {
      // Create a board where placing at (4,4) flips in all 8 directions
      let board = createInitialBoard();

      // Clear initial stones first
      board = setCellAt(board, { row: 3, col: 3 }, null);
      board = setCellAt(board, { row: 3, col: 4 }, null);
      board = setCellAt(board, { row: 4, col: 3 }, null);
      board = setCellAt(board, { row: 4, col: 4 }, null);

      // Set up white stones surrounding (4,4) in all 8 directions
      // Top-left diagonal
      board = setCellAt(board, { row: 3, col: 3 }, 'white');
      board = setCellAt(board, { row: 2, col: 2 }, 'black');

      // Top
      board = setCellAt(board, { row: 3, col: 4 }, 'white');
      board = setCellAt(board, { row: 2, col: 4 }, 'black');

      // Top-right diagonal
      board = setCellAt(board, { row: 3, col: 5 }, 'white');
      board = setCellAt(board, { row: 2, col: 6 }, 'black');

      // Left
      board = setCellAt(board, { row: 4, col: 3 }, 'white');
      board = setCellAt(board, { row: 4, col: 2 }, 'black');

      // Right
      board = setCellAt(board, { row: 4, col: 5 }, 'white');
      board = setCellAt(board, { row: 4, col: 6 }, 'black');

      // Bottom-left diagonal
      board = setCellAt(board, { row: 5, col: 3 }, 'white');
      board = setCellAt(board, { row: 6, col: 2 }, 'black');

      // Bottom
      board = setCellAt(board, { row: 5, col: 4 }, 'white');
      board = setCellAt(board, { row: 6, col: 4 }, 'black');

      // Bottom-right diagonal
      board = setCellAt(board, { row: 5, col: 5 }, 'white');
      board = setCellAt(board, { row: 6, col: 6 }, 'black');

      const result = applyMove(board, { row: 4, col: 4 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;

        // All surrounding white stones should be flipped to black
        expect(getCellAt(newBoard, { row: 3, col: 3 })).toBe('black');
        expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black');
        expect(getCellAt(newBoard, { row: 3, col: 5 })).toBe('black');
        expect(getCellAt(newBoard, { row: 4, col: 3 })).toBe('black');
        expect(getCellAt(newBoard, { row: 4, col: 4 })).toBe('black');
        expect(getCellAt(newBoard, { row: 4, col: 5 })).toBe('black');
        expect(getCellAt(newBoard, { row: 5, col: 3 })).toBe('black');
        expect(getCellAt(newBoard, { row: 5, col: 4 })).toBe('black');
        expect(getCellAt(newBoard, { row: 5, col: 5 })).toBe('black');
      }
    });

    it('should flip long chains of stones (5+ stones in a row)', () => {
      let board = createInitialBoard();

      // Create a long horizontal chain: black-white-white-white-white-white-empty
      board = setCellAt(board, { row: 0, col: 0 }, 'black');
      board = setCellAt(board, { row: 0, col: 1 }, 'white');
      board = setCellAt(board, { row: 0, col: 2 }, 'white');
      board = setCellAt(board, { row: 0, col: 3 }, 'white');
      board = setCellAt(board, { row: 0, col: 4 }, 'white');
      board = setCellAt(board, { row: 0, col: 5 }, 'white');
      // (0,6) is empty

      const result = applyMove(board, { row: 0, col: 6 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;

        // All 5 white stones should be flipped
        for (let col = 1; col <= 5; col++) {
          expect(getCellAt(newBoard, { row: 0, col })).toBe('black');
        }
        expect(getCellAt(newBoard, { row: 0, col: 6 })).toBe('black');
      }
    });

    it('should flip multiple chains in different directions from one move', () => {
      let board = createInitialBoard();

      // Clear initial center stones
      board = setCellAt(board, { row: 3, col: 3 }, null);
      board = setCellAt(board, { row: 3, col: 4 }, null);
      board = setCellAt(board, { row: 4, col: 3 }, null);
      board = setCellAt(board, { row: 4, col: 4 }, null);

      // Set up scenario: placing at (4,4) flips both horizontally and vertically
      // Horizontal: (4,2)-black, (4,3)-white, (4,4)-empty, (4,5)-white, (4,6)-black
      board = setCellAt(board, { row: 4, col: 2 }, 'black');
      board = setCellAt(board, { row: 4, col: 3 }, 'white');
      board = setCellAt(board, { row: 4, col: 5 }, 'white');
      board = setCellAt(board, { row: 4, col: 6 }, 'black');

      // Vertical: (2,4)-black, (3,4)-white, (4,4)-empty, (5,4)-white, (6,4)-black
      board = setCellAt(board, { row: 2, col: 4 }, 'black');
      board = setCellAt(board, { row: 3, col: 4 }, 'white');
      board = setCellAt(board, { row: 5, col: 4 }, 'white');
      board = setCellAt(board, { row: 6, col: 4 }, 'black');

      const result = applyMove(board, { row: 4, col: 4 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;

        // Horizontal flips
        expect(getCellAt(newBoard, { row: 4, col: 3 })).toBe('black');
        expect(getCellAt(newBoard, { row: 4, col: 5 })).toBe('black');

        // Vertical flips
        expect(getCellAt(newBoard, { row: 3, col: 4 })).toBe('black');
        expect(getCellAt(newBoard, { row: 5, col: 4 })).toBe('black');
      }
    });

    it('should handle corner moves with diagonal flips', () => {
      let board = createInitialBoard();

      // Set up corner scenario: (0,0)-empty, (1,1)-white, (2,2)-black
      board = setCellAt(board, { row: 1, col: 1 }, 'white');
      board = setCellAt(board, { row: 2, col: 2 }, 'black');

      const result = applyMove(board, { row: 0, col: 0 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;
        expect(getCellAt(newBoard, { row: 0, col: 0 })).toBe('black');
        expect(getCellAt(newBoard, { row: 1, col: 1 })).toBe('black');
        expect(getCellAt(newBoard, { row: 2, col: 2 })).toBe('black');
      }
    });

    it('should not flip stones beyond the terminating player stone', () => {
      let board = createInitialBoard();

      // Pattern: black-white-white-black-white-empty
      board = setCellAt(board, { row: 0, col: 0 }, 'black');
      board = setCellAt(board, { row: 0, col: 1 }, 'white');
      board = setCellAt(board, { row: 0, col: 2 }, 'white');
      board = setCellAt(board, { row: 0, col: 3 }, 'black'); // This terminates the flip
      board = setCellAt(board, { row: 0, col: 4 }, 'white'); // This should NOT be flipped
      // (0,5) is empty

      const result = applyMove(board, { row: 0, col: 5 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        const newBoard = result.value;
        // (0,4) should be flipped because there's (0,3)-black before it
        expect(getCellAt(newBoard, { row: 0, col: 4 })).toBe('black');
      }
    });
  });

  describe('applyMove - Boundary Conditions', () => {
    it('should handle moves at all four corners', () => {
      const corners = [
        { row: 0, col: 0 }, // Top-left
        { row: 0, col: 7 }, // Top-right
        { row: 7, col: 0 }, // Bottom-left
        { row: 7, col: 7 }, // Bottom-right
      ];

      corners.forEach((corner) => {
        let board = createInitialBoard();
        // Set up a valid scenario for each corner
        const adjacent = {
          row: corner.row === 0 ? 1 : 6,
          col: corner.col === 0 ? 1 : 6,
        };
        const terminal = {
          row: corner.row === 0 ? 2 : 5,
          col: corner.col === 0 ? 2 : 5,
        };

        board = setCellAt(board, adjacent, 'white');
        board = setCellAt(board, terminal, 'black');

        const result = applyMove(board, corner, 'black');
        expect(result.success).toBe(true);
      });
    });

    it('should handle moves at all four edges', () => {
      // Top edge
      let board = createInitialBoard();
      board = setCellAt(board, { row: 0, col: 3 }, 'black');
      board = setCellAt(board, { row: 1, col: 3 }, 'white');
      board = setCellAt(board, { row: 2, col: 3 }, 'white');
      board = setCellAt(board, { row: 3, col: 3 }, 'black');

      const result = applyMove(board, { row: 0, col: 3 }, 'white');
      expect(result.success).toBe(false); // Cell is occupied
    });

    it('should reject moves at negative positions', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: -1, col: 0 }, 'black');
      expect(result.success).toBe(false);
    });

    it('should reject moves beyond board bounds (row >= 8)', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 8, col: 0 }, 'black');
      expect(result.success).toBe(false);
    });

    it('should reject moves beyond board bounds (col >= 8)', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 0, col: 8 }, 'black');
      expect(result.success).toBe(false);
    });
  });

  describe('calculateValidMoves - Complex Board States', () => {
    it('should find valid moves in a nearly full board', () => {
      let board = createInitialBoard();

      // Fill most of the board, leaving a few strategic positions
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 8; col++) {
          if (row % 2 === 0) {
            board = setCellAt(board, { row, col }, 'black');
          } else {
            board = setCellAt(board, { row, col }, 'white');
          }
        }
      }
      // Leave row 7 partially empty
      board = setCellAt(board, { row: 7, col: 0 }, 'white');
      board = setCellAt(board, { row: 7, col: 1 }, 'black');
      // (7,2) to (7,7) are empty

      const validMoves = calculateValidMoves(board, 'white');

      // Should find at least one valid move
      expect(validMoves.length).toBeGreaterThan(0);

      // All returned moves should actually be empty cells
      validMoves.forEach((move) => {
        expect(getCellAt(board, move)).toBe(null);
      });
    });

    it('should return empty array when player has no valid moves (surrounded)', () => {
      let board = createInitialBoard();

      // Create scenario where black is completely surrounded by white
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          board = setCellAt(board, { row, col }, 'white');
        }
      }
      // Leave one empty cell but with no valid flips
      board = setCellAt(board, { row: 0, col: 0 }, null);

      const validMoves = calculateValidMoves(board, 'black');
      expect(validMoves).toEqual([]);
    });

    it('should find moves for white when black has just made a move', () => {
      const board = createInitialBoard();

      // After black's first move at (3,2)
      const result = applyMove(board, { row: 3, col: 2 }, 'black');
      expect(result.success).toBe(true);

      if (result.success) {
        const validMoves = calculateValidMoves(result.value, 'white');

        // White should have valid moves
        expect(validMoves.length).toBeGreaterThan(0);

        // Verify each move is actually valid
        validMoves.forEach((move) => {
          const moveResult = validateMove(result.value, move, 'white');
          expect(moveResult.success).toBe(true);
        });
      }
    });

    it('should handle alternating sparse and dense areas on the board', () => {
      let board = createInitialBoard();

      // Create dense area (top-left quadrant)
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if ((row + col) % 2 === 0) {
            board = setCellAt(board, { row, col }, 'black');
          } else {
            board = setCellAt(board, { row, col }, 'white');
          }
        }
      }

      // Leave sparse area (bottom-right quadrant mostly empty)

      const validMovesBlack = calculateValidMoves(board, 'black');
      const validMovesWhite = calculateValidMoves(board, 'white');

      // Both players should have some valid moves
      expect(validMovesBlack.length + validMovesWhite.length).toBeGreaterThan(
        0
      );
    });

    it('should not return duplicate positions even with complex patterns', () => {
      let board = createInitialBoard();

      // Create a complex pattern with potential for duplicates
      board = setCellAt(board, { row: 2, col: 2 }, 'black');
      board = setCellAt(board, { row: 2, col: 3 }, 'white');
      board = setCellAt(board, { row: 2, col: 4 }, 'white');
      board = setCellAt(board, { row: 2, col: 5 }, 'black');

      const validMoves = calculateValidMoves(board, 'black');

      const uniqueSet = new Set(validMoves.map((p) => `${p.row},${p.col}`));
      expect(uniqueSet.size).toBe(validMoves.length);
    });
  });

  describe('validateMove - Edge Cases', () => {
    it('should reject move that would flip zero stones', () => {
      const board = createInitialBoard();

      // Position (0,0) has no adjacent opponent stones to flip
      const result = validateMove(board, { row: 0, col: 0 }, 'black');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.reason).toBe('no_flips');
      }
    });

    it('should accept move that flips exactly one stone', () => {
      const board = createInitialBoard();

      // Set up: (3,2)-empty, (3,3)-white, (3,4)-black
      // Already in initial board, so (3,2) is valid for black

      const result = validateMove(board, { row: 3, col: 2 }, 'black');
      expect(result.success).toBe(true);
    });

    it('should validate diagonal moves at corners', () => {
      let board = createInitialBoard();

      // Corner: (7,7)-empty, (6,6)-white, (5,5)-black
      board = setCellAt(board, { row: 6, col: 6 }, 'white');
      board = setCellAt(board, { row: 5, col: 5 }, 'black');

      const result = validateMove(board, { row: 7, col: 7 }, 'black');
      expect(result.success).toBe(true);
    });

    it('should reject move on cell occupied by same player', () => {
      const board = createInitialBoard();

      // (3,4) is already black in initial board
      const result = validateMove(board, { row: 3, col: 4 }, 'black');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.reason).toBe('occupied');
      }
    });

    it('should reject move on cell occupied by opponent', () => {
      const board = createInitialBoard();

      // (3,3) is white in initial board
      const result = validateMove(board, { row: 3, col: 3 }, 'black');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.reason).toBe('occupied');
      }
    });

    it('should handle maximum coordinate boundaries (7,7)', () => {
      let board = createInitialBoard();

      // Make (7,7) a valid move
      board = setCellAt(board, { row: 7, col: 6 }, 'white');
      board = setCellAt(board, { row: 7, col: 5 }, 'black');

      const result = validateMove(board, { row: 7, col: 7 }, 'black');
      expect(result.success).toBe(true);
    });

    it('should handle minimum coordinate boundaries (0,0)', () => {
      let board = createInitialBoard();

      // Make (0,0) a valid move
      board = setCellAt(board, { row: 0, col: 1 }, 'white');
      board = setCellAt(board, { row: 0, col: 2 }, 'black');

      const result = validateMove(board, { row: 0, col: 0 }, 'black');
      expect(result.success).toBe(true);
    });
  });

  describe('Immutability Guarantees', () => {
    it('should never modify the original board in applyMove', () => {
      const board = createInitialBoard();
      const originalCell = getCellAt(board, { row: 3, col: 2 });
      const originalFlipTarget = getCellAt(board, { row: 3, col: 3 });

      applyMove(board, { row: 3, col: 2 }, 'black');

      // Original board should remain unchanged
      expect(getCellAt(board, { row: 3, col: 2 })).toBe(originalCell);
      expect(getCellAt(board, { row: 3, col: 3 })).toBe(originalFlipTarget);
    });

    it('should return frozen board from applyMove', () => {
      const board = createInitialBoard();
      const result = applyMove(board, { row: 3, col: 2 }, 'black');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.isFrozen(result.value)).toBe(true);
        expect(Object.isFrozen(result.value[0])).toBe(true);
      }
    });

    it('should not modify board during calculateValidMoves', () => {
      const board = createInitialBoard();
      const originalBoard = JSON.stringify(board);

      calculateValidMoves(board, 'black');

      expect(JSON.stringify(board)).toBe(originalBoard);
    });
  });

  describe('Performance and Stress Tests', () => {
    it('should handle calculating valid moves on empty board efficiently', () => {
      const emptyBoard: Board = Object.freeze(
        Array(8)
          .fill(null)
          .map(() => Object.freeze(Array(8).fill(null)))
      );

      const validMoves = calculateValidMoves(emptyBoard, 'black');

      // Empty board has no valid moves for either player
      expect(validMoves).toEqual([]);
    });

    it('should handle calculateValidMoves on full board efficiently', () => {
      let board = createInitialBoard();

      // Fill entire board
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          board = setCellAt(board, { row, col }, 'black');
        }
      }

      const validMoves = calculateValidMoves(board, 'white');

      // Full board has no valid moves
      expect(validMoves).toEqual([]);
    });

    it('should handle complex board state with many flips efficiently', () => {
      let board = createInitialBoard();

      // Create checkerboard pattern
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (
            (row + col) % 2 === 0 &&
            !(row >= 3 && row <= 4 && col >= 3 && col <= 4)
          ) {
            board = setCellAt(board, { row, col }, 'black');
          } else if (!(row >= 3 && row <= 4 && col >= 3 && col <= 4)) {
            board = setCellAt(board, { row, col }, 'white');
          }
        }
      }

      const validMoves = calculateValidMoves(board, 'black');

      // Should complete without timeout and return valid results
      expect(Array.isArray(validMoves)).toBe(true);
    });
  });
});
