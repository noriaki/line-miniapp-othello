# 実装計画

- [x] 1. ID生成ロジックの実装と単体テスト
  - セルIDを生成する純粋関数を実装する(行インデックス→列文字、列インデックス→行数字の変換)
  - 境界値テスト(左上隅セルa1、右下隅セルh8)を追加する
  - 中間値テスト(c4, e6等)で既存テストとの整合性を確認する
  - 全64セルのID一意性を検証するテストを追加する
  - ID形式が正規表現`/^[a-h][1-8]$/`に一致することを確認する
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 2. GameBoardコンポーネントへのID属性追加
- [x] 2.1 盤面セルへのID属性設定
  - GameBoard.tsxのセルレンダリングロジック(L434-459)にID生成関数を統合する
  - 各`<button>`要素のid属性にセルIDを設定する
  - 既存のkey, className, onClick, data-\*属性と共存させる
  - _Requirements: 1.1, 4.1_

- [x] 2.2 着手履歴コンポーネントへのID属性設定
  - GameBoard.tsxの履歴レンダリングロジック(L481-490)に固定ID "history"を追加する
  - `<div>`要素のid属性に"history"を設定する
  - 既存のdata-testid="move-history"属性と併用する
  - 条件付きレンダリング(notationString存在時のみ)を維持する
  - _Requirements: 2.1, 2.2, 2.4, 4.2_

- [x] 3. 統合テストの実装
- [x] 3.1 セルID属性の統合テスト
  - GameBoardコンポーネントをレンダリングし、特定セル(c4等)のid属性を検証する
  - 既存のdata-row, data-col属性との共存を確認する
  - DOM全体をスキャンしてID一意性を検証する
  - _Requirements: 1.7, 3.1, 4.1_

- [x] 3.2 履歴ID属性の統合テスト
  - notationString存在時に履歴コンポーネントのid="history"を検証する
  - notationString不在時に履歴コンポーネントが非表示であることを確認する
  - 既存のdata-testid属性との共存を確認する
  - _Requirements: 2.3, 3.1, 4.2_

- [x] 4. E2Eテストの実装と既存テスト互換性確認
- [x] 4.1 セルIDによるE2E要素選択テスト
  - Playwrightで`page.locator('#a1')`による左上隅セル選択を検証する
  - `page.locator('#h8')`による右下隅セル選択を検証する
  - `page.locator('#c4')`でセルをクリックし、ゲーム状態変化を確認する
  - data-row, data-col属性との整合性を検証する
  - _Requirements: 1.3, 1.4, 1.7_

- [x] 4.2 履歴IDによるE2E要素選択テスト
  - 初期状態で`page.locator('#history')`が非表示であることを確認する(notationString不在)
  - 着手後に`page.locator('#history')`で履歴コンポーネントを選択する
  - 履歴コンポーネント内に着手情報(座標等)が含まれることを確認する
  - 既存のdata-testidセレクタと新しいIDセレクタの両方が動作することを確認する
  - _Requirements: 2.1, 2.3, 2.4_

- [x] 4.3 既存E2Eテスト互換性確認
  - 既存の全E2Eテストスイートを実行しパスすることを確認する
  - ID属性追加後もゲーム体験が同一であることを確認する
  - ブラウザDevToolsコンソールでID重複警告がないことを手動検証する
  - _Requirements: 3.3, 4.3, 4.4_

- [x] 5. アクセシビリティ強化(必須)
- [x] 5.1 セルへのaria-label属性追加
  - 各セルに`aria-label="セル {id}"`を追加する(例: "セル a1")
  - スクリーンリーダーでの読み上げ動作を確認する
  - 統合テストでaria-label属性の存在を検証する(`screen.getByRole('button', { name: /セル a1/i })`)
  - 既存のaria-\*属性(スコア表示等)との共存を確認する
  - _Requirements: 5.1, 5.3_

- [x] 5.2 履歴コンポーネントのセマンティクス確認
  - 履歴コンポーネントが適切なコンテナ要素(`<div>`または`<section>`)を使用していることを確認する
  - aria-label等の支援技術向け属性を追加検討する
  - _Requirements: 5.2_

- [x] 6. 最終検証と統合確認
  - 全テストスイート(ユニット、統合、E2E)を実行し成功を確認する
  - ID属性の一意性(64個のセルID + 1個の履歴ID)を全レイヤーで検証する
  - 既存機能(クリックイベント、スタイリング、石配置、履歴表示)の動作確認を行う
  - ビルド(`pnpm build`)が成功することを確認する
  - TypeScript型チェック(`pnpm type-check`)が成功することを確認する
  - _Requirements: All requirements (総合確認)_
