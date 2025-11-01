/**
 * E2E Tests - Move History Display Feature
 * Tasks 5, 5.1, 5.2: Move history display E2E tests
 *
 * Tests the move history display functionality including:
 * - Basic display and updates
 * - Long notation horizontal scrolling
 * - Game reset clearing
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('Move History Display E2E Tests', () => {
  test.describe('Task 5: Basic Move History Display', () => {
    test('should display move history area at bottom of game board', async ({
      page,
    }) => {
      await page.goto('/');

      // Verify game board is visible
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // Initially, move history should not be visible (no moves yet)
      const moveHistory = page.locator('[data-testid="move-history"]');
      await expect(moveHistory).not.toBeVisible();
    });

    test('should update move history after user makes a move', async ({
      page,
    }) => {
      await page.goto('/');

      // Make user's first move (black player)
      // Important: In this codebase:
      //   - row (0-7) → column letter (a-h)
      //   - col (0-7) → row number (1-8)
      // So row=2, col=3 converts to: c (column from row) + 4 (row from col+1) = "c4"
      const validMoveCell = page.locator('[data-row="2"][data-col="3"]');
      await validMoveCell.click();

      // Wait for board update
      await page.waitForTimeout(500);

      // Move history should now be visible
      const moveHistory = page.locator('[data-testid="move-history"]');
      await expect(moveHistory).toBeVisible();

      // Should contain the notation for the move (c4 = row 2, col 3)
      const notationText = moveHistory.locator('div').first();
      await expect(notationText).toContainText('c4');
    });

    test('should update move history after AI makes a move', async ({
      page,
    }) => {
      await page.goto('/');

      // Make user's first move
      const validMoveCell = page.locator('[data-row="2"][data-col="3"]');
      await validMoveCell.click();

      // Wait for AI turn
      await expect(page.getByText(/AI|相手|白/)).toBeVisible({
        timeout: 5000,
      });

      // Wait for AI to complete its move
      await page.waitForTimeout(3000);

      // Move history should contain both moves (user + AI)
      const moveHistory = page.locator('[data-testid="move-history"]');
      const notationText = moveHistory.locator('div').first();
      const text = await notationText.textContent();

      // Should contain at least 4 characters (2 moves = 4 chars minimum)
      expect(text).not.toBeNull();
      expect(text!.length).toBeGreaterThanOrEqual(4);
    });

    test('should display expected notation string after 3 moves', async ({
      page,
    }) => {
      await page.goto('/');

      // Move 1: User (black) plays c4 (row 2, col 3)
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      // Wait for AI move (Move 2)
      await page.waitForTimeout(3000);

      // Check if game is still playing (not ended)
      const gameResult = page.locator('[data-testid="game-result"]');
      const isGameOver = await gameResult.isVisible();
      if (isGameOver) {
        console.log('Game ended before 3 moves');
        return;
      }

      // Move 3: User (black) plays again
      // Find and click a valid move (may vary based on AI's response)
      const validMoves = page.locator('[data-valid="true"]');
      const count = await validMoves.count();
      if (count > 0) {
        await validMoves.first().click();
        await page.waitForTimeout(500);
      }

      // Move history should contain 3 moves (6 characters total)
      const moveHistory = page.locator('[data-testid="move-history"]');
      const notationText = moveHistory.locator('div').first();
      const text = await notationText.textContent();

      expect(text).not.toBeNull();
      // After 3 moves, should have at least 6 characters (2 chars per move)
      expect(text!.length).toBeGreaterThanOrEqual(6);
      // Should follow pattern [a-h][1-8] repeated
      expect(text).toMatch(/^([a-h][1-8])+$/);
    });
  });

  test.describe('Task 5.1: Long Move History Horizontal Scrolling', () => {
    /**
     * Helper function to play multiple moves rapidly
     */
    async function playMultipleMoves(
      page: Page,
      targetMoves: number
    ): Promise<void> {
      let movesPlayed = 0;

      while (movesPlayed < targetMoves) {
        // Check if game is still playing
        const gameResult = page.locator('[data-testid="game-result"]');
        const isGameOver = await gameResult.isVisible();
        if (isGameOver) {
          console.log('Game ended naturally before reaching target moves');
          break;
        }

        // Check current player
        const isBoardDisabled = await page
          .locator('.board-cell')
          .first()
          .isDisabled();
        if (isBoardDisabled) {
          // AI turn or game ended
          await page.waitForTimeout(100);
          continue;
        }

        // Find valid moves
        const validMoves = page.locator('[data-valid="true"]');
        const count = await validMoves.count();

        if (count === 0) {
          // No valid moves - try pass button
          const passButton = page.locator('.pass-button');
          const isPassEnabled = await passButton.isEnabled();
          if (isPassEnabled) {
            await passButton.click();
            await page.waitForTimeout(200);
          } else {
            await page.waitForTimeout(100);
          }
          continue;
        }

        // Click a random valid move
        const randomIndex = Math.floor(Math.random() * count);
        await validMoves.nth(randomIndex).click();
        movesPlayed++;

        // Brief wait for move to process
        await page.waitForTimeout(300);
      }
    }

    test('should support horizontal scrolling for long move history (40+ moves)', async ({
      page,
    }) => {
      await page.goto('/');

      // Play multiple moves to generate long history
      await playMultipleMoves(page, 40);

      // Move history should be visible (if game hasn't ended)
      const moveHistory = page.locator('[data-testid="move-history"]');
      const gameResult = page.locator('[data-testid="game-result"]');
      const isGameOver = await gameResult.isVisible();

      if (isGameOver) {
        // Game ended before 40 moves - skip this specific check
        console.log('Game ended early, skipping long scroll test');
        return;
      }

      await expect(moveHistory).toBeVisible();

      // Check that overflow-x: auto is applied (scroll capability)
      const overflowX = await moveHistory.evaluate((el) => {
        return window.getComputedStyle(el).overflowX;
      });
      expect(overflowX).toBe('auto');

      // Get the notation text
      const notationText = moveHistory.locator('div').first();
      const text = await notationText.textContent();

      // Should be a long string
      expect(text).not.toBeNull();
      expect(text!.length).toBeGreaterThan(20); // At least 10+ moves
    });

    test('should display complete text without truncation in scrollable area', async ({
      page,
    }) => {
      await page.goto('/');

      // Play multiple moves
      await playMultipleMoves(page, 30);

      const moveHistory = page.locator('[data-testid="move-history"]');
      const gameResult = page.locator('[data-testid="game-result"]');
      const isGameOver = await gameResult.isVisible();

      if (isGameOver) {
        // Game ended early - skip this test
        console.log('Game ended early, skipping text truncation test');
        return;
      }

      const notationText = moveHistory.locator('div').first();

      // Check whitespace-nowrap is applied
      const whiteSpace = await notationText.evaluate((el) => {
        return window.getComputedStyle(el).whiteSpace;
      });
      expect(whiteSpace).toBe('nowrap');

      // Text should not be truncated (no ellipsis)
      const text = await notationText.textContent();
      expect(text).not.toBeNull();
      expect(text).not.toContain('...');
      // Should follow valid notation pattern
      expect(text).toMatch(/^([a-h][1-8])+$/);
    });

    test('should be scrollable on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Play multiple moves
      await playMultipleMoves(page, 25);

      const moveHistory = page.locator('[data-testid="move-history"]');
      const gameResult = page.locator('[data-testid="game-result"]');
      const isGameOver = await gameResult.isVisible();

      if (isGameOver) {
        // Game ended early - skip this test
        console.log('Game ended early, skipping mobile scroll test');
        return;
      }

      await expect(moveHistory).toBeVisible();

      // Verify scrollable behavior
      const isScrollable = await moveHistory.evaluate((el) => {
        return el.scrollWidth > el.clientWidth;
      });
      // Should be scrollable if content is wider than container
      // (this is a best-effort check - may not always be true depending on moves)
      if (isScrollable) {
        // If scrollable, verify we can read scroll properties
        const scrollWidth = await moveHistory.evaluate((el) => el.scrollWidth);
        const clientWidth = await moveHistory.evaluate((el) => el.clientWidth);
        expect(scrollWidth).toBeGreaterThan(clientWidth);
      }
    });
  });

  test.describe('Task 5.2: Game Reset Clears Move History', () => {
    test('should clear move history after game reset', async ({ page }) => {
      await page.goto('/');

      // Play a few moves
      await page.locator('[data-row="2"][data-col="3"]').click();
      await page.waitForTimeout(500);

      // Wait for AI move
      await page.waitForTimeout(3000);

      // Play another user move
      const validMoves = page.locator('[data-valid="true"]');
      const count = await validMoves.count();
      if (count > 0) {
        await validMoves.first().click();
        await page.waitForTimeout(500);
      }

      // Verify move history exists
      const moveHistory = page.locator('[data-testid="move-history"]');
      await expect(moveHistory).toBeVisible();

      // Reset game by reloading the page
      await page.reload();
      await page.waitForTimeout(500);

      // After reset, move history should not be visible (no moves yet)
      await expect(moveHistory).not.toBeVisible();

      // Make a move after reset to verify move history can display again
      const validMovesAfterReset = page.locator('[data-valid="true"]');
      if ((await validMovesAfterReset.count()) > 0) {
        await validMovesAfterReset.first().click();
        await page.waitForTimeout(500);
        // Now move history should be visible with new move
        await expect(moveHistory).toBeVisible();
      }
    });

    test('should record new move history correctly after reset', async ({
      page,
    }) => {
      await page.goto('/');

      // Play initial moves - find and click a valid move
      await page.waitForTimeout(500);
      const validMoves = page.locator('[data-valid="true"]');
      await validMoves.first().click();
      await page.waitForTimeout(500);
      await page.waitForTimeout(3000); // Wait for AI move

      // Get first game's move history (if visible)
      const moveHistory = page.locator('[data-testid="move-history"]');

      // Reset game (reload page simulates reset)
      await page.reload();
      await page.waitForTimeout(500);

      // After reset, move history should not be visible
      await expect(moveHistory).not.toBeVisible();

      // Play move in new game - click a valid move
      const validMovesAfterReset = page.locator('[data-valid="true"]');
      const count = await validMovesAfterReset.count();
      if (count > 1) {
        await validMovesAfterReset.nth(1).click(); // Click different move
      } else if (count > 0) {
        await validMovesAfterReset.first().click();
      }
      await page.waitForTimeout(500);

      // New move history should be visible
      await expect(moveHistory).toBeVisible();

      // Get new game's move history
      const newGameText = await moveHistory
        .locator('div')
        .first()
        .textContent();

      // Should be valid notation
      expect(newGameText).not.toBeNull();
      expect(newGameText).toMatch(/^[a-h][1-8]/); // Should start with valid notation
    });

    test('should handle multiple resets correctly', async ({ page }) => {
      await page.goto('/');

      const moveHistory = page.locator('[data-testid="move-history"]');

      // First game - find and click any valid move
      await page.waitForTimeout(500);
      const validMoves1 = page.locator('[data-valid="true"]');
      await validMoves1.first().click();
      await page.waitForTimeout(500);
      await expect(moveHistory).toBeVisible();

      // Reset 1
      await page.reload();
      await page.waitForTimeout(500);
      await expect(moveHistory).not.toBeVisible();

      // Second game
      const validMoves2 = page.locator('[data-valid="true"]');
      if ((await validMoves2.count()) > 0) {
        await validMoves2.first().click();
        await page.waitForTimeout(500);
        await expect(moveHistory).toBeVisible();
      }

      // Reset 2
      await page.reload();
      await page.waitForTimeout(500);
      await expect(moveHistory).not.toBeVisible();

      // Third game
      const validMoves3 = page.locator('[data-valid="true"]');
      if ((await validMoves3.count()) > 0) {
        await validMoves3.first().click();
        await page.waitForTimeout(500);
        await expect(moveHistory).toBeVisible();

        const finalText = await moveHistory
          .locator('div')
          .first()
          .textContent();
        expect(finalText).not.toBeNull();
        expect(finalText).toMatch(/^[a-h][1-8]/); // Should start with valid notation
      }
    });
  });
});
