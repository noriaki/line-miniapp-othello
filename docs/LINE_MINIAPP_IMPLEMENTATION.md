# LINE ミニアプリ対応 実装ドキュメント

## 概要

本ドキュメントは、リバーシWebアプリケーションへのLINE LIFF (LINE Front-end Framework) SDK統合の実装手順と構成を説明します。

## 実装完了日

2025-10-26

## 機能概要

- **LIFF SDK統合**: LINE公式SDKを用いたLINEミニアプリ対応
- **自動ログイン**: LINEアプリ内で起動時に自動的にユーザー認証
- **プロフィール表示**: LINEプロフィールアイコンと表示名をゲームUI内に表示
- **外部ブラウザ対応**: 外部ブラウザでは任意ログイン機能を提供
- **フォールバック機能**: LIFF機能失敗時でもゲームプレイ継続可能

## アーキテクチャ

### 新規追加ファイル

```
/src/lib/liff/
├── types.ts              # LIFF関連型定義（全型を集約）
├── liff-client.ts        # LIFF SDK APIラッパー
└── __tests__/            # LIFF統合テスト

/src/contexts/
├── LiffContext.tsx       # React Context定義
└── LiffProvider.tsx      # Provider コンポーネント

/src/hooks/
└── useLiff.ts            # カスタムフック
```

### 既存ファイルの変更

- `app/layout.tsx`: LiffProvider追加
- `src/components/GameBoard.tsx`: useLiff フック使用、プロフィールアイコン表示
- `jest.config.js`: LIFF統合コードをカバレッジ除外
- `jest.setup.js`: LIFF SDKグローバルモック設定

## 環境変数設定

### 開発環境

1. `.env.local` ファイルを作成:

```bash
NEXT_PUBLIC_LIFF_ID=your-liff-id-here
```

2. LINE Developers Consoleで LIFF アプリを作成し、LIFF IDを取得
3. `.env.local` に LIFF IDを設定

**注意**: `.env.local` は `.gitignore` に含まれているため、コミットされません。

### 本番環境（Vercel）

1. Vercelプロジェクト設定 > Environment Variables
2. `NEXT_PUBLIC_LIFF_ID` を追加
3. 本番環境のLIFF IDを設定

## LIFF ID未設定時の動作

環境変数が未設定の場合:

- コンソールに警告メッセージを表示
- LIFF機能を無効化
- ゲームは通常モードで動作可能

## 型定義の設計パターン

### 型定義の集約戦略

全LIFF関連型を `/src/lib/liff/types.ts` に集約し、循環依存を回避:

```typescript
// /src/lib/liff/types.ts
export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

export interface LiffContextType {
  isReady: boolean;
  error: string | null;
  isInClient: boolean | null;
  isLoggedIn: boolean | null;
  profile: LiffProfile | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export interface LiffClientInterface {
  initialize(liffId: string): Promise<void>;
  isInClient(): boolean;
  isLoggedIn(): boolean;
  login(): Promise<void>;
  logout(): Promise<void>;
  getProfile(): Promise<LiffProfile>;
}
```

### 依存関係の方向性

```
/src/lib/liff/types.ts  (型定義のみ、依存なし)
  ↑
/src/lib/liff/liff-client.ts  (LiffClientInterface実装)
  ↑
/src/contexts/LiffContext.tsx  (Context定義)
  ↑
/src/contexts/LiffProvider.tsx  (Provider実装)
  ↑
/src/hooks/useLiff.ts  (カスタムフック)
  ↑
/src/components/GameBoard.tsx  (UI統合)
```

## エラーハンドリング

### LIFF機能とゲームロジックのエラー分離

LIFF関連エラーは独立して処理され、ゲームのエラーハンドリング (`useGameErrorHandler`) とは分離されています:

#### LIFF初期化エラー

```typescript
// LiffProvider内部で処理
try {
  await liffClient.initialize(liffId);
  setIsReady(true);
} catch (error) {
  console.error('LIFF initialization failed:', error);
  setError('LINE統合が利用できません。通常モードでゲームを続けられます。');
  setIsReady(true); // エラーでも準備完了（機能無効化）
}
```

#### プロフィール取得エラー

```typescript
try {
  const profile = await liffClient.getProfile();
  setProfile(profile);
} catch (profileError) {
  console.error('プロフィール取得失敗:', profileError);
  setError('プロフィール情報の取得に失敗しました。');
  setProfile(null); // デフォルトアイコン表示
  // isReady=trueは維持（LIFF機能自体は有効）
}
```

#### エラー状態の詳細

| エラー種別       | `isReady` | `error` | `profile` | UI表示             |
| ---------------- | --------- | ------- | --------- | ------------------ |
| 初期化失敗       | `true`    | 非null  | `null`    | LIFF機能完全無効化 |
| プロフィール失敗 | `true`    | 非null  | `null`    | デフォルトアイコン |
| 環境変数未設定   | `true`    | `null`  | `null`    | LIFF機能スキップ   |

