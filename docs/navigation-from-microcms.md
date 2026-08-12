# microCMS ページ一覧によるナビゲーション生成

## 目的と背景

ヘッダーのリンク先と表示名が `Header.astro` に重複定義されているため、microCMS の Page データを正とする。Page の `slug` をパス、`title` をリンクラベルとして利用し、CMS の更新をナビゲーションへ反映する。

## 影響範囲

- `src/lib/microcms.ts`: Page 一覧の取得関数
- `src/lib/page.ts`: slug のパス変換関数
- `src/components/Header.astro`: 固定配列を Page 一覧取得へ置換
- `test/navigation.test.mjs`: パス変換と API 利用の回帰テスト

データモデルと microCMS API スキーマの変更はない。

## 実装方針

1. `pages` エンドポイントから最大 100 件の Page を取得する。
2. API の返却順をナビゲーションの表示順として維持する。
3. `home` は `/`、その他の slug は前後のスラッシュを正規化して `/{slug}/` にする。
4. Header では Page の `title` をラベルとして使用する。

## 検証

- home、通常 slug、前後にスラッシュがある slug のパス変換をテストする。
- Header が固定 `navItems` ではなく Page 一覧を利用することをテストする。
- `astro build` で API 取得を含む静的生成を確認する。

## トレードオフ

ナビゲーションの順序は microCMS の一覧返却順に依存する。明示的な並び順が必要になった場合は、Page に順序フィールドを追加して API クエリへ指定する。
