# Implementation Plan

## タスク概要

debug-environment 機能の実装タスクです。dev3000 を統合し、Claude Code (CLI) が MCP 経由でデバッグツールにアクセスできる環境を構築します。

**重要**: 本タスク群はデバッグ環境のセットアップと設定であり、アプリケーションコードの開発ではありません。自動テスト (TDD) は不要で、各タスクは手動での動作確認により検証します。

## 実装タスク

- [ ] 1. dev3000 統合とデバッグコマンド設定
  - dev3000 をグローバルにインストール (`pnpm install -g dev3000`)
  - `package.json` の scripts セクションに `"dev:debug": "dev3000 -p 3030 -s dev"` を追加
  - 既存の `pnpm dev` コマンドが変更されていないことを確認
  - `pnpm dev:debug` を実行し、Next.js 開発サーバーが Port 3030 で起動することを確認
  - _Requirements: 1.1, 3.1, 3.2_

- [ ] 1.1 Playwright モードでのブラウザ自動起動を検証
  - `pnpm dev:debug` 実行時に Playwright が自動的に Chrome を起動することを確認
  - Chrome が自動的に `http://localhost:3030` にアクセスすることを確認
  - Timeline Dashboard (`http://localhost:3684/logs`) にアクセス可能であることを確認
  - コンソールに dev3000 の URL (`http://localhost:3684/logs`) と Next.js の URL (`http://localhost:3030`) が表示されることを確認
  - _Requirements: 1.2, 3.3_

- [ ] 1.2 Timeline Dashboard でのイベント記録を検証
  - Timeline Dashboard (`http://localhost:3684/logs`) にブラウザでアクセス
  - サーバーログ（Next.js Dev Server の stdout/stderr）が Timeline に表示されることを確認
  - ブラウザのコンソールログ（console.log, console.warn, console.error）が Timeline に表示されることを確認
  - ネットワークリクエストが Timeline に記録されることを確認
  - Timeline の時系列表示が正しく動作することを確認
  - _Requirements: 1.1, 1.3_

- [ ] 1.3 自動スクリーンショット機能を検証
  - 意図的にエラーを発生させる（例: 存在しないページに遷移、コンソールエラーを出力）
  - エラー発生時に自動的にスクリーンショットが撮影されることを確認
  - Timeline Dashboard でスクリーンショットがエラーイベントに関連付けられて表示されることを確認
  - スクリーンショットをクリックして拡大表示できることを確認
  - _Requirements: 1.4_

- [ ] 1.4 WebAssembly (Egaroucid) モジュールの記録を検証
  - dev3000 起動中にリバーシゲームをプレイし、AI の手番を発生させる
  - WASM モジュール実行時のコンソールメッセージが Timeline に記録されることを確認
  - Timeline Dashboard で WASM 関連のログをフィルタリングできることを確認
  - _Requirements: 1.6_

- [ ] 2. MCP サーバー統合と自動設定
  - `pnpm dev:debug` を実行し、dev3000 が起動することを確認
  - プロジェクトルートに `.mcp.json` が自動生成されることを確認
  - `.mcp.json` の内容に `"dev3000"` エントリが含まれることを確認（`http://localhost:3684/mcp`）
  - dev3000 起動時のコンソール出力に MCP Server の起動メッセージが含まれることを確認
  - _Requirements: 2.1, 4.1_

- [ ] 2.1 Claude Code (CLI) から MCP サーバーへの接続を検証
  - Claude Code (CLI) をプロジェクトディレクトリで起動
  - Claude Code が `.mcp.json` を自動読み込みし、dev3000 MCP Server に接続することを確認
  - Claude Code の UI で MCP サーバーの接続ステータスが "Connected" と表示されることを確認
  - dev3000 を停止し、Claude Code で接続エラーメッセージが表示されることを確認（エラーメッセージに診断情報が含まれることを確認）
  - _Requirements: 2.1, 4.2, 4.3_

- [ ] 2.2 `fix_my_app` ツールによる問題診断を検証
  - 意図的にエラーを発生させる（例: 存在しない関数を呼び出す、型エラーを発生させる）
  - Timeline にエラーが記録されることを確認
  - Claude Code (CLI) で "fix my app" または類似のプロンプトを入力
  - dev3000 MCP Server が Timeline データ（ログ、エラー、スクリーンショット）を返すことを確認
  - Claude Code が問題の診断結果を提示すること（エラーの場所、原因、修正提案）を確認
  - _Requirements: 2.2, 2.5_

- [ ] 2.3 `execute_browser_action` ツールによるブラウザ操作を検証
  - Claude Code (CLI) で "ブラウザで〇〇をクリック" または類似のプロンプトを入力
  - dev3000 MCP Server がブラウザアクション（クリック、入力、ナビゲーション）を実行することを確認
  - Timeline にブラウザアクションが記録されることを確認
  - 操作後のスクリーンショットが Timeline に保存されることを確認
  - _Requirements: 2.3_

- [ ] 2.4 ネットワークリクエスト詳細の記録を検証
  - アプリケーションで API リクエストまたは外部リソースの読み込みを発生させる
  - Timeline Dashboard でネットワークリクエストの詳細（URL、メソッド、ステータスコード、レスポンスヘッダー）が表示されることを確認
  - Claude Code (CLI) でネットワークリクエストの詳細を問い合わせ、MCP Server が適切なデータを返すことを確認
  - _Requirements: 2.4_