## テスト戦略

### LIFF SDK モック設定

#### グローバルモック (`jest.setup.js`)

```javascript
jest.mock('@line/liff', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    isInClient: jest.fn(),
    isLoggedIn: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));
```

#### コンポーネントテスト用モック

```javascript
// GameBoardコンポーネントのテストでは、useLiffをモック
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: false, // LIFF UI要素を非表示にする
    error: null,
    isInClient: null,
    isLoggedIn: null,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));
```

### カバレッジ除外設定

LIFF統合コードはテスト除外対象 (Requirement 9.4):

```javascript
// jest.config.js
collectCoverageFrom: [
  'src/**/*.{ts,tsx}',
  '!src/lib/liff/**',        // LIFF統合除外
  '!src/contexts/Liff*.tsx', // LIFF Context/Provider除外
],
```

### テストファイル構成

```
src/lib/liff/__tests__/
├── liff-client.test.ts       # LiffClient API テスト
├── liff-mock-setup.test.ts   # モック設定検証
├── liff-setup.test.ts        # セットアップテスト
├── static-export.test.ts     # Next.js Static Export検証
└── type-safety.test.ts       # TypeScript型安全性検証

src/contexts/__tests__/
└── LiffProvider.test.tsx     # Provider エラーハンドリング

src/hooks/__tests__/
└── useLiff.test.tsx          # フックエラーハンドリング

src/components/__tests__/
└── GameBoard-liff.test.tsx   # UI統合テスト
```

## ローカル開発環境でのテスト

### 1. LIFF機能なしでのテスト

```bash
# 環境変数未設定でアプリ起動
pnpm dev
```

- コンソールに警告表示
- ゲームは通常モード で動作

### 2. LIFF機能ありでのテスト

```bash
# .env.local にLIFF IDを設定
echo "NEXT_PUBLIC_LIFF_ID=your-test-liff-id" > .env.local

# アプリ起動
pnpm dev
```

- LINEアプリで開く: `https://liff.line.me/your-test-liff-id`
- 外部ブラウザで開く: `http://localhost:3000` → ログインボタン表示

### 3. テスト実行

```bash
# ユニットテスト
pnpm test

# E2Eテスト（LIFF機能は手動確認）
pnpm test:e2e
```

## トラブルシューティング

### LIFF初期化失敗

**症状**: コンソールに "LIFF initialization failed" エラー

**原因**:

- LIFF IDが無効
- ネットワークエラー
- LINE APIダウン

**対処**:

1. LIFF IDを確認
2. LINE Developers Consoleで設定確認
3. ネットワーク接続確認

### プロフィール画像が表示されない

**症状**: デフォルトアイコンのみ表示

**原因**:

- ログインしていない
- `pictureUrl` が設定されていない
- 画像読み込みエラー

**対処**:

- LINEアプリ内で起動しているか確認
- 外部ブラウザの場合はログインボタンをクリック
- ブラウザコンソールでエラー確認

### テストが失敗する

**症状**: `useLiff must be used within LiffProvider` エラー

**原因**: GameBoardコンポーネントテストで useLiff モックが未設定

**対処**:

```javascript
// テストファイルに追加
jest.mock('@/hooks/useLiff', () => ({
  useLiff: () => ({
    isReady: false,
    error: null,
    isInClient: null,
    isLoggedIn: null,
    profile: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));
```

## ビルドと検証

### Static Export 検証

```bash
# ビルド実行
pnpm build

# 静的ファイル確認
ls -la out/

# 生成されたHTMLにLIFF SDKがクライアントバンドルに含まれていることを確認
```

### TypeScript 型チェック

```bash
# 型エラーチェック
pnpm type-check
```

- LIFF SDK型定義が正しく認識されることを確認
- `liff.getProfile()` の返り値型が `Profile` として推論されることを確認

## パフォーマンス考慮事項

- **LIFF初期化**: 100-300ms（ネットワーク状況依存）
- **プロフィール取得**: 500ms-1s（非同期処理）
- **UI非ブロック**: 初期化中もゲームプレイ可能

## セキュリティ

- **LIFF ID**: 公開情報（環境変数管理）
- **アクセストークン**: LIFF SDK内部管理（手動保存なし）
- **プロフィール情報**: メモリ内のみ保持（永続化なし）

## 今後の拡張

現在の実装スコープ外だが、将来的な拡張可能性:

- マルチプレイヤー対戦（LINEユーザー同士）
- ゲーム履歴のLINEサーバー永続化
- LINE通知機能
- LINEメッセージ送信機能

## 参考資料

- [LIFF SDK公式ドキュメント](https://developers.line.biz/ja/docs/liff/)
- [LIFF API Reference](https://developers.line.biz/en/reference/liff/)
- `.kiro/specs/line-miniapp-support/` - 要件・設計・タスク仕様書

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Author**: AI-DLC (AI Development Life Cycle) - Kiro Framework
