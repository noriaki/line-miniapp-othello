# Debug Environment Setup Guide

このガイドでは、LINE Mini App Reversi プロジェクトの開発デバッグ方法のベストプラクティスを説明します。

## Introduction

デバッグには **dev3000** を利用します。
dev3000は、Next.js アプリケーションのログを包括的に記録し、MCPツールを通じてAIによるデバッグ支援を提供するツールです。

### 主な機能

- **統合タイムライン記録**: サーバーログ、ブラウザイベント、コンソールメッセージ、ネットワークリクエストを統合タイムラインで記録
- **自動スクリーンショット**: エラーや警告発生時に自動的にスクリーンショットを撮影
- **AI デバッグ支援**: Claude Code (CLI) が MCP (Model Context Protocol) 経由でデバッグツールにアクセス可能
- **リアルタイム可視化**: Timeline Dashboard でリアルタイムにイベントを確認可能
- **ブラウザ監視**: Playwright モードで Chrome を自動起動し、ブラウザイベントを包括的に監視

### 利点

- **手動共有不要**: エラーメッセージやスクリーンショットを手動で共有する必要がない
- **包括的な診断**: サーバーログとブラウザ動作の両面から問題を診断可能
- **効率向上**: Claude Code (CLI) が文脈を持って正確なデバッグ支援を提供
- **再現困難なバグの共有**: チーム開発で再現困難なバグの状態を記録・共有可能

## Installation / Setup

