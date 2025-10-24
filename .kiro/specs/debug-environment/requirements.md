# Requirements Document

## Project Description (Input)

LINE Mini App Reversi プロジェクトにおける AI 支援開発を強化するため、2つの補完的なデバッグツールを導入する。

### 導入ツール

1. **Next.js Devtools MCP** (Next.js 16+ 組み込み)
   - Next.js 内部状態への深層アクセスを提供する MCP サーバー
   - App Router のルーティング、Server Actions、キャッシュ、レンダリング詳細を AI が理解可能
   - ビルドエラー、ランタイムエラー、型エラーの構造化された取得
   - ページメタデータ、プロジェクト構造の自動クエリ
   - Next.js ドキュメント、ベストプラクティス、マイグレーションツールへのアクセス

2. **dev3000** (vercel-labs/dev3000)
   - フレームワーク非依存の包括的開発履歴記録ツール
   - サーバーログ、ブラウザイベント、コンソールメッセージ、ネットワークリクエスト、スクリーンショットを統合タイムラインで記録
   - Chrome DevTools Protocol による非侵襲的なブラウザ監視
   - タイムラインダッシュボード (`http://localhost:3684/logs`) によるリアルタイム可視化
   - MCP サーバー内蔵で AI デバッグツール (`fix_my_app`, `execute_browser_action`) を提供

### 使い分け戦略

**Next.js Devtools MCP を使用する場面:**

- Next.js 特有の問題（ルーティング、Server Actions、キャッシュ）のデバッグ
- サーバーサイドのビルドエラー、型エラーの解決
- Next.js ベストプラクティスの適用とマイグレーション
- プロジェクト構造とコンポーネント階層の理解

**dev3000 を使用する場面:**

- ブラウザイベント、ユーザーインタラクション、UI 状態の可視化
- ネットワークリクエスト/レスポンスの詳細分析
- サーバーとクライアントのイベントを時系列で追跡する複雑なデバッグ
- E2E テスト失敗時のスクリーンショットとログによる状態再現
- WebAssembly (Egaroucid) 統合のブラウザコンソール監視

### 期待される効果

- Claude Code による文脈を持った正確なデバッグ支援
- エラーメッセージやスクリーンショットの手動共有が不要に
- Next.js 内部とブラウザ動作の両面から問題を包括的に診断
- 開発効率の向上と問題解決時間の短縮
- チーム開発における再現困難なバグの共有が容易に

### 技術的制約

- Next.js Devtools MCP は Next.js v16 以上が必要
- dev3000 は Playwright または Chrome Extension でブラウザ監視
- LINE Mini App (LIFF) は LINE アプリ内でのみ完全動作するため、dev3000 使用時は Chrome Extension モード (`--servers-only`) の併用を検討
- 通常開発は既存ワークフロー (`pnpm dev`) を維持し、必要時のみ dev3000 を起動する運用

## Requirements

### Requirement 1: Next.js Devtools MCP 統合 (Phase 3: Optional)

**Note:** この要件は Phase 3（Next.js 16 アップグレード時）で実装されます。Phase 1-2 では dev3000 のみに集中します。

**Objective:** 開発者として、Next.js 内部状態とエラー情報に AI がアクセスできるようにしたい。そうすることで、Claude Code が Next.js 特有の問題を正確に診断し解決策を提案できるようにする。

#### Acceptance Criteria (Requirement 1)

1. WHEN Next.js プロジェクトが開発モードで実行されている THEN Next.js Devtools MCP Server SHALL 自動的に起動し MCP プロトコル経由で接続可能な状態になる
2. WHEN Claude Code が Next.js 内部状態をクエリする THEN Next.js Devtools MCP Server SHALL App Router のルーティング情報、Server Actions、キャッシュ状態、レンダリング詳細を構造化データとして返す
3. WHEN ビルドエラーまたはランタイムエラーが発生する THEN Next.js Devtools MCP Server SHALL エラーの種類、スタックトレース、関連ファイルパス、行番号を含む構造化エラー情報を提供する
4. WHEN Claude Code がプロジェクト構造を問い合わせる THEN Next.js Devtools MCP Server SHALL ページメタデータ、コンポーネント階層、ディレクトリ構造を返す
5. IF Next.js のバージョンが v16 未満である THEN 開発環境セットアップ SHALL Next.js を v16 以上にアップグレードする手順を実行する
6. WHEN Next.js ベストプラクティスまたはマイグレーション情報が必要になる THEN Next.js Devtools MCP Server SHALL 関連する公式ドキュメントとガイドラインへのアクセスを提供する

