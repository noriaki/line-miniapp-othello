# 実装タスク

## Phase 1: dev3000統合 + MCP Client設定

- [ ] 1. dev3000開発履歴記録システムの統合
  - dev3000をグローバル環境にインストール可能にする
  - package.jsonに`dev:debug`スクリプトを追加し、dev3000を`--servers-only`モードで起動する
  - Next.js開発サーバーとdev3000タイムラインダッシュボードを同時起動する設定を実装する
  - ポート3000（Next.js）とポート3684（dev3000）が正しく起動することを確認する
  - _Requirements: 2.1, 4.1, 4.2_

- [ ] 1.1 MCP Client設定ファイルの作成
  - MCP設定ファイルのスキーマを定義する
  - dev3000 MCP Serverへの接続設定（URL: http://localhost:3684/mcp）を追加する
  - 設定ファイルが正しいJSON形式であることを検証する
  - MCP Serverの接続が正常に確立されることを確認する
  - _Requirements: 3.1, 5.1, 5.2_

- [ ] 1.2 基本ドキュメントの作成
  - README.mdに「Debugging with AI Tools」セクションを追加し、dev3000の概要とクイックスタートコマンドを記載する
  - /docs/DEBUG_SETUP.mdを新規作成し、dev3000のインストール手順、使用方法、MCP統合の説明を含める
  - dev3000のグローバルインストールコマンド（`pnpm install -g dev3000`）を明記する
  - タイムラインダッシュボードのURL（`http://localhost:3684/logs`）へのアクセス方法を説明する
  - Claude Codeがdev3000 MCP Serverにアクセス可能であることを明示する
  - _Requirements: 4.4, 6.1, 6.2, 6.5_

- [ ] 2. dev3000タイムライン記録機能の検証
  - サーバーログ（Next.js Dev Server）がタイムラインに記録されることを確認する
  - ブラウザコンソールメッセージがタイムラインに記録されることを検証する（Chrome Extension使用時）
  - ネットワークリクエスト/レスポンスがタイムラインに記録されることを検証する
  - タイムラインダッシュボードで全イベントが時系列表示されることを確認する
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 2.1 MCP AIデバッグツールの統合
  - dev3000 MCP Serverが提供する`fix_my_app`ツールが動作することを検証する
  - Claude Codeから`fix_my_app`ツールを実行し、タイムラインデータが正しく取得されることを確認する
  - エラーログ、スクリーンショット、ネットワークリクエストが構造化データとして返されることを検証する
  - Claude Codeがエラーの診断結果と修正提案を提供できることを確認する
  - _Requirements: 3.2, 3.3, 3.4, 3.5_

## Phase 2: Chrome Extension モード + LIFF対応デバッグ

- [ ] 3. Chrome Extensionによる軽量ブラウザ監視の実装
  - Chrome Extension モードの動作を検証し、`--servers-only`フラグで起動することを確認する
  - Chrome Extension のインストール手順をドキュメント化する（Developer mode有効化、Extension読み込み）
  - 手動で開いたブラウザセッションのコンソールログがdev3000に送信されることを検証する
  - ネットワークリクエストがChrome Extension経由でタイムラインに記録されることを確認する
  - _Requirements: 2.2, 2.7, 7.1, 7.2, 7.3_

- [ ] 3.1 Playwrightモードの代替実装
  - package.jsonに`dev:debug:playwright`スクリプトを追加し、Playwrightモードで起動可能にする
  - Playwrightモードが自動的にChromeインスタンスを起動することを確認する
  - エラー発生時に自動スクリーンショットが撮影され、タイムラインに記録されることを検証する
  - Playwrightモードのリソース消費（メモリ、CPU）が許容範囲内であることを確認する
  - _Requirements: 2.5, 8.2_

- [ ] 4. LINE LIFF環境のデバッグ対応
  - LINE LIFF環境でのデバッグ戦略をドキュメント化する（Chrome Remote Debugging使用）
  - LIFF Simulatorまたは実機でアプリを起動し、Chrome Remote Debugging（`chrome://inspect`）で接続する手順を記載する
  - LIFF SDK初期化ログがタイムラインダッシュボードに記録されることを検証する
  - LINE アプリ内ブラウザではChrome Extensionが動作しないことを明示し、リモートデバッグ手順を案内する
  - _Requirements: 2.7, 6.3, 7.4_