[dev3000](https://github.com/vercel-labs/dev3000)のGitHubリポジトリおよびリポジトリのREADMEを参照してください。

## Usage

### デバッグモードの起動

デバッグ環境を起動するには、プロジェクトルートで以下のコマンドを実行します（原則、ユーザによって起動されます）：

```bash
pnpm dev:debug # in package.json, `dev3000 -p 3030 --command 'next dev -p 3030'`
```

このコマンドは以下を自動的に起動します：

- **Next.js Dev Server** (Port 3030): `http://localhost:3030`
- **Timeline Dashboard** (Port 3684): `http://localhost:3684/logs`
- **dev3000 MCP Server** (Port 3684): `http://localhost:3684/mcp`
- **Playwright Chrome**: 自動起動し、`http://localhost:3030` にアクセス

### Timeline Dashboard へのアクセス

ブラウザで以下の URL にアクセスすると、記録されたタイムラインイベントを確認できます：

```
http://localhost:3684/logs
```

Timeline Dashboard では以下の情報を時系列で表示します：

- サーバーログ（Next.js Dev Server）
- ブラウザコンソールログ
- ネットワークリクエスト（リクエスト/レスポンスヘッダー、ステータスコード、タイミング情報）
- 自動スクリーンショット（エラー/警告発生時）

### 通常開発モードとの違い

**通常開発モード** (`pnpm dev`):

- Next.js Dev Server のみ起動
- 軽量で高速
- 日常的な開発作業に最適

**デバッグモード** (`pnpm dev:debug`):

- dev3000 + Next.js Dev Server + Playwright Chrome + Timeline Dashboard
- 包括的な監視とデバッグ機能
- 複雑な問題のトラブルシューティングや E2E テスト失敗調査に最適

### いつデバッグモードを使うべきか

以下のような状況でデバッグモードを使用することを推奨します：

- ユーザから `dev3000` または `d3k` を利用する指示がある場合
- 複雑なバグの原因を特定する必要がある場合
- E2E テストが失敗し、失敗時の状態を詳細に確認したい場合
- WebAssembly (Egaroucid) モジュールの動作を監視したい場合
- ネットワークリクエストの詳細（ヘッダー、タイミング）を調査したい場合
- ブラウザイベントの完全な履歴が必要な場合

## MCP Integration

dev3000 は MCP (Model Context Protocol) Server を内蔵しており、**Claude Code (CLI)** から自動的にアクセス可能です。

### Zero Configuration

dev3000 が初回起動時に、プロジェクトルートに `.mcp.json` を自動生成します。この設定ファイルにより、Claude Code (CLI) が自動的に dev3000 MCP Server に接続します。

**生成される `.mcp.json` の例**：

```json
{
  "mcpServers": {
    "dev3000": {
      "type": "http",
      "url": "http://localhost:3684/mcp"
    }
  }
}
```

### Claude Code (CLI) からの利用

1. ユーザが dev3000 を起動します：

   ```bash
   pnpm dev:debug
   ```

2. ユーザが Claude Code (CLI) をプロジェクトディレクトリで起動します：

   ```bash
   claude
   ```

3. Claude Code (CLI) は自動的に `.mcp.json` を読み込み、dev3000 MCP Server に接続します。

4. デバッグ支援を依頼します：

   ```
   "fix my app - <エラーの内容や不正な挙動の概要、期待する正常動作などユーザからの指示>"
   ```

   Claude Code (CLI) は dev3000 が記録したタイムラインデータ（ログ、エラー、スクリーンショット）を分析し、問題の診断結果と修正提案を提供します。

### 利用可能な MCP ツール

dev3000 MCP Server が提供するツール群を以下に示します。

#### 主要デバッグ・修正ツール

- **`fix_my_app`**: アプリの総合デバッグ・修正ツール
  - タイムラインデータを分析し、全エラータイプ（ビルド、サーバー、ブラウザ、ネットワーク、パフォーマンス）を検出
  - エラーを優先度付けし、最も深刻な問題を特定
  - 1つの問題に焦点を当てた PR を作成可能（`createPR: true`）
  - パラメータ:
    - `mode`: `snapshot`（今すぐ修正）、`bisect`（リグレッション修正）、`monitor`（継続的修正）
    - `createPR`: PR作成を有効化（デフォルト: false）
    - `focusArea`: 特定エリア（'build', 'runtime', 'network', 'ui', 'all'）
    - `timeRangeMinutes`: 分析する時間範囲（デフォルト: 10分）

- **`fix_my_jank`**: パフォーマンス・レイアウトシフト専用修正ツール
  - `fix_my_app` のパフォーマンス特化版
  - レイアウトシフト、CLS（Cumulative Layout Shift）問題を自動検出・修正
  - パラメータ:
    - `projectName`: プロジェクト名（複数インスタンスがある場合）
    - `timeRangeMinutes`: 分析する時間範囲

#### ブラウザ自動化ツール

- **`execute_browser_action`**: インテリジェントブラウザ自動化
  - chrome-devtools MCP が利用可能な場合は自動的に委譲
  - スクリーンショット、ナビゲーション、クリック、JavaScript評価などを実行
  - パラメータ:
    - `action`: 'click', 'navigate', 'screenshot', 'evaluate', 'scroll', 'type'
    - `params`: アクションのパラメータ（例: `{x: 100, y: 200}` for click、`{url: 'https://...'}` for navigate）

#### Chrome DevTools 統合ツール群

- **`chrome-devtools_list_pages`**: 開いているページ一覧を取得
- **`chrome-devtools_select_page`**: 今後のツール呼び出しのコンテキスト用にページを選択
- **`chrome-devtools_new_page`**: 新しいページを作成
- **`chrome-devtools_close_page`**: ページをインデックスで閉じる（最後のページは閉じられない）
- **`chrome-devtools_take_snapshot`**: a11yツリーベースのテキストスナップショットを取得（スクリーンショットより優先）
  - ページ要素をユニークID（uid）と共にリスト化
  - 常に最新のスナップショットを使用
- **`chrome-devtools_take_screenshot`**: ページまたは要素のスクリーンショットを撮影
- **`chrome-devtools_click`**: 提供された要素をクリック
- **`chrome-devtools_hover`**: 提供された要素にホバー
- **`chrome-devtools_fill`**: input、textarea への入力、または select 要素のオプション選択
- **`chrome-devtools_fill_form`**: 複数のフォーム要素を一度に入力
- **`chrome-devtools_drag`**: 要素を別の要素にドラッグ
- **`chrome-devtools_upload_file`**: 提供された要素を通じてファイルをアップロード
- **`chrome-devtools_navigate_page`**: 選択中のページを URL に遷移
- **`chrome-devtools_navigate_page_history`**: 選択中のページの履歴をナビゲート（戻る/進む）
- **`chrome-devtools_wait_for`**: 選択中のページに指定されたテキストが表示されるまで待機
- **`chrome-devtools_handle_dialog`**: ブラウザダイアログが開かれた場合に処理
- **`chrome-devtools_evaluate_script`**: 選択中のページ内で JavaScript 関数を実行
  - 戻り値は JSON シリアライズ可能である必要がある
- **`chrome-devtools_list_console_messages`**: 最後のナビゲーション以降の全コンソールメッセージを一覧表示
- **`chrome-devtools_get_console_message`**: ID によりコンソールメッセージを取得
- **`chrome-devtools_list_network_requests`**: 最後のナビゲーション以降の全ネットワークリクエストを一覧表示
- **`chrome-devtools_get_network_request`**: URL によりネットワークリクエストを取得
- **`chrome-devtools_resize_page`**: 選択中のページのウィンドウをリサイズ
- **`chrome-devtools_emulate_cpu`**: CPU スロットリングをエミュレート
- **`chrome-devtools_emulate_network`**: ネットワーク条件（スロットリング、オフラインモード）をエミュレート
- **`chrome-devtools_performance_start_trace`**: パフォーマンストレース記録を開始
  - Core Web Vitals（CWV）スコアも報告
- **`chrome-devtools_performance_stop_trace`**: パフォーマンストレース記録を停止
- **`chrome-devtools_performance_analyze_insight`**: トレース記録結果で強調された特定のパフォーマンスインサイトの詳細情報を提供

#### 分析・診断ツール

- **`analyze_visual_diff`**: ビジュアル差分分析
  - 2つのスクリーンショットを分析し、ビジュアル差分を説明
  - レイアウトシフト検出時の before/after フレーム比較に最適
  - パラメータ:
    - `beforeImageUrl`: ビフォア画像URL
    - `afterImageUrl`: アフター画像URL
    - `context`: 探すべき内容のコンテキスト（オプション）

- **`find_component_source`**: コンポーネントソース検索
  - DOM要素をソースコードにマッピング
  - React コンポーネント関数を抽出し、ユニークなパターンを検索
  - CLS デバッグ時に特定コンポーネントのソースファイルを特定するのに有用
  - パラメータ:
    - `selector`: CSS セレクタ（例: 'nav', '.header', '#main'）
    - `projectName`: プロジェクト名（オプション）

#### 開発サーバー管理ツール

- **`restart_dev_server`**: 開発サーバー再起動
  - dev3000 の監視、ログ、ブラウザ接続を維持しながら開発サーバーを安全に再起動
  - next.config.js や環境変数の変更後に使用
  - **重要**: 手動で `pkill -f "next dev"` や `npm run dev` を実行しないこと
  - パラメータ:
    - `projectName`: プロジェクト名（オプション）

- **`crawl_app`**: アプリケーションクローラー
  - ホームページから開始してすべての URL を自動発見
  - サイト全体のテストやデバッグ前に使用
  - パラメータ:
    - `depth`: クロール深度（1=ホームページのみ、2=ホームページ+次レベル、'all'=完全クロール、デフォルト: 1）
    - `projectName`: プロジェクト名（オプション）

#### Next.js 開発統合ツール

- **`nextjs-dev_nextjs_docs`**: Next.js ドキュメント検索
  - Next.js 16 のナレッジベースと公式ドキュメントへのアクセス
  - 最新情報の取得

- **`nextjs-dev_browser_eval`**: Playwright ブラウザ自動化
  - Playwright を使用した Web アプリのテストと自動化
  - **重要**: Next.js プロジェクトでは `nextjs-dev_nextjs_runtime` を優先使用
  - ページ検証時は curl ではなくブラウザ自動化を使用（JavaScript の実行、ハイドレーション問題の検出のため）
  - アクション: start, navigate, click, type, fill_form, evaluate, screenshot, console_messages, close, drag, upload_file, list_tools

- **`nextjs-dev_nextjs_runtime`**: Next.js ランタイム情報取得
  - Next.js 開発サーバーの MCP エンドポイントとのやり取り
  - **プロアクティブに使用すべきタイミング**:
    1. アプリの変更を実装する前に現在のコンポーネント構造とルートを確認
    2. 診断・調査質問（"何が起きている？"、"エラーを確認"、"利用可能なルートは？"）
    3. 実行中のアプリを検索する第一選択として
  - 要件: Next.js 16 以降（MCP は v16 でデフォルト有効）
  - ワークフロー:
    1. `action='discover_servers'`: 実行中の Next.js サーバーを発見
    2. `action='list_tools'`: 利用可能なツールを確認
    3. `action='call_tool'`: 特定のツールを実行

- **`nextjs-dev_upgrade_nextjs_16`**: Next.js 16 アップグレードガイド
  - Next.js 16 へのアップグレードを支援
  - 公式 codemod を最初に実行（クリーンな git 状態が必要）
  - Next.js、React、React DOM を自動アップグレード
  - カバー範囲: 非同期 API 変更（params, searchParams, cookies, headers）、設定移行、React 19 互換性など

- **`nextjs-dev_enable_cache_components`**: Cache Components セットアップ
  - Next.js 16 の Cache Components の完全セットアップを処理
  - 設定更新、開発サーバー起動、エラー検出、自動修正、検証を包括的に実施
  - Suspense 境界、"use cache" ディレクティブ、generateStaticParams、cacheLife プロファイル、キャッシュタグを自動追加
  - 要件: Next.js 16.0.0+ （stable または canary のみ、beta は非対応）

## デバッグ操作のベストプラクティス

### ブラウザ要素の正確なクリック操作

デバッグ時に特定のブラウザ要素をクリックする必要がある場合、以下のワークフローを推奨します。

#### 推奨ツール: `chrome-devtools_click`

**理由:**

- UIDベースの要素指定により、意図した位置を正確にクリック可能
- 座標ベースのクリックと異なり、要素を確実に特定できる
- 他のブラウザ操作ツールと比較して最も正確

#### 基本ワークフロー:

1. **ページをリロード** (オプション、初期状態に戻す場合):

   ```typescript
   // chrome-devtools_navigate_page
   { "url": "http://localhost:3030" }
   ```

2. **スナップショットで要素を確認**:

   ```typescript
   // chrome-devtools_take_snapshot
   // 結果例:
   // uid=2_28 button  <- これが目的の要素
   ```

3. **要素をクリック**:

   ```typescript
   // chrome-devtools_click
   { "uid": "2_28" }
   ```

4. **結果を確認**:
   ```typescript
   // chrome-devtools_take_snapshot
   // ページ状態の変化を確認（スコア変化、表示内容の変更など）
   ```

#### 重要な注意事項: タイムアウトエラーの扱い

**現象:**
`chrome-devtools_click` 実行時に以下のエラーが表示されることがあります：

```
Timed out after waiting 5000ms
```

**実際の動作:**

- ⚠️ **タイムアウトエラーが表示されても、実際にはクリック操作は成功している可能性が高い**
- このエラーは「クリック完了の応答待ち」のタイムアウトであり、クリック操作自体の失敗を意味しない

**推奨対応:**

1. **エラーメッセージだけで判断しない**
   - タイムアウト表示後、必ず実行結果を確認する

2. **実行結果の確認方法**:
   - `chrome-devtools_take_snapshot` で再度スナップショットを取得
   - ページ状態の変化を確認（例: スコアの変化、要素の表示/非表示）
   - 必要に応じて `chrome-devtools_take_screenshot` で視覚的に確認

3. **確認例**:

   ```typescript
   // クリック実行（タイムアウトエラーが表示される）
   chrome - devtools_click({ uid: '2_28' });
   // -> Error: Timed out after waiting 5000ms

   // 実際の結果を確認
   chrome - devtools_take_snapshot();
   // -> スコアが "2" から "3" に変化 => クリック成功
   ```

#### 他のブラウザ操作ツールとの比較

| ツール                      | 正確性                              | 動作確認                | 推奨度     |
| --------------------------- | ----------------------------------- | ----------------------- | ---------- |
| **`chrome-devtools_click`** | ✅ 高（UID指定）                    | ⚠️ タイムアウト表示あり | ⭐⭐⭐⭐⭐ |
| `execute_browser_action`    | ❌ 低（座標指定、CDP タイムアウト） | ❌ エラー発生           | ❌         |
| `nextjs-dev_browser_eval`   | ❌ 低（意図しない要素をクリック）   | ✅ 詳細ログあり         | ⚠️         |

**結論:**
本プロジェクトでは、特定の要素を正確にクリックする必要がある場合、**`chrome-devtools_click` を第一選択とし、タイムアウトエラーは無視して実行結果で成功を判断する**ことを推奨します。

## Use Cases

### ユースケース 1: ブラウザイベント追跡

**シナリオ**: ユーザーが特定の操作を行った際にエラーが発生するが、再現が難しい。

**手順**:

1. `pnpm dev:debug` でデバッグモードを起動
2. Playwright Chrome でエラーが発生する操作を実行
3. Timeline Dashboard (`http://localhost:3684/logs`) でイベントを確認
4. エラー発生時点のスクリーンショット、コンソールログ、ネットワークリクエストを確認
5. Claude Code (CLI) に「fix my app」と依頼し、AI 診断を受ける

### ユースケース 2: WebAssembly (Egaroucid) デバッグ

**シナリオ**: リバーシ AI (WebAssembly) の動作に問題がある。

**手順**:

1. `pnpm dev:debug` でデバッグモードを起動
2. Playwright Chrome でリバーシゲームを開始し、AI との対戦を開始
3. Timeline Dashboard で WASM 関連のコンソールメッセージを確認
   - フィルター: `type: 'browser'`, `level: 'info' | 'error'`
   - 検索: "WASM" または "Egaroucid"
4. パフォーマンスメトリクス（AI 計算時間）を確認
5. 必要に応じて Claude Code (CLI) に AI 診断を依頼

### ユースケース 3: E2E テスト失敗調査

**シナリオ**: Playwright E2E テストが失敗し、失敗時の状態を詳細に確認したい。

**手順**:

1. `pnpm dev:debug` でデバッグモードを起動
2. 失敗した E2E テストシナリオを手動で再現
3. Timeline Dashboard で失敗時点のイベントを確認
   - 自動スクリーンショット
   - コンソールエラー
   - ネットワークリクエスト失敗
4. Claude Code (CLI) に「E2E テストが失敗した原因を診断して」と依頼
5. AI の診断結果に基づいて修正を実施

### ユースケース 4: ネットワークリクエスト詳細調査

**シナリオ**: API リクエストが失敗するが、詳細なエラー情報が不明。

**手順**:

1. `pnpm dev:debug` でデバッグモードを起動
2. API リクエストが発生する操作を実行
3. Timeline Dashboard でネットワークリクエストを確認
   - フィルター: `type: 'network'`, `level: 'error'`
   - リクエスト/レスポンスヘッダー、ステータスコード、タイミング情報を確認
4. Claude Code (CLI) に「ネットワークリクエストの失敗原因を診断して」と依頼

## Troubleshooting

### 問題 1: Port 競合

**エラー**:

```
Error: Port 3030 is already in use.
```

または

```
Error: Port 3684 is already in use.
```

**解決策**:

既存のプロセスを停止します：

```bash
lsof -ti:3030 | xargs kill -9
lsof -ti:3684 | xargs kill -9
```

### 問題 2: dev3000 未インストール

**エラー**:

```
dev3000: command not found
```

**解決策**:

dev3000 をグローバルにインストールします：

```bash
pnpm install -g dev3000
```

### 問題 3: MCP 接続失敗

**エラー**: Claude Code (CLI) が dev3000 MCP Server に接続できない。

**解決策**:

1. dev3000 が起動中か確認します：

   ```bash
   curl http://localhost:3684/mcp
   ```

   正常な場合、JSON-RPC エラーレスポンスが返されます（接続は成功）。

2. `.mcp.json` が存在し、正しい設定が含まれているか確認します：

   ```bash
   cat .mcp.json
   ```

   期待される内容：

   ```json
   {
     "mcpServers": {
       "dev3000": {
         "type": "http",
         "url": "http://localhost:3684/mcp"
       }
     }
   }
   ```

3. dev3000 を再起動します：

   ```bash
   # 現在のプロセスを停止
   # Ctrl+C または kill コマンド

   # 再起動
   pnpm dev:debug
   ```

## References

- **dev3000 GitHub Repository**: [https://github.com/vercel-labs/dev3000](https://github.com/vercel-labs/dev3000)
- **Model Context Protocol (MCP)**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- **Claude Code (CLI) Documentation**: [https://claude.com/claude-code](https://claude.com/claude-code)

---

**重要**: このデバッグ環境は **開発環境専用** です。本番環境には導入しないでください。