### Requirement 2: dev3000 開発履歴記録システム

**Objective:** 開発者として、サーバーとブラウザの全イベントを統合タイムラインで記録したい。そうすることで、複雑な問題やテスト失敗時の状態を正確に再現し診断できるようにする。

#### Acceptance Criteria (Requirement 2)

1. WHEN 開発者が dev3000 を起動する THEN dev3000 System SHALL サーバーログ、ブラウザイベント、コンソールメッセージ、ネットワークリクエストを統合タイムラインとして記録開始する
2. WHEN ブラウザで開発サーバーにアクセスする THEN dev3000 System SHALL Chrome DevTools Protocol を使用して非侵襲的にブラウザイベントを監視する
3. WHEN 開発者がタイムラインダッシュボード (`http://localhost:3684/logs`) にアクセスする THEN dev3000 System SHALL 記録された全イベントをリアルタイムで時系列表示する
4. WHEN 重要なイベント（エラー、警告、ユーザーインタラクション）が発生する THEN dev3000 System SHALL 自動的にスクリーンショットを撮影しタイムラインに関連付けて保存する
5. WHEN E2E テストが失敗する THEN dev3000 System SHALL 失敗時点のスクリーンショット、コンソールログ、ネットワークリクエスト履歴を含む完全な状態スナップショットを保存する
6. WHEN WebAssembly (Egaroucid) モジュールが実行される THEN dev3000 System SHALL WASM 関連のコンソールメッセージとパフォーマンスメトリクスを記録する
7. WHERE LINE Mini App が LINE アプリ内で動作する THEN dev3000 System SHALL Chrome Extension モード (`--servers-only`) でサーバーログのみを記録する

### Requirement 3: dev3000 MCP サーバー AI デバッグ機能

**Objective:** 開発者として、Claude Code が dev3000 の記録データにアクセスして問題を診断・修正できるようにしたい。そうすることで、手動でのログ共有なしに AI 支援デバッグを実現する。

#### Acceptance Criteria (Requirement 3)

1. WHEN dev3000 が起動している THEN dev3000 MCP Server SHALL 自動的に起動し Claude Code からアクセス可能な状態になる
2. WHEN Claude Code が `fix_my_app` ツールを実行する THEN dev3000 MCP Server SHALL 記録された全タイムラインデータ（ログ、エラー、スクリーンショット）を分析し問題の診断結果を返す
3. WHEN Claude Code が `execute_browser_action` ツールを実行する THEN dev3000 MCP Server SHALL 指定されたブラウザアクション（クリック、入力、ナビゲーション）を実行しその結果を記録する
4. WHEN Claude Code がネットワークリクエストの詳細を問い合わせる THEN dev3000 MCP Server SHALL リクエスト/レスポンスヘッダー、ボディ、ステータスコード、タイミング情報を提供する
5. IF 複数のエラーが記録されている THEN dev3000 MCP Server SHALL 時系列順にエラーを整理し根本原因となる可能性が高いエラーを特定する

### Requirement 4: 開発ワークフロー統合

**Objective:** 開発者として、既存の開発ワークフロー (`pnpm dev`) を維持しながら、必要に応じてデバッグツールを起動できるようにしたい。そうすることで、通常開発時のオーバーヘッドを避けつつ、問題発生時に強力なデバッグ機能を利用できるようにする。

#### Acceptance Criteria (Requirement 4)

1. WHEN 開発者が `pnpm dev` を実行する THEN Development Environment SHALL 通常通り Next.js 開発サーバーを起動し dev3000 は起動しない
2. WHEN 開発者が dev3000 を必要とする THEN Development Environment SHALL 専用コマンド（`pnpm dev:debug` など）により dev3000 と Next.js 開発サーバーを同時起動する
3. WHEN dev3000 が起動している THEN Development Environment SHALL コンソールに dev3000 タイムラインダッシュボードの URL (`http://localhost:3684/logs`) を表示する
4. WHEN 開発者が `package.json` scripts を確認する THEN Development Environment SHALL 各デバッグツールの起動方法と使い分けをコメントまたは README で明示する
5. IF Next.js Devtools MCP と dev3000 MCP が同時に起動している THEN Development Environment SHALL 両方の MCP サーバーが異なるポートで競合なく動作する

