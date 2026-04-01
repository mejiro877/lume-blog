---
title: チーム開発で使う Git ブランチ戦略まとめ
date: 2026-03-08
tags:
  - Git
  - Teamwork
  - Workflow
---

個人開発では `main` ブランチだけで事足りますが、チームで開発するとブランチ管理が重要になります。代表的な戦略と、それぞれの使いどころを整理します。

## GitHub Flow — シンプルで速い

最もシンプルな戦略です。ブランチは `main` と `feature/*` の2種類だけ。

```
main
  └── feature/add-login
  └── feature/fix-typo
```

**手順:**

1. `main` から `feature/xxx` を切る
2. 実装して PR を出す
3. レビュー後に `main` へマージ
4. すぐデプロイ

**向いている場面:** 継続的デプロイができるプロダクト、スタートアップ、小〜中規模チーム。

```bash
git switch main
git pull origin main
git switch -c feature/add-login

# 実装...

git push origin feature/add-login
# → GitHub で PR を作成
```

## Git Flow — リリース管理が必要なとき

バージョン管理が必要なアプリ（モバイルアプリ、パッケージなど）向けです。

```
main          ← 本番リリース済みコード
develop       ← 開発統合ブランチ
  └── feature/xxx
  └── release/1.2.0
  └── hotfix/crash-fix
```

**ブランチの役割:**

| ブランチ | 役割 |
|---------|------|
| `main` | リリース済みコード |
| `develop` | 次のリリースへの統合 |
| `feature/*` | 機能開発 |
| `release/*` | リリース前の最終調整 |
| `hotfix/*` | 本番の緊急修正 |

複雑な分、厳密なリリース管理が可能です。

## コミットメッセージを統一する

どの戦略を採用しても、コミットメッセージのルールを決めておくと `git log` が読みやすくなります。

```
feat: ログイン機能を追加
fix: パスワードリセット時のエラーを修正
docs: README にセットアップ手順を追記
refactor: 認証ロジックをサービス層へ移動
chore: 依存ライブラリを更新
```

[Conventional Commits](https://www.conventionalcommits.org/) に従うと、CHANGELOGの自動生成もできます。

## PR のサイズは小さく保つ

ブランチ戦略と同じくらい重要なのが PR のサイズです。

- 1 PR = 1 つの目的
- 変更行数は 400 行以内を目安に
- レビュアーが 15 分で読み切れるくらいが理想

大きな機能はフラグで隠しながら小さく分割してマージするのが現実的です。

## まとめ

- 小〜中規模で CI/CD が整っているなら **GitHub Flow**
- バージョン管理が必要なら **Git Flow**
- いずれにせよコミットメッセージとPRサイズのルールは最初に決める

ツールよりもチームの合意が大切です。
