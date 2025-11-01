/**
 * Cell ID generation utilities for HTML element IDs
 * Converts board indices to chess notation format ([a-h][1-8])
 *
 * This module provides functions to generate unique IDs for board cells
 * that match the chess notation format used in move history.
 *
 * Important: This codebase uses the following mapping:
 *   - rowIndex (0-7) → column letter (a-h)
 *   - colIndex (0-7) → row number (1-8)
 *
 * This matches the existing positionToNotation function in move-history.ts
 */

/**
 * Generates a unique ID for a board cell in chess notation format
 *
 * @param rowIndex - Row index (0-7) which maps to column letters (a-h)
 * @param colIndex - Column index (0-7) which maps to row numbers (1-8)
 * @returns Chess notation ID (e.g., "a1", "c4", "h8")
 *
 * @example
 * generateCellId(0, 0) // returns "a1" (top-left corner)
 * generateCellId(7, 7) // returns "h8" (bottom-right corner)
 * generateCellId(2, 3) // returns "c4" (middle cell)
 *
 * @preconditions
 * - rowIndex is an integer in the range [0, 7]
 * - colIndex is an integer in the range [0, 7]
 *
 * @postconditions
 * - Returns a string matching the pattern /^[a-h][1-8]$/
 * - Same input always produces same output (idempotent)
 *
 * @invariants
 * - board[0][0] → "a1"
 * - board[7][7] → "h8"
 */
export function generateCellId(rowIndex: number, colIndex: number): string {
  // Convert rowIndex (0-7) to column letter (a-h)
  // Using ASCII: 'a' is 97, so 97 + rowIndex gives us the correct letter
  const column = String.fromCharCode(97 + rowIndex);

  // Convert colIndex (0-7) to row number (1-8)
  // Simply add 1 to shift from 0-based to 1-based indexing
  const row = colIndex + 1;

  // Combine column letter and row number to form the cell ID
  return `${column}${row}`;
}
