---
title: 良い REST API 設計のための実践原則
date: 2026-03-29
tags:
  - API
  - Backend
  - Design
---

REST API は一度公開すると変更しにくいため、設計段階での判断が重要です。後悔しないための設計原則をまとめます。

## URL 設計はリソースで考える

URL はアクションではなくリソース（名詞）を表します。

```
# 悪い例: 動詞を使っている
GET  /getUsers
POST /createUser
POST /deleteUser?id=123

# 良い例: リソース + HTTP メソッドで表現
GET    /users          # 一覧取得
POST   /users          # 作成
GET    /users/123      # 1件取得
PUT    /users/123      # 全体更新
PATCH  /users/123      # 部分更新
DELETE /users/123      # 削除
```

階層関係は URL で表現します。

```
GET /users/123/orders        # ユーザー123の注文一覧
GET /users/123/orders/456    # 特定の注文
```

## HTTP ステータスコードを正しく使う

| コード | 意味 | 使いどころ |
|--------|------|-----------|
| 200 | OK | 取得・更新成功 |
| 201 | Created | リソース作成成功 |
| 204 | No Content | 削除成功（ボディなし） |
| 400 | Bad Request | バリデーションエラー |
| 401 | Unauthorized | 未認証 |
| 403 | Forbidden | 認可エラー（ログイン済みだが権限なし） |
| 404 | Not Found | リソースが存在しない |
| 409 | Conflict | 重複など競合 |
| 422 | Unprocessable Entity | 意味的に不正なリクエスト |
| 500 | Internal Server Error | サーバー側の予期しないエラー |

`200` をすべてに使ってエラーをボディで返すのはやめましょう。

## エラーレスポンスを統一する

エラー時のレスポンス形式を統一しておくと、クライアント側の実装が楽になります。

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力値が不正です",
    "details": [
      { "field": "email", "message": "有効なメールアドレスを入力してください" },
      { "field": "age", "message": "18歳以上である必要があります" }
    ]
  }
}
```

`code` にはマシンリーダブルな文字列を入れると、クライアントがプログラムで判定できます。

## バージョニング

API を公開した後に破壊的変更をする場合はバージョンを切ります。

```
# URL パスにバージョンを含める（最も一般的）
/v1/users
/v2/users

# ヘッダーでバージョン指定（URL をきれいに保ちたい場合）
Accept: application/vnd.myapp.v2+json
```

## ページネーション

大量データの取得にはページネーションを必ず実装します。

```
# カーソルベース（SNS のような無限スクロールに向く）
GET /posts?cursor=eyJpZCI6MTAwfQ&limit=20

# オフセットベース（ページ番号指定に向く）
GET /products?page=3&per_page=20
```

レスポンスには次のページの情報を含めます。

```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "eyJpZCI6MTIwfQ",
    "has_more": true
  }
}
```

## まとめ

- URL はリソース（名詞）で設計する
- HTTP メソッドとステータスコードのセマンティクスに従う
- エラーレスポンスの形式を統一する
- 公開後の変更にはバージョニングで対応
- 一覧取得には必ずページネーションを

設計に迷ったときは「クライアントを実装する人が直感的に使えるか」を基準にすると判断しやすいです。