- [ ] 4.1 ドキュメントの拡張とトラブルシューティング
  - /docs/DEBUG_SETUP.mdにChrome Extension Setupセクションを追加する
  - トラブルシューティングセクションを追加し、ポート競合、MCP接続失敗の解決策を記載する
  - 使い分け戦略を明確化する（通常開発は`pnpm dev`、デバッグ時は`pnpm dev:debug`）
  - dev3000の起動確認方法（`http://localhost:3684/health`へのアクセス）を説明する
  - _Requirements: 4.3, 4.4, 6.1, 6.4_

## Phase 3: Next.js 16 アップグレード + Next.js Devtools MCP統合（Optional、後回し）

- [ ] 5. Next.js 16へのアップグレード（Phase 3、実装は後回し）
  - `npx @next/codemod@canary upgrade latest`を実行し、Next.js 16にアップグレードする
  - Async Request APIs完全削除への対応を実施する
  - Turbopackデフォルト化への対応、または`--webpack`フラグで明示的にWebpackを指定する
  - 既存テスト（Jest、Playwright）がすべて通ることを確認する
  - _Requirements: 1.5_

- [ ] 5.1 Next.js Devtools MCP Serverの統合（Phase 3、実装は後回し）
  - MCP Client設定（claude_desktop_config.json）にNext.js Devtools MCP Serverのエントリを追加する
  - `nextjs_docs`ツールが動作し、Next.js 16公式ドキュメントを検索可能であることを検証する
  - `browser_eval`ツールでPlaywright APIコードが実行可能であることを確認する
  - `nextjs_runtime`ツールでNext.js内部状態（ルーティング、エラー）が取得可能であることを検証する（Next.js 16+で有効）
  - Static ExportモードではServer Actions監視が利用不可であることをドキュメントで明示する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

## テスト・検証タスク

- [ ] 6. 統合テストとE2Eフローの検証
  - `pnpm dev:debug`実行後、Next.js Dev ServerとTimeline Dashboardが正常起動することを確認する
  - Claude CodeでMCP Server接続が確立され、利用可能なツールがリストアップされることを検証する
  - 意図的にエラーを発生させ、Timeline Dashboardでエラーログが記録されることを確認する
  - Claude Codeから「fix my app」とプロンプトし、AIが診断結果を返すことを検証する
  - E2Eテスト失敗時のスクリーンショットとログがタイムラインに記録されることを確認する
  - _Requirements: 2.5, 3.2, 5.2, 6.3_

- [ ] 6.1 パフォーマンス監視とメトリクス測定
  - dev3000なし/ありでNext.js Dev Serverのレスポンスタイムを測定し、オーバーヘッドが10%以内であることを確認する
  - Timeline Dashboardの初期表示時間を測定し、1000件イベント記録時でも3秒以内であることを検証する
  - `fix_my_app`ツールの応答時間を測定し、1秒以内であることを確認する
  - dev3000のメモリ使用量が許容範囲内（Chrome Extension: < 100MB、Playwright: < 2GB）であることを検証する
  - _Requirements: 8.1, 8.3, 8.4, 8.5_

- [ ] 6.2 エラーハンドリングとセキュリティ検証
  - ポート競合（3000、3684）発生時に適切なエラーメッセージが表示されることを確認する
  - dev3000未インストール時に明確なインストール手順が表示されることを検証する
  - MCP設定ファイル不正時にJSON構文エラーが検出されることを確認する
  - Timeline ログが`/tmp/dev3000-logs/`に保存され、セッション終了時に自動削除されることを検証する
  - MCP Serverがlocalhostのみバインドされ、外部ネットワークからアクセス不可であることを確認する
  - _Requirements: 4.5, 5.5_

## ドキュメント最終化

- [ ] 7. プロジェクトドキュメントの完成
  - README.mdの「Debugging with AI Tools」セクションを最終レビューし、クイックスタートが明確であることを確認する
  - /docs/DEBUG_SETUP.mdのすべてのセクション（Installation、Usage、Chrome Extension Setup、MCP Integration）が完全であることを検証する
  - トラブルシューティングセクションによくある問題と解決策が網羅されていることを確認する
  - Phase 3（Next.js 16 + Next.js Devtools MCP）がOptionalであり、Phase 1-2のみで完結することを明示する
  - _Requirements: 6.1, 6.2, 6.4, 6.5_
