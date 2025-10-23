/**
 * E2E Tests - Task 9.3: WASM Initialization Failure Scenarios
 *
 * Tests error handling when WASM fails to load
 */

import { test, expect } from '@playwright/test';

test.describe('WASM Error Handling E2E Tests', () => {
  test('should display error message when WASM fails to load', async ({
    page,
    context,
  }) => {
    // WASM ファイルのロードをブロックしてエラーをシミュレート
    await context.route('**/ai.js', (route) => route.abort());
    await context.route('**/ai.wasm', (route) => route.abort());

    await page.goto('/');

    // エラーメッセージが表示される
    await expect(
      page.getByText(/エラー|読み込めませんでした|初期化に失敗/)
    ).toBeVisible({ timeout: 10000 });

    // リロードボタンが表示される
    const reloadButton = page.getByText(/リロード|再読み込み|もう一度/);
    await expect(reloadButton).toBeVisible();
  });

  test('should allow user to reload when WASM initialization fails', async ({
    page,
    context,
  }) => {
    // 最初はWASMをブロック
    await context.route('**/ai.js', (route) => route.abort());
    await context.route('**/ai.wasm', (route) => route.abort());

    await page.goto('/');

    // エラーメッセージが表示される
    await expect(page.getByText(/エラー|読み込めませんでした/)).toBeVisible({
      timeout: 10000,
    });

    // ルートをクリアして正常なロードを許可
    await context.unroute('**/ai.js');
    await context.unroute('**/ai.wasm');

    // リロードボタンをクリック
    const reloadButton = page.getByText(/リロード|再読み込み|もう一度/);
    await reloadButton.click();

    // ページがリロードされ、正常にゲームボードが表示される
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should not crash the app when WASM error occurs', async ({
    page,
    context,
  }) => {
    // WASMロードを失敗させる
    await context.route('**/ai.wasm', (route) => route.abort());

    await page.goto('/');

    // アプリがクラッシュせず、エラーUIが表示される
    await expect(page.locator('body')).toBeVisible();
    await expect(page.getByText(/エラー|失敗/)).toBeVisible({ timeout: 10000 });

    // ページ全体がホワイトスクリーンにならない
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('should handle WASM timeout scenario', async ({ page, context }) => {
    // WASMロードを遅延させてタイムアウトをシミュレート
    await context.route('**/ai.wasm', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 15000)); // 15秒遅延
      await route.abort();
    });

    await page.goto('/');

    // タイムアウトエラーメッセージが表示される
    await expect(page.getByText(/タイムアウト|時間切れ|エラー/)).toBeVisible({
      timeout: 20000,
    });
  });
});
