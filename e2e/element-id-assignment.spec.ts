/**
 * E2E Tests - Element ID Assignment Feature
 * Task 4.1: セルIDによるE2E要素選択テスト
 *
 * Tests the ID-based element selection for cells and history:
 * - Cell selection using ID selectors (#a1, #h8, #c4)
 * - Data attribute consistency verification
 * - Game state changes after ID-based clicks
 */

import { test, expect } from '@playwright/test';

test.describe('Element ID Assignment E2E Tests', () => {
  test.describe('Task 4.1: Cell ID-based Element Selection', () => {
    test('should select top-left corner cell using #a1 ID', async ({
      page,
    }) => {
      await page.goto('/');

      // Select cell using ID
      const cellA1 = page.locator('#a1');

      // Verify cell is visible
      await expect(cellA1).toBeVisible();

      // Verify data attributes consistency
      // Important: In this codebase:
      //   - row (0-7) → column letter (a-h)
      //   - col (0-7) → row number (1-8)
      // So cell "a1" should have: row=0 (a), col=0 (1)
      await expect(cellA1).toHaveAttribute('data-row', '0');
      await expect(cellA1).toHaveAttribute('data-col', '0');
    });

    test('should select bottom-right corner cell using #h8 ID', async ({
      page,
    }) => {
      await page.goto('/');

      // Select cell using ID
      const cellH8 = page.locator('#h8');

      // Verify cell is visible
      await expect(cellH8).toBeVisible();

      // Verify data attributes consistency
      // Cell "h8" should have: row=7 (h), col=7 (8)
      await expect(cellH8).toHaveAttribute('data-row', '7');
      await expect(cellH8).toHaveAttribute('data-col', '7');
    });

    test('should click cell using ID and verify game state change', async ({
      page,
    }) => {
      await page.goto('/');

      // Cell c4 (row=2, col=3) is a valid opening move
      const cellC4 = page.locator('#c4');

      // Verify it's a valid move (should have data-valid attribute)
      await expect(cellC4).toHaveAttribute('data-valid', 'true');

      // Click the cell using ID selector
      await cellC4.click();

      // Wait for board update
      await page.waitForTimeout(500);

      // Verify game state changed:
      // 1. Cell should now have a black stone
      await expect(cellC4).toHaveAttribute('data-stone', 'black');

      // 2. Move history should be visible and contain "c4"
      const moveHistory = page.locator('#history');
      await expect(moveHistory).toBeVisible();
      await expect(moveHistory).toContainText('c4');

      // 3. It should no longer be a valid move (stone placed)
      await expect(cellC4).not.toHaveAttribute('data-valid', 'true');
    });

    test('should verify data-row and data-col consistency across multiple cells', async ({
      page,
    }) => {
      await page.goto('/');

      // Test multiple cells to ensure consistent ID-to-data mapping
      const testCases = [
        { id: 'a1', row: '0', col: '0' }, // Top-left
        { id: 'a8', row: '0', col: '7' }, // Bottom-left
        { id: 'h1', row: '7', col: '0' }, // Top-right
        { id: 'h8', row: '7', col: '7' }, // Bottom-right
        { id: 'c4', row: '2', col: '3' }, // Center
        { id: 'd5', row: '3', col: '4' }, // Center
        { id: 'e6', row: '4', col: '5' }, // Center
      ];

      for (const testCase of testCases) {
        const cell = page.locator(`#${testCase.id}`);
        await expect(cell).toBeVisible();
        await expect(cell).toHaveAttribute('data-row', testCase.row);
        await expect(cell).toHaveAttribute('data-col', testCase.col);
      }
    });

    test('should allow E2E tests to reliably select specific cells by ID', async ({
      page,
    }) => {
      await page.goto('/');

      // Verify all 64 cells have unique IDs
      // Columns: a-h (0-7), Rows: 1-8 (0-7)
      const columns = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const rows = ['1', '2', '3', '4', '5', '6', '7', '8'];

      for (const col of columns) {
        for (const row of rows) {
          const cellId = `${col}${row}`;
          const cell = page.locator(`#${cellId}`);

          // Each cell should be uniquely identifiable by its ID
          await expect(cell).toHaveCount(1); // Exactly one element with this ID
        }
      }
    });

    test('should select cells using ID after AI move', async ({ page }) => {
      await page.goto('/');

      // Make first move
      const cellC4 = page.locator('#c4');
      await cellC4.click();
      await page.waitForTimeout(500);

      // Wait for AI move
      await page.waitForTimeout(3000);

      // After AI move, verify we can still select cells by ID
      // Find a cell that is now a valid move (AI's move may change valid cells)
      const validMoves = page.locator('[data-valid="true"]');
      const firstValidMove = validMoves.first();

      // Get the ID of the first valid move
      const validCellId = await firstValidMove.getAttribute('id');
      expect(validCellId).not.toBeNull();
      expect(validCellId).toMatch(/^[a-h][1-8]$/);

      // Verify we can select it using the ID
      const validCell = page.locator(`#${validCellId}`);
      await expect(validCell).toBeVisible();
      await expect(validCell).toHaveAttribute('data-valid', 'true');

      // Click using ID
      await validCell.click();
      await page.waitForTimeout(500);

      // Verify state changed
      await expect(validCell).toHaveAttribute('data-stone', 'black');
    });
  });

  test.describe('Task 4.2: History ID-based Element Selection (Prerequisite)', () => {
    test('should not display history initially (no moves)', async ({
      page,
    }) => {
      await page.goto('/');

      // Initially, history should not be visible
      const history = page.locator('#history');
      await expect(history).not.toBeVisible();
    });

    test('should select history using #history ID after moves', async ({
      page,
    }) => {
      await page.goto('/');

      // Make a move
      const cellC4 = page.locator('#c4');
      await cellC4.click();
      await page.waitForTimeout(500);

      // History should now be visible with ID
      const history = page.locator('#history');
      await expect(history).toBeVisible();

      // Verify it's the same element as data-testid selector
      const historyByTestId = page.locator('[data-testid="move-history"]');
      await expect(historyByTestId).toBeVisible();

      // Both selectors should point to the same element
      const historyCount = await history.count();
      expect(historyCount).toBe(1);
    });
  });
});
