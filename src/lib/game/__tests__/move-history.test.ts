import type { Position } from '../types';
import { positionToNotation, generateNotationString } from '../move-history';

describe('Move History', () => {
  describe('positionToNotation', () => {
    describe('boundary value tests', () => {
      it('should convert (0,0) to "a1"', () => {
        const position: Position = { row: 0, col: 0 };
        expect(positionToNotation(position)).toBe('a1');
      });

      it('should convert (7,7) to "h8"', () => {
        const position: Position = { row: 7, col: 7 };
        expect(positionToNotation(position)).toBe('h8');
      });

      it('should convert (2,6) to "g3"', () => {
        const position: Position = { row: 2, col: 6 };
        expect(positionToNotation(position)).toBe('g3');
      });

      it('should convert (3,4) to "e4"', () => {
        const position: Position = { row: 3, col: 4 };
        expect(positionToNotation(position)).toBe('e4');
      });
    });

    describe('full coordinate conversion tests', () => {
      it('should convert all 64 positions correctly', () => {
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const position: Position = { row, col };
            // Corrected mapping: col -> column letter, row -> row number
            const expected = columns[col] + rows[row];
            expect(positionToNotation(position)).toBe(expected);
          }
        }
      });

      it('should cover all columns a-h', () => {
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const row = 0;

        columns.forEach((expectedCol, colIndex) => {
          const position: Position = { row, col: colIndex };
          const notation = positionToNotation(position);
          expect(notation[0]).toBe(expectedCol);
        });
      });

      it('should cover all rows 1-8', () => {
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const col = 0;

        rows.forEach((expectedRow, rowIndex) => {
          const position: Position = { row: rowIndex, col };
          const notation = positionToNotation(position);
          expect(notation[1]).toBe(expectedRow);
        });
      });
    });

    describe('pure function tests', () => {
      it('should return the same output for the same input', () => {
        const position: Position = { row: 3, col: 4 };
        const result1 = positionToNotation(position);
        const result2 = positionToNotation(position);
        const result3 = positionToNotation(position);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });

      it('should not modify the input position object', () => {
        const position: Position = { row: 3, col: 4 };
        const originalRow = position.row;
        const originalCol = position.col;

        positionToNotation(position);

        expect(position.row).toBe(originalRow);
        expect(position.col).toBe(originalCol);
      });
    });

    describe('type safety tests', () => {
      it('should compile without TypeScript errors', () => {
        const position: Position = { row: 0, col: 0 };
        const notation: string = positionToNotation(position);
        expect(typeof notation).toBe('string');
      });

      it('should return a string of length 2', () => {
        const position: Position = { row: 3, col: 4 };
        const notation = positionToNotation(position);
        expect(notation).toHaveLength(2);
      });
    });

    describe('error case tests', () => {
      it('should return "??" for negative row', () => {
        const position: Position = { row: -1, col: 0 };
        expect(positionToNotation(position)).toBe('??');
      });

      it('should return "??" for negative col', () => {
        const position: Position = { row: 0, col: -1 };
        expect(positionToNotation(position)).toBe('??');
      });

      it('should return "??" for row >= 8', () => {
        const position: Position = { row: 8, col: 0 };
        expect(positionToNotation(position)).toBe('??');
      });

      it('should return "??" for col >= 8', () => {
        const position: Position = { row: 0, col: 8 };
        expect(positionToNotation(position)).toBe('??');
      });

      it('should return "??" for both out of range', () => {
        const position: Position = { row: -1, col: 10 };
        expect(positionToNotation(position)).toBe('??');
      });

      it('should output console.warn in development for invalid position', () => {
        const originalEnv = process.env.NODE_ENV;
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'development',
          configurable: true,
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const position: Position = { row: -1, col: 0 };

        positionToNotation(position);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Invalid position')
        );

        consoleWarnSpy.mockRestore();
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: originalEnv,
          configurable: true,
        });
      });

      it('should not output console.warn in production for invalid position', () => {
        const originalEnv = process.env.NODE_ENV;
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: 'production',
          configurable: true,
        });

        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const position: Position = { row: -1, col: 0 };

        positionToNotation(position);

        expect(consoleWarnSpy).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
        Object.defineProperty(process.env, 'NODE_ENV', {
          value: originalEnv,
          configurable: true,
        });
      });
    });
  });

  describe('generateNotationString', () => {
    describe('basic case tests', () => {
      it('should return empty string for empty array', () => {
        const history: readonly string[] = [];
        expect(generateNotationString(history)).toBe('');
      });

      it('should return single notation for array with one move', () => {
        const history: readonly string[] = ['e6'];
        expect(generateNotationString(history)).toBe('e6');
      });

      it('should concatenate multiple moves without separator', () => {
        const history: readonly string[] = ['e6', 'f6', 'f5'];
        expect(generateNotationString(history)).toBe('e6f6f5');
      });

      it('should handle longer sequence correctly', () => {
        const history: readonly string[] = ['e6', 'f6', 'f5', 'd6'];
        expect(generateNotationString(history)).toBe('e6f6f5d6');
      });
    });

    describe('edge case tests', () => {
      it('should handle long history (60+ moves) correctly', () => {
        // Generate 64 moves (full board)
        const moves: string[] = [];
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            moves.push(columns[i] + rows[j]);
          }
        }

        const history: readonly string[] = moves;
        const result = generateNotationString(history);

        // Verify length: 64 moves * 2 characters = 128 characters
        expect(result).toHaveLength(128);
        // Verify it starts correctly
        expect(result.startsWith('a1a2a3a4a5a6a7a8')).toBe(true);
        // Verify it ends correctly
        expect(result.endsWith('h1h2h3h4h5h6h7h8')).toBe(true);
      });

      it('should not modify the input array (immutability)', () => {
        const history: readonly string[] = ['e6', 'f6', 'f5'];
        const originalLength = history.length;
        const originalFirst = history[0];
        const originalLast = history[history.length - 1];

        generateNotationString(history);

        // Verify input array is unchanged
        expect(history).toHaveLength(originalLength);
        expect(history[0]).toBe(originalFirst);
        expect(history[history.length - 1]).toBe(originalLast);
      });
    });

    describe('pure function tests', () => {
      it('should return the same output for the same input', () => {
        const history: readonly string[] = ['e6', 'f6', 'f5'];
        const result1 = generateNotationString(history);
        const result2 = generateNotationString(history);
        const result3 = generateNotationString(history);

        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
      });

      it('should have no side effects', () => {
        const history: readonly string[] = ['e6', 'f6'];
        const copyBefore = [...history];

        generateNotationString(history);

        // Verify no side effects by comparing with original
        expect(history).toEqual(copyBefore);
      });
    });

    describe('type safety tests', () => {
      it('should accept readonly array', () => {
        const history: readonly string[] = ['e6', 'f6'];
        const result: string = generateNotationString(history);
        expect(typeof result).toBe('string');
      });

      it('should return string type', () => {
        const history: readonly string[] = ['e6'];
        const result = generateNotationString(history);
        expect(typeof result).toBe('string');
      });

      it('should compile without TypeScript errors', () => {
        const history: readonly string[] = ['a1', 'b2', 'c3'];
        const notation: string = generateNotationString(history);
        expect(notation).toBe('a1b2c3');
      });
    });

    describe('performance tests', () => {
      it('should generate 60-move notation string in less than 1ms', () => {
        // Generate realistic 60-move game history
        const moves: string[] = [];
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

        // Create 60 moves (typical full game)
        for (let i = 0; i < 60; i++) {
          const col = columns[i % 8];
          const row = rows[Math.floor(i / 8) % 8];
          moves.push(col + row);
        }

        const history: readonly string[] = moves;

        // Measure performance
        const startTime = performance.now();
        const result = generateNotationString(history);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Verify correctness
        expect(result).toHaveLength(120); // 60 moves * 2 characters
        expect(result.startsWith('a1b1c1')).toBe(true); // First 3 moves: a1, b1, c1

        // Verify performance: should complete in less than 1ms
        expect(duration).toBeLessThan(1);
      });

      it('should handle multiple consecutive calls efficiently', () => {
        // Generate 60-move history
        const moves: string[] = [];
        for (let i = 0; i < 60; i++) {
          moves.push('e6'); // Simple repeated move
        }
        const history: readonly string[] = moves;

        // Measure performance of 100 consecutive calls
        const iterations = 100;
        const startTime = performance.now();

        for (let i = 0; i < iterations; i++) {
          generateNotationString(history);
        }

        const endTime = performance.now();
        const averageDuration = (endTime - startTime) / iterations;

        // Average call should be well under 1ms
        expect(averageDuration).toBeLessThan(1);
      });

      it('should not cause performance degradation with growing history', () => {
        const times: number[] = [];

        // Test with incrementally growing history (10, 20, 30, ... 60 moves)
        for (let moveCount = 10; moveCount <= 60; moveCount += 10) {
          const moves: string[] = Array(moveCount).fill('a1');
          const history: readonly string[] = moves;

          const startTime = performance.now();
          generateNotationString(history);
          const endTime = performance.now();

          times.push(endTime - startTime);
        }

        // All times should be less than 1ms
        times.forEach((time) => {
          expect(time).toBeLessThan(1);
        });

        // Performance should scale linearly (no exponential growth)
        // The last measurement (60 moves) should not be more than 6x the first (10 moves)
        const firstTime = times[0] || 0.001; // Avoid division by zero
        const lastTime = times[times.length - 1] || 0;
        const ratio = lastTime / firstTime;

        expect(ratio).toBeLessThan(10); // Very conservative bound (actual should be much better)
      });
    });
  });
});
