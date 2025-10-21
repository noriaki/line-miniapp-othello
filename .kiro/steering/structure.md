# Project Structure

## Organization Philosophy

**Layer-based with Domain Separation**:

- Presentation Layer: Next.js App Router(Server/Client分離)
- Game Logic Layer: Pure Functions(ビジネスロジック)
- AI Engine Layer: WASM統合・Worker管理
- LINE Integration Layer: プラットフォーム統合

サーバサイド(SSG)とクライアントサイド(動的ロジック)を明確に分離。

## Directory Patterns

### App Router Pages (`/app/`)

**Location**: `/app/`
**Purpose**: Next.js App Router、Server Components、静的ページ生成
**Example**:

- `page.tsx`: Server Component(SSG)、メタデータ・初期HTML
- `layout.tsx`: グローバルレイアウト
- `globals.css`: Tailwind CSSベーススタイル

### Source Code (`/src/`)

**Location**: `/src/`
**Purpose**: クライアント側実装、ゲームロジック、AI統合
**Example**:

- `/src/lib/game/`: ゲームドメインロジック(Pure Functions)
- `/src/lib/ai/`: AI Engine、WASM統合
- `/src/workers/`: Web Worker(WASM実行隔離)
- `/src/components/`: UIコンポーネント(将来的に実装)
- `/src/hooks/`: カスタムReact Hooks(将来的に実装)

### Game Logic (`/src/lib/game/`)

**Location**: `/src/lib/game/`
**Purpose**: リバーシルール実装(Pure Functions)
**Example**:

- `types.ts`: ゲームドメイン型定義(Player, Board, Position, GameState)
- `game-logic.ts`: 手の有効性・石配置・反転処理
- `move-validator.ts`: 反転可能石の検索
- `game-end.ts`: ゲーム終了判定・勝敗判定
- `board.ts`: ボード初期化・石数カウント
- `__tests__/`: ユニットテスト(90%カバレッジ目標)

### AI Engine (`/src/lib/ai/`)

**Location**: `/src/lib/ai/`
**Purpose**: WASM統合・メモリ管理・データ変換
**Example**:

- `types.ts`: WASM型定義・エラー型(Result型パターン)
- `ai-engine.ts`: 高レベルAPI(initialize, calculateMove)
- `wasm-bridge.ts`: WASM低レベル操作(encodeBoard, callAIFunction)
- `wasm-loader.ts`: WASMロード・初期化
- `__tests__/`: 統合テスト

### Web Workers (`/src/workers/`)

**Location**: `/src/workers/`
**Purpose**: UI非ブロックのWASM実行
**Example**:

- `ai-worker.ts`: Worker thread、WASM計算実行、Message通信

### Specifications & Settings (`/.kiro/`)

**Location**: `/.kiro/`
**Purpose**: Kiro開発フレームワーク設定・仕様書
**Example**:

- `/steering/`: プロジェクトメモリ(この文書含む)
- `/specs/`: 機能仕様書(Requirements, Design, Tasks)
- `/settings/`: ルール・テンプレート

## Naming Conventions

- **Files**: kebab-case (`game-logic.ts`, `ai-worker.ts`)
- **Types/Interfaces**: PascalCase (`GameState`, `Position`, `AIEngine`)
- **Functions**: camelCase (`validateMove`, `calculateValidMoves`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TIMEOUT_MS`)
- **Components**: PascalCase (`GameBoard.tsx`)

## Import Organization

```typescript
// 外部ライブラリ
import { useState } from 'react';

// 内部モジュール(絶対パス)
import { GameLogic } from '@/lib/game/game-logic';
import type { Board, Player } from '@/lib/game/types';

// 相対パス(同階層・サブディレクトリ)
import { validateMove } from './move-validator';
```

**Path Aliases**:

- `@/`: `/src/`にマップ(tsconfig.json設定)

## Code Organization Principles

### Layer Separation

- **Presentation → Logic**: 許可(UIからロジック呼び出し)
- **Logic → Presentation**: 禁止(Pure Functionsは依存なし)
- **WASM Bridge → Game Logic**: 禁止(境界を越えない)

### Pure Functions First

- Game Logicは全てPure Functions(副作用なし、Immutable)
- テスタビリティ・保守性重視
- State管理はReact Hooksに委譲

### Test Co-location

- `__tests__/`ディレクトリを実装と同階層に配置
- テストファイル名: `<module>.test.ts`形式

---

_created_at: 2025-10-21_
