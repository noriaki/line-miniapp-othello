/**
 * Unit tests for Cell ID generation
 * Task 1: ID生成ロジックの実装と単体テスト
 *
 * Requirements: 1.2, 1.3, 1.4, 1.5, 1.6
 *
 * Tests the generateCellId function which converts board indices to
 * chess notation format IDs for HTML elements.
 *
 * Important: This codebase uses the following mapping:
 *   - colIndex (0-7) → column letter (a-h) (horizontal, left→right)
 *   - rowIndex (0-7) → row number (1-8) (vertical, top→bottom)
 * This follows standard chess notation where columns are horizontal (a-h) and rows are vertical (1-8)
 */

import { generateCellId } from '../cell-id';

describe('generateCellId', () => {
  describe('境界値テスト - Boundary value tests', () => {
    test('should generate "a1" for top-left corner (rowIndex=0, colIndex=0)', () => {
      // Requirement 1.3: 左上隅セルに`id="a1"`
      const cellId = generateCellId(0, 0);
      expect(cellId).toBe('a1');
    });

    test('should generate "h8" for bottom-right corner (rowIndex=7, colIndex=7)', () => {
      // Requirement 1.4: 右下隅セルに`id="h8"`
      const cellId = generateCellId(7, 7);
      expect(cellId).toBe('h8');
    });

    test('should generate "h1" for top-right corner (rowIndex=0, colIndex=7)', () => {
      const cellId = generateCellId(0, 7);
      expect(cellId).toBe('h1');
    });

    test('should generate "a8" for bottom-left corner (rowIndex=7, colIndex=0)', () => {
      const cellId = generateCellId(7, 0);
      expect(cellId).toBe('a8');
    });
  });

  describe('中間値テスト - Middle value tests', () => {
    test('should generate "d3" for middle cell (rowIndex=2, colIndex=3)', () => {
      // Requirement 1.2: ID形式 `{列文字}{行数字}`
      // colIndex=3 → column 'd' (horizontal position)
      // rowIndex=2 → row '3' (vertical position)
      const cellId = generateCellId(2, 3);
      expect(cellId).toBe('d3');
    });

    test('should generate "f5" for middle cell (rowIndex=4, colIndex=5)', () => {
      const cellId = generateCellId(4, 5);
      expect(cellId).toBe('f5');
    });

    test('should generate "e4" for center cell (rowIndex=3, colIndex=4)', () => {
      const cellId = generateCellId(3, 4);
      expect(cellId).toBe('e4');
    });
  });

  describe('インデックス変換テスト - Index conversion tests', () => {
    test('should convert colIndex (0-7) to column letters (a-h)', () => {
      // Requirement 1.5: 列インデックス0-7をa-h変換
      expect(generateCellId(0, 0)).toBe('a1'); // colIndex 0 → a
      expect(generateCellId(0, 1)).toBe('b1'); // colIndex 1 → b
      expect(generateCellId(0, 2)).toBe('c1'); // colIndex 2 → c
      expect(generateCellId(0, 3)).toBe('d1'); // colIndex 3 → d
      expect(generateCellId(0, 4)).toBe('e1'); // colIndex 4 → e
      expect(generateCellId(0, 5)).toBe('f1'); // colIndex 5 → f
      expect(generateCellId(0, 6)).toBe('g1'); // colIndex 6 → g
      expect(generateCellId(0, 7)).toBe('h1'); // colIndex 7 → h
    });

    test('should convert rowIndex (0-7) to row numbers (1-8)', () => {
      // Requirement 1.6: 行インデックス0-7を1-8変換
      expect(generateCellId(0, 0)).toBe('a1'); // rowIndex 0 → 1
      expect(generateCellId(1, 0)).toBe('a2'); // rowIndex 1 → 2
      expect(generateCellId(2, 0)).toBe('a3'); // rowIndex 2 → 3
      expect(generateCellId(3, 0)).toBe('a4'); // rowIndex 3 → 4
      expect(generateCellId(4, 0)).toBe('a5'); // rowIndex 4 → 5
      expect(generateCellId(5, 0)).toBe('a6'); // rowIndex 5 → 6
      expect(generateCellId(6, 0)).toBe('a7'); // rowIndex 6 → 7
      expect(generateCellId(7, 0)).toBe('a8'); // rowIndex 7 → 8
    });
  });

  describe('全64セルの一意性テスト - All 64 cells uniqueness test', () => {
    test('should generate unique IDs for all 64 cells', () => {
      // Requirement 1.1: 8×8の各セルに一意のid属性を生成
      const ids = new Set<string>();

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cellId = generateCellId(row, col);
          ids.add(cellId);
        }
      }

      // All 64 cells should have unique IDs
      expect(ids.size).toBe(64);
    });

    test('should generate IDs matching expected chess notation for all cells', () => {
      // Generate all 64 IDs and verify they are all valid
      const expectedColumns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const expectedRows = ['1', '2', '3', '4', '5', '6', '7', '8'];

      for (let rowIndex = 0; rowIndex < 8; rowIndex++) {
        for (let colIndex = 0; colIndex < 8; colIndex++) {
          const cellId = generateCellId(rowIndex, colIndex);
          const expectedColumn = expectedColumns[colIndex]; // colIndex → column
          const expectedRow = expectedRows[rowIndex]; // rowIndex → row
          const expectedId = expectedColumn + expectedRow;

          expect(cellId).toBe(expectedId);
        }
      }
    });
  });

  describe('ID形式検証テスト - ID format validation test', () => {
    test('should match regex pattern /^[a-h][1-8]$/ for all generated IDs', () => {
      // Requirement 1.2: ID形式が正規表現`/^[a-h][1-8]$/`に一致
      const pattern = /^[a-h][1-8]$/;

      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cellId = generateCellId(row, col);
          expect(cellId).toMatch(pattern);
        }
      }
    });

    test('should generate ID of exactly 2 characters', () => {
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const cellId = generateCellId(row, col);
          expect(cellId.length).toBe(2);
        }
      }
    });
  });

  describe('既存コードとの整合性テスト - Consistency with existing code', () => {
    test('should match positionToNotation mapping for sample positions', () => {
      // Verify consistency with corrected move-history.ts positionToNotation function
      // positionToNotation({ row: 0, col: 0 }) should return "a1"
      expect(generateCellId(0, 0)).toBe('a1');

      // positionToNotation({ row: 7, col: 7 }) should return "h8"
      expect(generateCellId(7, 7)).toBe('h8');

      // positionToNotation({ row: 2, col: 6 }) should return "g3"
      expect(generateCellId(2, 6)).toBe('g3');

      // Corrected mapping: row=2, col=3 → "d3"
      expect(generateCellId(2, 3)).toBe('d3');
    });
  });
});