- [ ] 3. ドキュメント作成: DEBUG_SETUP.md
  - `/docs/DEBUG_SETUP.md` を新規作成
  - 以下のセクションを含める:
    - **Introduction**: dev3000 の概要と利点（サーバー＋ブラウザ統合記録、AI デバッグ支援、Timeline 可視化）
    - **Installation**: `pnpm install -g dev3000` のインストール手順
    - **Usage**: `pnpm dev:debug` コマンドの使い方、Timeline Dashboard へのアクセス方法
    - **MCP Integration**: `.mcp.json` が自動生成されること、Claude Code (CLI) から自動接続可能であることの説明
    - **Use Cases**: ブラウザイベント追跡、WASM デバッグ、E2E テスト失敗調査などのユースケース別ガイド
    - **Troubleshooting**: よくある問題（ポート競合、MCP 接続失敗、Playwright Chrome 起動失敗）と解決策
  - ドキュメント内で Claude Code (CLI) のみを対象とし、他のツール（IDE 統合、GUI MCP クライアント）への参照を含まないことを確認
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

- [ ] 3.1 ドキュメント作成: README.md 更新
  - README.md に新規セクション "## Debugging with AI Tools" を追加
  - セクションの内容:
    - 概要（2-3 行）: dev3000 を使った AI 支援デバッグ環境の説明
    - クイックスタート: `pnpm dev:debug` コマンドの紹介
    - 詳細ガイドへのリンク: `/docs/DEBUG_SETUP.md` への参照
  - セクションを適切な位置（Development または Usage セクション付近）に挿入
  - 既存の README.md の構成を維持し、他のセクションに影響を与えないことを確認
  - _Requirements: 3.4, 5.1_

- [ ] 3.2 ドキュメント内容の検証: 開発ワークフローの説明
  - `/docs/DEBUG_SETUP.md` に通常開発 (`pnpm dev`) とデバッグモード (`pnpm dev:debug`) の違いを明確に説明
  - 通常開発: Next.js Dev Server のみ起動、軽量で高速
  - デバッグモード: dev3000 + Playwright Chrome + Timeline Dashboard + MCP Server、包括的な監視とデバッグ
  - いつデバッグモードを使うべきか（複雑な問題のトラブルシューティング、E2E テスト失敗調査など）のガイダンスを含める
  - _Requirements: 3.4, 5.5_

- [ ] 4. 統合検証: エンドツーエンドシナリオ
  - `pnpm dev:debug` でデバッグ環境を起動
  - 以下の統合シナリオを手動で実行し、すべてが正常に動作することを確認:
    1. Timeline Dashboard でリアルタイムイベント記録を確認
    2. 意図的なエラーを発生させ、スクリーンショットが自動撮影されることを確認
    3. Claude Code (CLI) で "fix my app" を実行し、問題診断結果を取得
    4. Claude Code (CLI) でブラウザアクションを実行（クリック、ナビゲーション）
    5. WASM モジュール（リバーシ AI）実行時のログが記録されることを確認
  - 各シナリオで期待通りの動作が確認できることを検証
  - _Requirements: All requirements (統合検証)_

- [ ] 4.1 品質検証: 既存ワークフローへの影響確認
  - `pnpm dev` を実行し、通常の Next.js 開発サーバーが正常に起動することを確認（dev3000 は起動しない）
  - `pnpm test` を実行し、既存のテストスイートが正常に pass することを確認
  - `pnpm test:e2e` を実行し、E2E テストが正常に動作することを確認（dev3000 との干渉がないことを確認）
  - `pnpm build` を実行し、本番ビルドが成功することを確認
  - _Requirements: 3.1, 5.1 (既存ワークフローの保持)_

- [ ] 4.2 エラーハンドリングとトラブルシューティング検証
  - Port 3030 または 3684 を意図的に占有し、`pnpm dev:debug` 実行時に適切なエラーメッセージが表示されることを確認
  - dev3000 が未インストールの状態で `pnpm dev:debug` を実行し、明確なエラーメッセージ（インストール手順を含む）が表示されることを確認
  - `/docs/DEBUG_SETUP.md` の Troubleshooting セクションに記載された解決策が実際に有効であることを確認
  - _Requirements: 5.4 (トラブルシューティング)_

- [ ] 5. 最終検証と要件カバレッジ確認
  - 全 Acceptance Criteria（要件 1.1-5.6）が満たされていることを確認
  - 各要件に対応するタスクが完了していることを確認
  - ドキュメント（README.md, /docs/DEBUG_SETUP.md）が正確で完全であることを確認
  - dev3000 統合が既存の開発ワークフローに影響を与えていないことを最終確認
  - _Requirements: All requirements (最終確認)_

## 検証方法の注意事項

本タスク群は**設定とセットアップ**が中心のため、以下の点に注意してください:

- **自動テスト (TDD) は不要**: ユニットテストや統合テストの作成は求められません
- **手動検証が中心**: 各タスクの完了基準は「手動で動作確認できること」です
- **実際に使ってみる**: Timeline Dashboard へのアクセス、Claude Code との対話、エラー再現など、実際にツールを使用して確認します
- **ドキュメントの正確性**: ドキュメントに記載された手順が実際に動作することを確認します
- **既存機能への影響なし**: `pnpm dev`、`pnpm test`、`pnpm build` などの既存コマンドが正常に動作することを確認します
