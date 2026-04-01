---
title: Dockerをゼロから理解する — イメージとコンテナの基礎
date: 2026-03-01
tags:
  - Docker
  - インフラ
  - 入門
---

Docker を使い始めたとき、「イメージ」と「コンテナ」の違いで混乱した経験はないでしょうか。この記事ではその概念を整理し、日常的な開発で使う基本コマンドをまとめます。

## イメージとコンテナの違い

**イメージ**はコンテナを起動するための設計図（テンプレート）です。読み取り専用で、`Dockerfile` から作られます。

**コンテナ**はイメージを実際に起動したものです。書き込み可能な実行環境で、何度でも起動・停止できます。

```
Dockerfile → (build) → イメージ → (run) → コンテナ
```

クラスとインスタンスの関係に近いイメージです。

## よく使うコマンド

```bash
# イメージを取得
docker pull node:22

# コンテナを起動（起動後すぐ削除）
docker run --rm node:22 node --version

# バックグラウンドで起動
docker run -d -p 3000:3000 --name my-app my-image

# 起動中のコンテナ一覧
docker ps

# コンテナの中に入る
docker exec -it my-app bash

# コンテナを停止・削除
docker stop my-app && docker rm my-app
```

## Dockerfile の基本構造

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

`COPY` と `RUN` はキャッシュが効くので、変更頻度の低いものを上に書くのがポイントです。`package.json` を先にコピーして `npm ci` することで、ソースコードを変えても依存関係の再インストールが走りません。

## docker compose を使う

複数コンテナを管理するときは `docker compose` が便利です。

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: password
```

```bash
docker compose up -d    # 起動
docker compose down     # 停止
docker compose logs -f  # ログ確認
```

## まとめ

Docker の基本は「イメージを作って、コンテナとして動かす」この一点です。最初は `docker run` と `docker compose up` だけ覚えておけば十分です。慣れてきたら `Dockerfile` の最適化（マルチステージビルドなど）に進みましょう。
