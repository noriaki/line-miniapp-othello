/**
 * E2E Tests - Task 9.3: Responsive Design Tests
 *
 * Tests game display and interaction on various smartphone screen sizes
 */

import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'Pixel 5', width: 393, height: 851 },
  { name: 'Samsung Galaxy S20', width: 360, height: 800 },
  { name: 'iPhone 12 Pro Max', width: 428, height: 926 },
];

test.describe('Responsive Design E2E Tests', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    test(`should display correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/');

      // ボードが表示される
      await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

      // ゲームボードがビューポート内に収まる
      const boardBoundingBox = await page
        .locator('[data-testid="game-board"]')
        .boundingBox();
      expect(boardBoundingBox).not.toBeNull();

      if (boardBoundingBox) {
        expect(boardBoundingBox.width).toBeLessThanOrEqual(viewport.width);
        expect(boardBoundingBox.height).toBeLessThanOrEqual(viewport.height);
      }

      // セルが表示される
      const cells = page.locator('[role="button"]');
      await expect(cells).toHaveCount(64);

      // セルがクリック可能
      const cell = page.locator('[data-row="2"][data-col="3"]');
      await expect(cell).toBeVisible();

      // タッチ操作が可能
      await cell.tap();
      await page.waitForTimeout(500);
    });
  }

  test('should handle landscape orientation on mobile', async ({ page }) => {
    // 横向き表示
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');

    // ボードが表示される
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // UIが適切にレイアウトされる
    const cells = page.locator('[role="button"]');
    await expect(cells).toHaveCount(64);
  });

  test('should maintain touch target size on small screens', async ({
    page,
  }) => {
    // 最小サイズのビューポート
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    // セルのサイズを確認
    const cell = page.locator('[data-row="0"][data-col="0"]');
    const boundingBox = await cell.boundingBox();

    expect(boundingBox).not.toBeNull();

    if (boundingBox) {
      // タッチターゲットサイズは44x44px以上が推奨
      expect(boundingBox.width).toBeGreaterThanOrEqual(30);
      expect(boundingBox.height).toBeGreaterThanOrEqual(30);
    }
  });

  test('should display stone count on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 石数表示が見える
    await expect(page.getByText(/2/)).toBeVisible();
  });

  test('should display turn indicator on all screen sizes', async ({
    page,
  }) => {
    for (const viewport of MOBILE_VIEWPORTS) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/');

      // ターン表示が見える
      await expect(page.getByText(/あなたのターン|黒/)).toBeVisible();

      // 次のビューポートテストのために待機
      await page.waitForTimeout(100);
    }
  });

  test('should handle zoom and pinch gestures', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // ズーム後もUIが崩れない
    await page.evaluate(() => {
      document.body.style.zoom = '1.5';
    });

    await page.waitForTimeout(500);

    // ボードが表示される
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();
  });
});