### Requirement 5: MCP クライアント設定（Claude Code）

**Objective:** 開発者として、Claude Code から MCP サーバーに接続できるようにしたい。そうすることで、AI デバッグ支援を実際に利用可能にする。

#### Acceptance Criteria (Requirement 5)

1. WHEN 開発者が MCP サーバー設定ファイルを作成する THEN MCP Client Configuration SHALL Next.js Devtools MCP と dev3000 MCP の両方のエントリを含む
2. WHEN MCP サーバーが正しく設定されている THEN Claude Code SHALL 接続時に Next.js Devtools と dev3000 の両方のツールをリストアップする
3. IF MCP サーバーへの接続が失敗する THEN MCP Client Configuration SHALL エラーメッセージにサーバーの起動状態、ポート、設定ファイルパスを含む診断情報を表示する

### Requirement 6: ドキュメントと使用ガイド

**Objective:** 開発者として、デバッグツールの使い分け、設定方法、トラブルシューティングを理解したい。そうすることで、効率的にツールを活用し問題解決時間を短縮できるようにする。

#### Acceptance Criteria (Requirement 6)

1. WHEN 開発者がドキュメントを参照する THEN Documentation SHALL Next.js Devtools MCP と dev3000 の使い分け戦略を明確に説明する
2. WHEN 開発者が初期セットアップを行う THEN Documentation SHALL 必要な依存関係のインストール、MCP 設定ファイルの作成、起動コマンドの手順を提供する
3. WHEN 開発者が具体的なデバッグシナリオに対応する THEN Documentation SHALL Next.js 特有の問題、ブラウザイベント追跡、WASM デバッグなどのユースケース別ガイドを含む
4. WHEN トラブルシューティングが必要になる THEN Documentation SHALL よくある問題（ポート競合、MCP 接続失敗）と解決策を記載する
5. WHEN 開発者が既存ワークフローとの統合を確認する THEN Documentation SHALL 通常開発 (`pnpm dev`) とデバッグモード (`pnpm dev:debug`) の違いを説明する

### Requirement 7: ブラウザ環境デバッグ対応

**Objective:** 開発者として、Chrome Extension モードを使用して軽量なブラウザデバッグ環境を構築したい。そうすることで、既存の開発ワークフローを維持しながら、ブラウザイベントとネットワークリクエストを効率的に記録できるようにする。

#### Acceptance Criteria (Requirement 7)

1. WHEN 開発者が Chrome Extension をインストールする THEN Debug Environment SHALL `/docs/DEBUG_SETUP.md` にシンプルなインストール手順を提供する
2. WHEN Chrome Extension が正しくインストールされている THEN Debug Environment SHALL `dev3000 --servers-only` 起動時に Extension 経由でブラウザログを記録開始する
3. WHEN ブラウザでアプリケーションを操作する THEN Debug Environment SHALL コンソールログ、ネットワークリクエスト、JavaScript エラーを Timeline に記録する
4. WHEN 開発者が Timeline Dashboard にアクセスする THEN Debug Environment SHALL ブラウザイベントとサーバーログを統合されたタイムラインで表示する

### Requirement 8: パフォーマンス監視とメトリクス

**Objective:** 開発者として、デバッグツールによるパフォーマンスへの影響を最小限に抑えたい。そうすることで、本番環境に近い条件で問題を再現しデバッグできるようにする。

#### Acceptance Criteria (Requirement 8)

1. WHEN dev3000 が実行されている THEN Performance Monitoring SHALL 記録オーバーヘッドが開発サーバーのレスポンスタイムに 10% 以上の影響を与えない
2. WHEN スクリーンショット自動撮影が有効な THEN Performance Monitoring SHALL 撮影頻度を設定可能にし CPU 使用率の過度な上昇を防ぐ
3. WHEN タイムラインデータが長時間蓄積される THEN Performance Monitoring SHALL 古いログを自動的にアーカイブまたは削除しメモリ使用量を制限する
4. WHEN Next.js Devtools MCP がクエリに応答する THEN Performance Monitoring SHALL クエリ処理時間が 1 秒を超えないようにキャッシュまたは最適化を実装する
5. IF デバッグツールが原因でパフォーマンスが著しく低下する THEN Debug Environment SHALL 警告メッセージを表示し記録レベルの調整オプションを提供する
