# 実装計画

## 1. LIFF SDK導入と環境設定

- [ ] 1.1 LIFF SDKパッケージの追加と環境変数設定
  - `@line/liff`の最新安定版をpnpmでインストール
  - `.env.local`ファイルに`NEXT_PUBLIC_LIFF_ID`環境変数を追加（テンプレート）
  - `.env.example`ファイルを作成してLIFF ID設定例を記載
  - `.gitignore`に`.env.local`が既に含まれていることを確認
  - TypeScript型定義が正しくインポートされることを確認
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.4, 2.5_

## 2. LIFF型定義の集約実装

- [ ] 2.1 LIFF関連型定義ファイルの作成
  - `/src/lib/liff/types.ts`に全LIFF関連型定義を集約
  - `LiffProfile`型定義（LINE プロフィール情報）を実装
  - `LiffContextType`型定義（Context全体の型）を実装
  - `LiffClientInterface`型定義（LiffClient公開インターフェース）を実装
  - 既存の`/src/lib/game/types.ts`パターンに準拠した型配置を確保
  - 循環依存リスクを完全に回避する単一方向の依存関係を確立
  - _Requirements: 11.1, 11.2, 11.3_

## 3. LIFF統合レイヤーの実装

- [ ] 3.1 LiffClient（LIFF API Wrapper）の実装
  - `/src/lib/liff/liff-client.ts`を作成し、LIFF SDK APIをラップする型安全なクライアントを実装
  - `initialize()`でLIFF初期化を実行し、エラーをPromise rejectで返却
  - `isInClient()`と`isLoggedIn()`で実行環境とログイン状態を判定
  - `login()`と`logout()`でログイン・ログアウト処理を提供
  - `getProfile()`でLINEプロフィール情報を取得
  - `/src/lib/liff/types.ts`から`LiffClientInterface`をインポートして実装
  - TypeScript strict modeに準拠した型定義を実装
  - _Requirements: 1.3, 3.1, 3.2, 4.1, 4.2, 4.3, 11.1, 11.2_

- [ ] 3.2 LiffContext（React Context定義）の作成
  - `/src/contexts/LiffContext.tsx`を作成
  - `/src/lib/liff/types.ts`から`LiffContextType`をインポート
  - `createContext<LiffContextType>`でContext定義のみを実装（型定義は外部参照）
  - デフォルト値として初期状態を設定
  - _Requirements: 8.1, 8.2, 11.3_

- [ ] 3.3 LiffProvider（Provider実装）の実装
  - `/src/contexts/LiffProvider.tsx`を作成（Client Component）
  - `/src/lib/liff/types.ts`から型定義をインポート
  - `/src/lib/liff/liff-client.ts`から`LiffClient`をインポート
  - `useEffect`でLiffClientの`initialize()`を実行
  - LIFF ID環境変数の未設定時に警告ログを出力し、機能を無効化
  - 初期化成功時にログイン状態とプロフィール情報を取得
  - プロフィール取得エラー時もエラー状態に記録し、デフォルトアイコン表示を保証
  - 初期化失敗時にエラーメッセージを設定し、デフォルトUIモードに切り替え
  - LINEアプリ内実行時は自動的にプロフィール取得を試行
  - `"use client"`ディレクティブを使用してStatic Export対応を維持
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 10.1, 10.2, 10.3, 10.5, 12.1, 12.2_

- [ ] 3.4 useLiffカスタムフックの作成
  - `/src/hooks/useLiff.ts`を作成
  - LiffContextへのアクセスを提供するカスタムフックを実装
  - Provider外で使用された場合に明確なエラーメッセージを投げる
  - 既存の`useGameState`等と同様のパターンを踏襲
  - _Requirements: 8.1, 8.2_

## 4. GameBoardコンポーネントへのUI統合

- [ ] 4.1 プロフィールアイコン表示機能の追加
  - `src/components/GameBoard.tsx`に`useLiff`フックをインポート
  - プレーヤースコア表示部分にプロフィールアイコン表示領域を追加
  - `profile.pictureUrl`が存在する場合はLINEアイコンを表示
  - 画像読み込み失敗時またはプロフィール未取得時はデフォルトアイコンを表示
  - プロフィール画像を円形またはゲームUIに適した形状でレンダリング
  - `<img onError>`でフォールバック画像表示処理を実装
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 10.2_

