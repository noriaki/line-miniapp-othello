import type { Position } from '../types';
import { positionToNotation } from '../move-history';

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

      it('should convert (2,6) to "c7"', () => {
        const position: Position = { row: 2, col: 6 };
        expect(positionToNotation(position)).toBe('c7');
      });

      it('should convert (3,4) to "d5"', () => {
        const position: Position = { row: 3, col: 4 };
        expect(positionToNotation(position)).toBe('d5');
      });
    });

    describe('full coordinate conversion tests', () => {
      it('should convert all 64 positions correctly', () => {
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

        for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
            const position: Position = { row, col };
            // In this codebase: row -> column letter, col -> row number
            const expected = columns[row] + rows[col];
            expect(positionToNotation(position)).toBe(expected);
          }
        }
      });

      it('should cover all columns a-h', () => {
        const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const col = 0;

        columns.forEach((expectedCol, rowIndex) => {
          const position: Position = { row: rowIndex, col };
          const notation = positionToNotation(position);
          expect(notation[0]).toBe(expectedCol);
        });
      });

      it('should cover all rows 1-8', () => {
        const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];
        const row = 0;

        rows.forEach((expectedRow, colIndex) => {
          const position: Position = { row, col: colIndex };
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
});
