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
- **LINE Integration**: LIFF SDK 2.x
- **Testing**: Jest + React Testing Library

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

- Jest: ユニット・統合テスト
- GameLogicレイヤー: 90%以上カバレッジ目標
- Pure Functionsを重視(テスタビリティ向上)

## Development Environment

### Required Tools

- Node.js 24.x (nodenv推奨)
- pnpm 9.x
- 推奨エディタ: VSCode + TypeScript Extension

### Common Commands

```bash
# Dev
pnpm dev

# Build (Static Export)
pnpm build

# Test
pnpm test

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

---

_created_at: 2025-10-21_
