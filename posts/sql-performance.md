---
title: SQL クエリのパフォーマンス改善
date: 2026-03-22
tags:
  - SQL
  - Database
  - Performance
---

アプリケーションが遅い原因の多くはデータベースにあります。インデックスの使い方から、よくあるアンチパターンまで、クエリ改善の基本を整理します。

<!-- more -->

## まず `EXPLAIN` で実行計画を確認する

チューニングの前に、データベースがどのようにクエリを実行しているか確認します。

```sql
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 123 AND status = 'pending';
```

注目するポイント:
- `Seq Scan` → テーブル全体を走査（遅い）
- `Index Scan` → インデックスを使用（速い）
- `rows` の見積もりと実際の差が大きい → 統計情報が古い

## インデックスを正しく使う

### 複合インデックスのカラム順序

複合インデックスは左端のカラムから順に効きます。

```sql
-- このインデックスは (user_id, status) の順
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 有効: user_id が先頭にある
SELECT * FROM orders WHERE user_id = 123 AND status = 'pending';
SELECT * FROM orders WHERE user_id = 123;

-- 無効: user_id を含まない
SELECT * FROM orders WHERE status = 'pending';
```

カーディナリティ（値の種類数）が高いカラムを先頭に置くのが基本です。

### インデックスが使われなくなるパターン

```sql
-- 関数をかけるとインデックスが効かない
WHERE UPPER(email) = 'USER@EXAMPLE.COM'  -- NG
WHERE email = 'user@example.com'          -- OK

-- 型が違うと暗黙変換でインデックスが効かないことがある
WHERE user_id = '123'  -- user_id が INTEGER の場合は注意

-- LIKE の前方一致はOK、後方一致はNG
WHERE name LIKE 'John%'   -- OK
WHERE name LIKE '%John'   -- NG（インデックス非効率）
```

## N+1 問題を避ける

ループの中でクエリを発行するのは最も頻繁に見るパフォーマンス問題です。

```sql
-- N+1: ユーザーごとに注文数を取得 (1 + N 回のクエリ)
SELECT * FROM users;
-- ↓ ループ内で N 回実行
SELECT COUNT(*) FROM orders WHERE user_id = ?;

-- 改善: JOIN で1回にまとめる
SELECT u.id, u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

## 不要なデータを取得しない

```sql
-- SELECT * は避ける
SELECT * FROM products;  -- NG

-- 必要なカラムだけ取得
SELECT id, name, price FROM products;  -- OK

-- LIMIT を忘れない
SELECT id, name FROM products
ORDER BY created_at DESC
LIMIT 20;
```

## サブクエリより JOIN を使う

相関サブクエリは行ごとに実行されるため遅くなりがちです。

```sql
-- 遅い: 相関サブクエリ
SELECT name,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) AS cnt
FROM users u;

-- 速い: JOIN で書き換え
SELECT u.name, COUNT(o.id) AS cnt
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id, u.name;
```

## まとめ

1. `EXPLAIN ANALYZE` で問題のあるクエリを特定する
2. 適切なインデックスを貼る（複合インデックスのカラム順に注意）
3. N+1 は JOIN でまとめる
4. `SELECT *` をやめ、必要なカラムだけ取得する

まずスロークエリログを有効にして、実際に遅いクエリを特定するところから始めましょう。
