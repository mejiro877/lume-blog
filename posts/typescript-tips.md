---
title: TypeScript 型安全テクニック
date: 2026-03-15
tags:
  - TypeScript
  - JavaScript
  - Frontend
---

TypeScript は「型を書けばいい」だけではなく、型システムをうまく使うことでバグを設計レベルで防げます。日常的に使えるテクニックをまとめます。

<!-- more -->

## `unknown` を `any` の代わりに使う

`any` は型チェックを完全に無効にしますが、`unknown` は「何か分からない値」として扱い、使う前に型チェックを強制します。

```typescript
// 危険: any はどこでも使えてしまう
function parseData(input: any) {
  return input.name.toUpperCase(); // 実行時エラーの可能性
}

// 安全: unknown は型ガードが必要
function parseData(input: unknown) {
  if (typeof input === "object" && input !== null && "name" in input) {
    return (input as { name: string }).name.toUpperCase();
  }
  throw new Error("Invalid input");
}
```

外部 API のレスポンスや JSON パースの結果には `unknown` を使いましょう。

## Discriminated Union で状態を表現する

フラグのような `boolean` の組み合わせより、Union 型で状態を明示するほうが安全です。

```typescript
// 問題: isLoading と error が同時に true になれる
type State = {
  isLoading: boolean;
  data: User | null;
  error: string | null;
};

// 改善: 状態が排他的になる
type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };

function render(state: State) {
  switch (state.status) {
    case "success":
      return state.data.name; // data が確実に存在する
    case "error":
      return state.error;     // error が確実に存在する
  }
}
```

## `satisfies` 演算子で型チェックしながら型推論を保つ

TypeScript 4.9 で追加された `satisfies` は、型の整合性を確認しつつ推論された型を保持します。

```typescript
type Config = {
  port: number;
  host: string;
};

// as を使うと推論が失われる
const config = { port: 3000, host: "localhost" } as Config;
config.port; // number

// satisfies なら具体的な型が残る
const config = { port: 3000, host: "localhost" } satisfies Config;
config.port; // 3000 (リテラル型)
```

設定オブジェクトの定義によく使います。

## 型ガード関数でナローイングを再利用する

同じ型チェックを複数箇所に書くなら、型ガード関数にまとめます。

```typescript
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function isSuccess<T>(res: ApiResponse<T>): res is { success: true; data: T } {
  return res.success === true;
}

const response = await fetchUser();
if (isSuccess(response)) {
  console.log(response.data); // T 型として使える
}
```

## `Readonly` と `as const` でミュータブルなバグを防ぐ

意図せず変更されては困るオブジェクトは読み取り専用にします。

```typescript
// 定数オブジェクト
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = typeof ROLES[number]; // "admin" | "editor" | "viewer"

// 関数の引数を変更不可にする
function process(config: Readonly<Config>) {
  // config.port = 8080; // エラー
}
```

## まとめ

- `any` より `unknown` — 型安全を保ちつつ柔軟に
- Discriminated Union — 状態管理を型で正確に表現
- `satisfies` — 型チェックと型推論を両立
- 型ガード関数 — ナローイングの再利用
- `as const` / `Readonly` — 不変性をコンパイル時に保証

型を「注釈」ではなく「設計ツール」として使うと、TypeScript の本領が発揮されます。
