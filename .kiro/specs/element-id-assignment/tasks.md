# 実装計画

## 座標マッピング修正の背景

現在の実装は座標マッピングが要件と逆になっている:

- **現在(誤り)**: `rowIndex` → 列文字(a-h)、`colIndex` → 行数字(1-8)
- **要件(正しい)**: `colIndex` → 列文字(a-h)、`rowIndex` → 行数字(1-8)

要件の定義:

- Requirement 1 AC3: "左上隅(列a、行1)に位置するセル SHALL `id="a1"` 属性を持つ"
- Requirement 1 AC4: "右下隅(列h、行8)に位置するセル SHALL `id="h8"` 属性を持つ"
- Requirement 1 AC5: "列方向の位置が0から7のインデックスで管理される THE ゲームボードUI SHALL インデックスをa-hの文字に変換する(0→a, 1→b, ..., 7→h)"
- Requirement 1 AC6: "行方向の位置が0から7のインデックスで管理される THE ゲームボードUI SHALL インデックスを1-8の数字に変換する(0→1, 1→2, ..., 7→8)"

視覚的な配置:

- 左上隅 `board[0][0]` → `id="a1"` (colIndex=0 → 'a', rowIndex=0 → 1)
- 右下隅 `board[7][7]` → `id="h8"` (colIndex=7 → 'h', rowIndex=7 → 8)
- 最上行 (rowIndex=0): `a1, b1, c1, d1, e1, f1, g1, h1` (左→右、colIndexが増加)

このタスクリストはTDDアプローチで修正を実施する:

1. テストを更新して正しいマッピングを期待値として設定
2. 実装を修正してテストを通す
3. 統合・E2Eテストで検証

## タスク一覧

- [ ] 1. 座標マッピング修正: テスト更新と実装修正 (TDD)
  - `/src/lib/game/__tests__/cell-id.test.ts`のテストコメントと期待値を正しいマッピングに更新する
  - `/src/lib/game/__tests__/move-history.test.ts`のテストコメントを正しいマッピングに更新する
  - `/src/lib/game/cell-id.ts`の実装を修正する(2行: `colIndex → 列文字(a-h)`, `rowIndex → 行数字(1-8)`)
  - `/src/lib/game/move-history.ts`の実装を修正する(2行: `col → 列文字(a-h)`, `row → 行数字(1-8)`)
  - ユニットテストを実行して全てパスすることを確認する(`pnpm test`)
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 2. GameBoardコンポーネントへのID属性追加
- [ ] 2.1 盤面セルへのID属性設定と統合テスト
  - GameBoard.tsxのセルレンダリングロジック(L434-459)にID生成関数を統合する
  - 各`<button>`要素のid属性に修正済みのセルIDを設定する
  - 既存のkey, className, onClick, data-\*属性と共存させる
  - `/src/components/GameBoard.test.tsx`で特定セルのid属性を検証する統合テストを追加する
  - DOM全体をスキャンしてID一意性を検証する統合テストを追加する
  - 既存のdata-row, data-col属性との共存を確認する統合テストを追加する
  - 統合テストを実行してパスすることを確認する(`pnpm test`)
  - _Requirements: 1.1, 1.7, 3.1, 4.1_

- [x] 2.2 着手履歴コンポーネントへのID属性設定(完了)
  - GameBoard.tsxの履歴レンダリングロジック(L484-495)に固定ID "history"を追加済み
  - `<div>`要素のid属性に"history"を設定済み
  - 既存のdata-testid="move-history"属性と併用済み
  - 条件付きレンダリング(notationString存在時のみ)を維持済み
  - _Requirements: 2.1, 2.2, 2.4, 4.2_

- [ ] 3. E2Eテストの更新と既存テスト互換性確認
- [ ] 3.1 セルID選択E2Eテストの更新
  - `/e2e/element-id-assignment.spec.ts`のテストコメントと期待値を正しいマッピングに更新する
  - 左上隅セル(`#a1`)が`data-row="0" data-col="0"`であることを検証する
  - 右下隅セル(`#h8`)が`data-row="7" data-col="7"`であることを検証する
  - セル`#c4`をIDで選択してクリックし、ゲーム状態変化を確認する
  - E2Eテストを実行してパスすることを確認する(`pnpm test:e2e`)
  - _Requirements: 1.3, 1.4, 1.7_

- [x] 3.2 履歴ID選択E2Eテストの更新(完了)
  - `/e2e/move-history.spec.ts`のテストコメントを更新済み
  - 初期状態で`#history`が非表示であることを確認済み
  - 着手後に`#history`で履歴コンポーネントを選択できることを確認済み
  - 履歴コンポーネント内に正しい着手情報が含まれることを確認済み
  - data-testidセレクタとIDセレクタの両方が動作することを確認済み
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 3.3 既存E2Eテスト互換性確認
  - 既存の全E2Eテストスイートを実行しパスすることを確認する(`pnpm test:e2e`)
  - ID属性追加後もゲーム体験が同一であることを確認する
  - ブラウザDevToolsコンソールでID重複警告がないことを手動検証する
  - _Requirements: 3.3, 4.3, 4.4_

- [ ] 4. アクセシビリティ強化(必須)
- [ ] 4.1 セルへのaria-label属性追加
  - GameBoard.tsxの各セルに`aria-label="セル {id}"`を追加する(例: "セル a1")
  - 統合テストでaria-label属性の存在を検証する(`screen.getByRole('button', { name: /セル a1/i })`)
  - 既存のaria-\*属性(スコア表示等)との共存を確認する
  - 統合テストを実行してパスすることを確認する(`pnpm test`)
  - _Requirements: 5.1, 5.3_

- [ ] 4.2 履歴コンポーネントのセマンティクス確認
  - 履歴コンポーネントが適切なコンテナ要素(`<div>`または`<section>`)を使用していることを確認する
  - aria-label等の支援技術向け属性を追加検討する
  - _Requirements: 5.2_

- [ ] 5. 最終検証と統合確認
  - 全テストスイート(ユニット、統合、E2E)を実行し成功を確認する
  - ID属性の一意性(64個のセルID + 1個の履歴ID)を全レイヤーで検証する
  - 既存機能(クリックイベント、スタイリング、石配置、履歴表示)の動作確認を行う
  - ビルド(`pnpm build`)が成功することを確認する
  - TypeScript型チェック(`pnpm type-check`)が成功することを確認する
  - _Requirements: All requirements (総合確認)_

## TDDワークフロー

タスク1から順に実行することで、以下のTDDサイクルを実現:

1. **Red**: テストを更新して正しいマッピングを期待(テスト失敗)
2. **Green**: 実装を修正してテストを通す
3. **Refactor**: 統合・E2Eテストで全体動作を検証

各タスクは1-3時間で完了可能なサイズに分割されている。
