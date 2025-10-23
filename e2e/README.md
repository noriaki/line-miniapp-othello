# E2E Tests - Playwright

このディレクトリには、LINE Reversi Mini Appの End-to-End (E2E) テストが含まれています。

## テスト概要

### Task 9.3: ゲームフロー E2E テスト

- **game-flow.spec.ts**: ゲーム起動から終了までの完全プレイフロー
  - 8×8ボードの表示確認
  - 初期配置（黒2個、白2個）の検証
  - ユーザの手→AI手のターン切り替え
  - 石数のリアルタイム更新
  - 有効手ハイライト表示
  - ゲーム終了と結果表示

- **wasm-error.spec.ts**: WASM初期化失敗シナリオ
  - WASMロード失敗時のエラー表示
  - リロードボタンの動作確認
  - アプリケーションクラッシュの防止
  - タイムアウトエラーのハンドリング

- **responsive.spec.ts**: レスポンシブデザインテスト
  - 各種スマートフォン画面サイズでの表示確認
    - iPhone SE (375x667)
    - iPhone 12 Pro (390x844)
    - Pixel 5 (393x851)
    - Samsung Galaxy S20 (360x800)
    - iPhone 12 Pro Max (428x926)
  - 横向き表示の対応
  - タッチターゲットサイズの検証
  - ズーム・ピンチジェスチャー対応

### Task 9.4: AI対戦 E2E テスト

- **ai-game.spec.ts**: AI対戦の完全フロー
  - ゲーム起動からAI対戦完了までのフロー
  - AI計算中のUI応答性確認
  - ローディングインジケーター表示
  - WASMエラーケース（ロード失敗、タイムアウト）
  - メモリリーク検証（5ターン分）

## テスト実行方法

### すべてのE2Eテストを実行

```bash
pnpm test:e2e
```

### UI モードで実行（デバッグ用）

```bash
pnpm test:e2e:ui
```

### ブラウザを表示して実行

```bash
pnpm test:e2e:headed
```

### Chromium のみで実行

```bash
pnpm test:e2e:chromium
```

### モバイルブラウザのみで実行

```bash
pnpm test:e2e:mobile
```

## テスト環境

- **ベースURL**: http://localhost:3000
- **テストブラウザ**:
  - Desktop Chrome (Chromium)
  - Mobile Chrome (Pixel 5)
  - Mobile Safari (iPhone 12)
- **Web Server**: Next.js production build (`pnpm build && pnpm start`)

## テスト要件

- Node.js 24.x
- pnpm 9.x
- Playwright 1.56.x

## 注意事項

- E2Eテストは production build を実行するため、初回実行時は時間がかかります
- CI環境では自動的にリトライ（最大2回）が有効になります
- テスト失敗時はスクリーンショットとトレースが保存されます

## カバレッジ

- ゲーム起動から終了までのフルフロー: ✅
- AI対戦機能: ✅
- エラーハンドリング（WASM失敗、タイムアウト）: ✅
- レスポンシブデザイン（5種類のデバイス）: ✅
- UI応答性: ✅
- メモリリーク検証: ✅ (簡易版、5ターン)

## 対象外項目

- 連続プレイでのメモリリーク検証（10ゲーム連続）: 対象外
- クロスブラウザテスト（Firefox, Safari デスクトップ）: 対象外
- CI/CDパイプラインでのヘッドレスブラウザ自動実行: 対象外

これらは将来的な拡張として考慮可能です。