- [ ] 4.2 外部ブラウザ用ログインボタンの追加
  - `isInClient === false && isLoggedIn === false`時にログインボタンを表示
  - ボタンクリック時に`useLiff`の`login()`関数を呼び出し
  - ログインなしでもゲームプレイを継続可能にする
  - ログイン成功後にプロフィール情報を表示
  - ネットワークエラー時にリトライオプションまたは継続プレイを提供
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 10.4_

- [ ] 4.3 ログイン状態のUI反映
  - ログイン済み状態ではプロフィール情報（アイコン、表示名）を表示
  - 未ログイン状態ではデフォルトUI要素（プレースホルダーアイコン）を表示
  - ログイン状態変化時に全ての関連UIコンポーネントを更新
  - LIFF初期化中は初期化状態を視覚的に表示
  - _Requirements: 3.5, 8.2, 8.3, 8.4_

## 5. app/layout.tsxへのProvider統合

- [ ] 5.1 LiffProviderのレイアウト統合
  - `app/layout.tsx`にLiffProviderをインポート
  - 既存のErrorBoundaryラップ構造を維持しつつProviderを追加
  - LiffProviderを全ページで利用可能にする
  - Server ComponentとClient Componentの境界を明確に保つ
  - _Requirements: 12.1, 12.3_

## 6. エラーハンドリングとフォールバック機能の実装

- [ ] 6.1 LIFF初期化エラーハンドリング
  - LIFF初期化失敗時にユーザーフレンドリーなエラーメッセージを表示
  - エラー内容を開発者コンソールに詳細ログ出力
  - LIFF機能なしでゲーム本体を動作させる
  - エラー状態を`error` stateで管理し、UIに反映
  - `useGameErrorHandler`とは分離し、LIFF専用エラーハンドリングを実装
  - _Requirements: 3.3, 10.1, 10.3_

- [ ] 6.2 プロフィール取得エラーハンドリング
  - プロフィール情報取得失敗時もエラー状態に記録
  - エラー状態を記録しつつ、デフォルトアイコン表示を保証
  - エラーログを開発者コンソールに出力
  - ゲームプレイを継続可能にする
  - `isReady=true`を維持し、LIFF機能自体は有効状態を保つ
  - _Requirements: 7.4, 7.6, 10.2_

- [ ] 6.3 環境変数未設定時のフォールバック
  - `NEXT_PUBLIC_LIFF_ID`未設定時に警告メッセージをコンソールに表示
  - LIFF機能を無効化し、通常モードでゲームを起動
  - _Requirements: 2.2, 10.5_

## 7. TypeScript型安全性とビルド対応の確保

- [ ] 7.1 TypeScript型定義の整備と検証
  - LIFF SDK型定義を活用したインターフェース定義を検証
  - `Profile | null`型でログイン状態を型安全に管理していることを確認
  - LIFF API呼び出しの返り値型が明示的に推論されることを確認
  - TypeScript Compilerで型エラーを検出できることを確認
  - `/src/lib/liff/types.ts`の型定義が循環依存なく参照されることを検証
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 7.2 Next.js Static Exportビルド検証
  - `next build`コマンドでStatic Export生成が成功することを確認
  - LIFF SDKコードがクライアントバンドルにのみ含まれることを確認
  - Server ComponentsでLIFF SDKを参照しないことを検証
  - 生成された静的HTMLファイルが正常に動作することを確認
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

## 8. テストとドキュメント

- [ ] 8.1 LIFF統合のテストモック設定
  - JestでLIFF SDKのモック実装を追加
  - `liff.init()`, `liff.isInClient()`, `liff.getProfile()`をモック関数として定義
  - LIFF統合コードをテストカバレッジ計算から除外する設定を追加
  - _Requirements: 9.1, 9.2, 9.4_

- [ ] 8.2 UIコンポーネントのテスト追加
  - GameBoardコンポーネントのプロフィールアイコン表示テストを作成
  - デフォルトアイコン表示のテストケースを追加
  - ログインボタン表示・非表示のテストを実装
  - useLiffフックのエラーハンドリングテストを追加
  - _Requirements: 9.1, 9.2_

- [ ] 8.3 実装ドキュメントの更新
  - LINEミニアプリ対応の実装手順をREADMEに追加
  - LIFF ID設定方法を環境変数ドキュメントに記載
  - トラブルシューティングガイドを作成
  - 新規ファイル構成の説明を追加（型定義集約、エラーハンドリング分離）
  - _Requirements: 全要件の実装完了確認_
