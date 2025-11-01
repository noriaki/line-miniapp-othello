/**
 * E2E Test: AI Negative Value Fix Verification
 *
 * Verifies that the AI can handle negative evaluation values correctly
 * without falling back to random moves when value < 0 (res < 100)
 */

import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

test.describe('AI Negative Value Fix', () => {
  test('should complete game without "AI calculation error" when AI has negative evaluation', async ({
    page,
  }) => {
    // リスナーを設定してコンソールエラーを収集
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'warning' &&
        msg.text().includes('AI calculation error')
      ) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for board to be ready
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // Play full game using AI script for moves
    let history = '';
    let moveCount = 0;
    const maxMoves = 60; // Maximum possible moves in Reversi

    while (moveCount < maxMoves) {
      // Get next move from AI script
      let nextMove: string;
      try {
        nextMove = execSync(`node scripts/ai-next-move.js "${history}"`, {
          encoding: 'utf-8',
          cwd: process.cwd(),
        })
          .trim()
          .split(' ')[0]; // Extract just the move (e.g., "f5" from "f5 0 1ms")
      } catch {
        // Game might be over or no valid moves
        console.log(`Game ended after ${moveCount} moves`);
        break;
      }

      if (!nextMove || nextMove === '') {
        break;
      }

      // Click the move
      const cell = page.locator(`#${nextMove}`);
      if (!(await cell.isVisible())) {
        console.log(`Cell ${nextMove} not visible, game likely ended`);
        break;
      }

      await cell.click();
      history += nextMove;
      moveCount++;

      // Wait for AI response (max 5 seconds)
      await page.waitForTimeout(5000);

      // Check if game is over
      const gameOver = await page.getByText(/ゲーム終了|勝利|敗北/).isVisible();
      if (gameOver) {
        console.log(`Game ended after ${moveCount} moves`);
        break;
      }
    }

    // Verify no AI calculation errors occurred
    expect(consoleErrors).toHaveLength(0);

    // Verify game progressed beyond move 56 (where error previously occurred)
    expect(moveCount).toBeGreaterThan(28); // ply 56 = 28 moves per side
  });

  test('should handle policy=63 (position a1) with negative value correctly', async ({
    page,
  }) => {
    // This test verifies the specific case that was failing:
    // When AI returns policy=63 (a1) with negative value
    // The encoded result can be < 100 (e.g., res=98 when value=-2)

    const consoleMessages: Array<{ type: string; text: string }> = [];
    page.on('console', (msg) => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
      });
    });

    await page.goto('/');
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // Play game using the script
    let history = '';
    let resMessages: string[] = [];

    for (let i = 0; i < 30; i++) {
      const nextMove = execSync(`node scripts/ai-next-move.js "${history}"`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      })
        .trim()
        .split(' ')[0];

      if (!nextMove) break;

      const cell = page.locator(`#${nextMove}`);
      if (!(await cell.isVisible())) break;

      await cell.click();
      history += nextMove;
      await page.waitForTimeout(5000);

      // Collect "res" messages from console
      const resMsgs = consoleMessages.filter(
        (m) => m.type === 'log' && m.text.startsWith('res ')
      );
      resMessages = [...resMessages, ...resMsgs.map((m) => m.text)];
    }

    // Verify that even if res < 100, no error occurred
    const lowResMessages = resMessages.filter((msg) => {
      const res = parseInt(msg.replace('res ', ''));
      return res < 100;
    });

    if (lowResMessages.length > 0) {
      console.log(
        `Found ${lowResMessages.length} responses with res < 100:`,
        lowResMessages
      );
      // These should NOT trigger errors anymore
      const errors = consoleMessages.filter(
        (m) =>
          m.type === 'warning' &&
          m.text.includes('AI calculation error') &&
          m.text.includes('Invalid response')
      );
      expect(errors).toHaveLength(0);
    }
  });
});
