# lume-blog

[Lume](https://lume.land/) + Simple Blog テーマで構築した静的ブログです。  
Docker で開発し、GitHub Actions で GitHub Pages へ自動デプロイします。

**公開URL:** https://mejiro877.github.io/lume-blog/

## 技術スタック

| 項目 | 内容 |
|------|------|
| 静的サイトジェネレーター | [Lume](https://lume.land/) 3.2.2 (Deno) |
| テーマ | [Simple Blog](https://github.com/lumeland/theme-simple-blog) 1.16.2 |
| 開発環境 | Docker (denoland/deno:latest) |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |

---

## セットアップ手順

### 前提条件

- Docker Desktop がインストール・起動済みであること
- Git がインストールされていること

### 1. プロジェクトの初期化

```powershell
mkdir lume-blog; cd lume-blog

# Lume プロジェクトを初期化（Simple Blog テーマ）
MSYS_NO_PATHCONV=1 docker run --rm `
  -v "C:/Users/<ユーザー名>/lume-blog:/app" `
  -w /app `
  denoland/deno:latest `
  run -A https://lume.land/init.ts --theme=simple-blog
```

> **PowerShell の注意点:** 行継続は `` ` ``（バッククォート）を使用。`-it` は PowerShell/Git Bash では動作しないため省略。

### 2. docker-compose.yml の作成

```yaml
services:
  lume:
    image: denoland/deno:latest
    working_dir: /app
    volumes:
      - .:/app
      - deno-cache:/deno-dir
    ports:
      - "3000:3000"
    environment:
      - DENO_DIR=/deno-dir
    command: task serve

volumes:
  deno-cache:
```

`deno.json` の serve タスクに `--port=3000 --hostname=0.0.0.0` を追加しておく。

### 3. 開発サーバーの起動

```powershell
docker compose up
```

`http://localhost:3000` でブラウザ確認できます。

> **Windows + Docker の注意点:** ホスト側のファイル変更がコンテナに伝わらないため、記事を追加した後は `docker compose restart lume` でリビルドが必要です。

---

## GitHub Pages へのデプロイ

### 1. `_config.ts` に location を設定

```typescript
const site = lume({
  location: new URL("https://<ユーザー名>.github.io/<リポジトリ名>/"),
});
```

> location を設定しないと CSS/JS のパスがルート参照になり、サブディレクトリ配信でレイアウトが崩れます。

### 2. GitHub Actions ワークフロー

`.github/workflows/deploy.yml` を作成します。

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: denoland/setup-deno@v2
        with:
          deno-version: v2.x
      - name: Build
        run: deno task build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 3. GitHub リポジトリの作成と push

```powershell
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 4. GitHub Pages の有効化

1. リポジトリの **Settings → Pages** を開く
2. Source を **GitHub Actions** に変更して保存

`main` への push のたびに自動ビルド・デプロイされます。

---

## ハマりどころと解決策

### 記事タグに日本語を使うとビルドが失敗する

**原因:** テーマの `archive_result.page.js` が日本語タグを URL スラッグに変換する際に空文字になり、`/archive//index.html` という重複パスが発生する。

**解決策:** タグは英語で記述する。

```yaml
# NG
tags:
  - フロントエンド

# OK
tags:
  - Frontend
```

### GitHub Pages でレイアウトが崩れる（ローカルは正常）

**原因:** `_config.ts` に `location` を設定していないと、CSS/JS パスがサイトルート (`/`) 基準になる。サブディレクトリ (`/lume-blog/`) 配信では `/styles.css` が存在しない。

**解決策:** `_config.ts` に `location` を設定する（上記参照）。

---

## カスタマイズ内容

### スタイル (`styles.css`)

- フォント: **M PLUS Rounded 1c**（本文）/ **Fira Code**（コード）
- 記事一覧: カード型レイアウト（ホバーエフェクト付き）
- ダークモード: OS 設定に自動対応
- カラー: ブルー系アクセントカラー

### 機能追加 (`_config.ts`)

- コードブロックに **Copy ボタン**を追加
- 外部リンクを**新しいタブ**で開く
- テーマの CSS コンポーネント (`_includes/css`) を出力ディレクトリにコピー

### 記事一覧の抜粋表示 (`_includes/templates/post-list.vto`)

テーマのデフォルトはタイトルのみ表示。記事一覧で冒頭テキストと「続きを読む」リンクを表示するようオーバーライドしています。

記事内で `<!-- more -->` を書いた位置までが一覧に表示されます。

```markdown
冒頭の紹介文をここに書きます。

<!-- more -->

## 見出し

以降は記事詳細画面のみに表示されます。
```

---

## 記事の書き方

`posts/` ディレクトリに Markdown ファイルを追加します。

```markdown
---
title: 記事タイトル
date: 2026-04-01
tags:
  - TypeScript
  - Backend
---

冒頭の紹介文（記事一覧に表示される）

<!-- more -->

## 本文の見出し

ここから先は記事詳細画面のみ表示されます。
```

記事を追加したら push するだけで自動デプロイされます。

```powershell
git add posts/
git commit -m "ADD: 記事タイトル"
git push origin main
```
