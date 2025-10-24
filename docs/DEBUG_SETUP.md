# Debug Environment Setup Guide

このガイドでは、LINE Mini App Reversi プロジェクトの開発デバッグ環境のセットアップと使用方法を説明します。

## Introduction

**dev3000** は、Next.js アプリケーションの開発履歴を包括的に記録し、AI デバッグ支援を提供するツールです。

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

## Installation

dev3000 をグローバルにインストールします：

```bash
pnpm install -g dev3000
```

または npm を使用する場合：

```bash
npm install -g dev3000
```

### インストールの確認

インストールが成功したか確認します：

```bash
dev3000 --version
```

## Usage

### デバッグモードの起動

デバッグ環境を起動するには、プロジェクトルートで以下のコマンドを実行します：

```bash
pnpm dev:debug
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
      "url": "http://localhost:3684/mcp",
      "description": "dev3000 development history and AI debugging tools"
    }
  }
}
```

### Claude Code (CLI) からの利用

1. dev3000 を起動します：

   ```bash
   pnpm dev:debug
   ```

2. Claude Code (CLI) をプロジェクトディレクトリで起動します：

   ```bash
   claude-code
   ```

3. Claude Code (CLI) は自動的に `.mcp.json` を読み込み、dev3000 MCP Server に接続します。

4. デバッグ支援を依頼します：

   ```
   "fix my app - エラーが発生している"
   ```

   Claude Code (CLI) は dev3000 が記録したタイムラインデータ（ログ、エラー、スクリーンショット）を分析し、問題の診断結果と修正提案を提供します。

### 利用可能な MCP ツール

dev3000 MCP Server が提供する主なツール：

- **`fix_my_app`**: タイムラインデータを分析し、問題の診断結果を返す
- **`execute_browser_action`**: ブラウザアクション（クリック、入力、ナビゲーション）を実行し、結果を記録

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

1. 既存のプロセスを停止します：

   ```bash
   lsof -ti:3030 | xargs kill -9
   lsof -ti:3684 | xargs kill -9
   ```

2. または、別のポートを指定します：

   ```bash
   dev3000 -p 3031 --command 'next dev -p 3031'
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
         "url": "http://localhost:3684/mcp",
         "description": "dev3000 development history and AI debugging tools"
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

### 問題 4: Playwright Chrome 起動失敗

**エラー**: Playwright モードで Chrome が起動しない。

**解決策**:

1. Chromium が正しくインストールされているか確認します：

   ```bash
   npx playwright install chromium
   ```

2. システムリソース（メモリ、CPU）が十分か確認します。
   - Playwright Chrome は 1-2GB のメモリを消費します。

3. `--servers-only` モードを試します（Chrome 自動起動なし）：

   ```bash
   dev3000 --servers-only -p 3030 --command 'next dev -p 3030'
   ```

   このモードでは、Timeline Dashboard と MCP Server のみ起動し、ブラウザは手動で開きます。

### 問題 5: Timeline Dashboard にアクセスできない

**エラー**: `http://localhost:3684/logs` にアクセスできない。

**解決策**:

1. dev3000 が正常に起動しているか確認します：

   ```bash
   curl http://localhost:3684/health
   ```

   正常な場合、HTTP 200 OK が返されます。

2. ブラウザのキャッシュをクリアし、再度アクセスします。

3. dev3000 を再起動します。

## Advanced Topics

### カスタムポート設定

デフォルト以外のポートを使用する場合：

```bash
dev3000 -p 3031 --mcp-port 3685 --command 'next dev -p 3031'
```

- `-p <port>`: Next.js Dev Server のポート
- `--mcp-port <port>`: dev3000 MCP Server のポート

### Timeline ログのエクスポート

Timeline Dashboard から JSON 形式でログをエクスポートできます：

1. Timeline Dashboard (`http://localhost:3684/logs`) にアクセス
2. Export ボタンをクリック
3. タイムスタンプ範囲を指定（オプション）
4. JSON ファイルとしてダウンロード

## References

- **dev3000 GitHub Repository**: [https://github.com/vercel-labs/dev3000](https://github.com/vercel-labs/dev3000)
- **Model Context Protocol (MCP)**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)
- **Claude Code (CLI) Documentation**: [https://claude.com/claude-code](https://claude.com/claude-code)

---

**重要**: このデバッグ環境は **開発環境専用** です。本番環境には導入しないでください。
