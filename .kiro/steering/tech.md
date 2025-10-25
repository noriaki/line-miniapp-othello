# Technology Stack

## Architecture

**Static-first with Client-side Game Engine**:

- SSGで静的HTML生成(高速初期表示)
- クライアント側でゲームロジック・AI計算完結
- Server/Client Component明確分離(Next.js App Router)
- Web Worker経由のWASM実行(UI非ブロック)

## Core Technologies

- **Language**: TypeScript 5.x (strict mode)
- **Framework**: Next.js 15.x (App Router, Static Export)
- **Runtime**: Node.js 24.x (nodenv管理、`.node-version`指定)
- **UI Library**: React 18.x
- **AI Engine**: WebAssembly (Egaroucid ai.wasm)

## Key Libraries

- **Styling**: Tailwind CSS + CSS Modules
- **Package Manager**: pnpm 9.x
- **Testing**: Jest + React Testing Library + Playwright (E2E)
- **Debug Tools**: dev3000 (MCP server for AI-assisted debugging)
- **LINE Integration**: LIFF SDK 2.x (planned, not yet implemented)

## Development Standards

### Type Safety

- TypeScript strict mode有効
- `any`型の使用禁止
- Result型パターンでエラーハンドリング(Railway-oriented programming)
- WASM境界での型安全性確保

```typescript
// Result型によるエラーハンドリング
type Result<T, E> = { success: true; value: T } | { success: false; error: E };
```

### Code Quality

- ESLint: Next.js推奨設定(`eslint-config-next`)
- Prettier: コードフォーマット自動化
- Type Check: `tsc --noEmit`でビルド前検証

### Testing

- **Jest**: ユニット・統合テスト、GameLogicレイヤー90%以上カバレッジ目標
- **Playwright**: E2E テスト(game-flow, AI対戦, responsive, WASM error)
- **Multi-device Testing**: Desktop Chrome, Mobile Chrome, Mobile Safari
- **Test Modes**: UI mode、headed mode、プロジェクト別実行(chromium/mobile特化)
- **Pure Functions重視**: テスタビリティ向上

## Development Environment

### Required Tools

- Node.js 24.x (nodenv推奨)
- pnpm 9.x
- 推奨エディタ: VSCode + TypeScript Extension

### Common Commands

```bash
# Dev
pnpm dev                 # 通常開発モード
pnpm dev:debug           # デバッグモード (dev3000 + MCP server)

# Build (Static Export)
pnpm build

# Test
pnpm test                # Jestユニットテスト
pnpm test:e2e            # Playwright E2Eテスト (全デバイス)
pnpm test:e2e:ui         # Playwright UIモード
pnpm test:e2e:chromium   # Desktop Chromeのみ
pnpm test:e2e:mobile     # Mobile Chrome/Safari
pnpm test:coverage       # カバレッジ付きテスト

# Lint & Format
pnpm lint
pnpm format
```

## Key Technical Decisions

### Server/Client Boundary

- **page.tsx**: Server Component(SSG)、静的レイアウト・メタデータ
- **GameBoard.tsx**: Client Component("use client")、全ゲームロジック
- 理由: SSG高速化とゲームロジック明確分離のバランス

### WASM Integration

- **WASMBridge**: メモリ管理・データ変換・エラーハンドリング隠蔽
- **AIEngine**: 高レベルAPI(型安全なインタフェース)
- **Web Worker**: UI非ブロック(0.5-2秒のAI計算)
- 理由: 型安全性・保守性・UX応答性

### State Management

- React Hooks(useState, useReducer)のみ
- カスタムフック分離: `useGameState`, `useGameLogic`, `useAIPlayer`
- 理由: シンプルなゲーム状態は外部ライブラリ不要

### Immutability

- Board状態は常に新しいインスタンス生成(Immutable pattern)
- 理由: React State更新の整合性保証、バグ防止

### Error Handling & Resilience

- **Result型パターン**: WASM境界でのエラー伝搬
- **AI Fallback**: WASM初期化失敗時のフォールバック機能(ai-fallback.ts)
- **Error Boundary**: UIレベルでのエラー回復(ErrorBoundary.tsx)
- 理由: WebAssembly統合の不確実性への対応、UX維持

### Debug & Development Tools

- **dev3000**: サーバー/ブラウザイベント統合タイムライン記録
- **MCP Server**: Claude Code (CLI)によるAI支援デバッグ
- **通常開発との分離**: `pnpm dev` (軽量) vs `pnpm dev:debug` (包括的)
- 理由: 問題発生時の診断効率化、通常開発のオーバーヘッド回避

---

_created_at: 2025-10-21_
_updated_at: 2025-10-26_

**Recent Updates (2025-10-26)**:

- Added documentation for additional E2E test modes (UI, headed, project-specific)
- Clarified LIFF SDK status (planned but not yet implemented)
