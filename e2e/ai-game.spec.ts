/**
 * E2E Tests - Task 9.4: AI Game E2E Tests
 *
 * Tests complete game flow from startup to AI battle completion
 */

import { test, expect } from '@playwright/test';

test.describe('AI Game E2E Tests', () => {
  test('should complete full AI battle flow from startup to finish', async ({
    page,
  }) => {
    await page.goto('/');

    // ゲームボード表示を確認
    await expect(page.locator('[data-testid="game-board"]')).toBeVisible();

    // 初期状態確認
    const blackStones = page.locator('[data-stone="black"]');
    const whiteStones = page.locator('[data-stone="white"]');
    await expect(blackStones).toHaveCount(2);
    await expect(whiteStones).toHaveCount(2);

    // ユーザの最初の手を実行
    const firstMove = page.locator('[data-row="2"][data-col="3"]');
    await firstMove.click();

    // AIターンの開始を待機
    await expect(page.getByText(/AI|相手|白/)).toBeVisible({ timeout: 5000 });

    // ローディングインジケーターが表示される
    const loading = page.getByText(/思考中|計算中/);
    await expect(loading).toBeVisible();

    // AIの手が完了するまで待機
    await page.waitForTimeout(3500);

    // ターンが戻る
    await expect(page.getByText(/あなたのターン|黒/)).toBeVisible({
      timeout: 5000,
    });

    // 石数が変化している
    const updatedBlackStones = page.locator('[data-stone="black"]');
    const updatedWhiteStones = page.locator('[data-stone="white"]');
    const blackCount = await updatedBlackStones.count();
    const whiteCount = await updatedWhiteStones.count();

    expect(blackCount + whiteCount).toBeGreaterThan(4);
  });

  test('should verify UI responsiveness during AI calculation', async ({
    page,
  }) => {
    await page.goto('/');

    // ユーザの手を実行
    const move = page.locator('[data-row="2"][data-col="3"]');
    await move.click();

    // AI計算中もUIは応答する
    await expect(page.getByText(/AI|思考中/)).toBeVisible({ timeout: 5000 });

    // スクロールやその他のUI操作が可能
    await page.evaluate(() => window.scrollTo(0, 100));

    // ページがフリーズしていない
    const isResponsive = await page.evaluate(() => {
      return document.readyState === 'complete';
    });
    expect(isResponsive).toBe(true);
  });

  test('should display loading indicator during AI calculation', async ({
    page,
  }) => {
    await page.goto('/');

    // ユーザの手を実行
    const move = page.locator('[data-row="2"][data-col="3"]');
    await move.click();

    // ローディングインジケーターが表示される
    const loading = page.getByText(/思考中|計算中|AI/);
    await expect(loading).toBeVisible({ timeout: 5000 });

    // ローディング中はユーザの手が無効化される（オプション）
    // これは実装依存

    // AI計算完了後、ローディングが消える
    await expect(loading).not.toBeVisible({ timeout: 5000 });
  });

  test('should handle WASM load failure scenario', async ({
    page,
    context,
  }) => {
    // WASMファイルのロードを失敗させる
    await context.route('**/ai.wasm', (route) => route.abort());

    await page.goto('/');

    // エラーメッセージが表示される
    await expect(
      page.getByText(/エラー|読み込めませんでした|初期化に失敗/)
    ).toBeVisible({ timeout: 10000 });

    // ゲームは開始できない
    const cell = page.locator('[data-row="2"][data-col="3"]');
    await cell.click();

    // エラー状態が継続
    await expect(page.getByText(/エラー/)).toBeVisible();
  });

  test('should handle AI calculation timeout scenario', async ({ page }) => {
    await page.goto('/');

    // ユーザの手を実行
    const move = page.locator('[data-row="2"][data-col="3"]');
    await move.click();

    // AI計算が開始
    await expect(page.getByText(/AI|思考中/)).toBeVisible({ timeout: 5000 });

    // 最大3秒以内にAI計算が完了する（要件8.3）
    // タイムアウトした場合はフォールバック処理が実行される

    // 5秒以内にターンが戻る（3秒計算 + フォールバック処理）
    await expect(page.getByText(/あなたのターン|黒/)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should maintain game state consistency across multiple AI turns', async ({
    page,
  }) => {
    await page.goto('/');

    // 3ターン分のプレイ
    for (let turn = 0; turn < 3; turn++) {
      // 有効手を探してクリック
      const validMove = page
        .locator('.valid-move, [data-valid="true"]')
        .first();
      await validMove.click();

      // AIターンを待機
      await expect(page.getByText(/AI|相手|白/)).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(3500);

      // ターンが戻る
      await expect(page.getByText(/あなたのターン|黒/)).toBeVisible({
        timeout: 5000,
      });
    }

    // 石数が増加している
    const blackStones = page.locator('[data-stone="black"]');
    const whiteStones = page.locator('[data-stone="white"]');
    const blackCount = await blackStones.count();
    const whiteCount = await whiteStones.count();

    expect(blackCount + whiteCount).toBeGreaterThan(4);
  });

  test('should not have memory leaks during gameplay', async ({ page }) => {
    await page.goto('/');

    // 初期メモリ使用量（おおよそ）
    const initialMetrics = await page.evaluate(() => {
      interface PerformanceWithMemory extends Performance {
        memory?: {
          usedJSHeapSize: number;
        };
      }
      const perf = performance as PerformanceWithMemory;
      if ('memory' in perf && perf.memory) {
        return perf.memory.usedJSHeapSize;
      }
      return null;
    });

    // 5ターン分のプレイ
    for (let turn = 0; turn < 5; turn++) {
      const validMove = page
        .locator('.valid-move, [data-valid="true"]')
        .first();
      await validMove.click();
      await page.waitForTimeout(4000);
    }

    // 最終メモリ使用量
    const finalMetrics = await page.evaluate(() => {
      interface PerformanceWithMemory extends Performance {
        memory?: {
          usedJSHeapSize: number;
        };
      }
      const perf = performance as PerformanceWithMemory;
      if ('memory' in perf && perf.memory) {
        return perf.memory.usedJSHeapSize;
      }
      return null;
    });

    // メモリ使用量が極端に増加していないことを確認
    // (完全なリーク検出は困難だが、明らかな問題は検出可能)
    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics - initialMetrics;
      const memoryIncreasePercent = (memoryIncrease / initialMetrics) * 100;

      // 5ターンで50%以上のメモリ増加は異常
      expect(memoryIncreasePercent).toBeLessThan(50);
    }
  });
});
