# Product Overview

LINEミニアプリプラットフォーム上で動作するリバーシ(オセロ)ゲーム。ユーザはLINEアプリ内でWebAssembly実装のAI(Egaroucid)と対戦し、スマートフォンに最適化されたシンプルで直感的なゲーム体験を得る。

## Core Capabilities

- **AI対戦**: WebAssembly(Egaroucid)による高性能なリバーシAIとの対戦
- **リアルタイムゲームロジック**: クライアント側で完結する石配置・反転・勝敗判定
- **LINE統合**: LINEミニアプリとしてシームレスに動作
- **レスポンシブUI**: スマートフォンに特化した直感的なタッチ操作

## Target Use Cases

- LINEユーザがアプリを離れずに手軽にゲームを楽しむ
- 一人でもAI相手に戦略的な対戦を楽しむ
- 待ち時間や隙間時間にカジュアルにプレイする

## Value Proposition

- **即座のアクセス**: LINEアプリ内で完結、インストール不要
- **高速な動作**: SSG(Static Site Generation)による2秒以内の初期表示
- **オフライン対応**: 全処理がブラウザローカルで完結
- **高性能AI**: C++実装のWASMエンジンによる挑戦的なゲーム体験

## Non-Goals

- マルチプレイヤー対戦(ユーザ同士の対戦)
- ゲーム履歴の永続化やランキング
- 将来的な機能拡張(初期リリースはシンプルに集中)

## Current Implementation Status

- **LINE統合**: 現在はスタンドアロンWebアプリとして実装。LIFF SDK統合は将来的な拡張として計画中
- **Focus**: ゲームロジック、AI統合、レスポンシブUIの完成度優先

---

_created_at: 2025-10-21_
_updated_at: 2025-10-26_

**Recent Updates (2025-10-26)**:

- Clarified LINE integration current status (standalone web app, LIFF SDK planned for future)
