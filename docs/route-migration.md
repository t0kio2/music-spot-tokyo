# Renewalページのルート移行手順

## 目的

現在 `/renewal/` 配下で公開している新ページを、完全移行時にサイトのルートへ移す。

- 新ページ: `/renewal/` → `/`
- 旧ページ: ビルド対象外へ退避して保管する
- `/old/` は公開ページとして生成せず、アクセス不可にする

## 重要な方針

Astroの `src/pages/` 配下にファイルを置くと、静的ビルド時に公開URLが生成される。そのため、旧ページを `src/pages/old/` に移動して保管してはいけない。

旧ページのソースは、次のようなビルド対象外の場所に移す。

```text
docs/legacy/old-pages/
```

これにより、旧ページをGit上には残しつつ、`/old/` は生成されない。ホスティング側に既存の `/old/` ファイルが残っている場合は、デプロイ時に削除するか、サーバー設定で `/old/*` を `404` または `403` にする。

## ルートの対応表

| 現在のURL                   | 移行後のURL         |
| --------------------------- | ------------------- |
| `/renewal/`                 | `/`                 |
| `/renewal/application/`     | `/application/`     |
| `/renewal/archive/`         | `/archive/`         |
| `/renewal/archive/[id]/`    | `/archive/[id]/`    |
| `/renewal/faq/`             | `/faq/`             |
| `/renewal/flow/`            | `/flow/`            |
| `/renewal/history/`         | `/history/`         |
| `/renewal/music-selection/` | `/music-selection/` |
| `/renewal/overview/`        | `/overview/`        |
| `/renewal/past-songs/`      | `/past-songs/`      |
| `/renewal/precautions/`     | `/precautions/`     |
| `/renewal/schedule/`        | `/schedule/`        |

`/benefit/` や旧 `/setlist/` など、Renewal側に対応ページがない旧URLは、移行対象を決めてから扱う。対応ページが不要なら旧ソースを退避し、URLを生成しない。

## `renewal` 命名の完全撤去

ルート移行と同時に、実装上の `renewal` という名前も残さない。URLだけを変更して、コンポーネント名やCSS名に残すと、後から新旧の区別が必要になり続けるため、同じ移行で一括して名前を変更する。

### 変更対象

| 現在の名前の例                   | 移行後の例                                   |
| -------------------------------- | -------------------------------------------- |
| `/renewal/...`                   | `/...`                                       |
| `/api/renewal/...`               | `/api/...` または `/api/site/...`            |
| `src/pages/renewal/`             | `src/pages/`                                 |
| `src/components/renewal/`        | `src/components/must/`                       |
| `RenewalLayout.astro`            | `SiteLayout.astro` または `MustLayout.astro` |
| `RenewalHeader.astro`            | `SiteHeader.astro` または `MustHeader.astro` |
| `RenewalApplicationEvent.astro`  | `ApplicationEvent.astro`                     |
| `renewal-api.ts`                 | `site-api.ts` または `must-api.ts`           |
| `renewal.css`                    | `site.css` または `must.css`                 |
| `renewal-tokens.css`             | `site-tokens.css` または `must-tokens.css`   |
| `RenewalFeaturePanel.module.css` | `FeaturePanel.module.css`                    |
| `.renewal-*`                     | `.site-*` またはページ固有のクラス名         |
| `--renewal-*`                    | `--site-*` または意味に合う共通トークン名    |
| `data-renewal-*`                 | `data-site-*` または意味に合う属性名         |
| `src/assets/renewal/`            | `src/assets/site/` または用途別ディレクトリ  |

対象はファイル名だけではない。次もすべて検索・変更する。

- import、export、型名、関数名、変数名、props名
- Astroのコンポーネントタグ名
- HTMLのclass、id、data属性
- CSS Modulesのクラス名とグローバルセレクタ
- CSSカスタムプロパティ名
- APIエンドポイント、fetch URL、キャッシュキー
- CMSのページパス判定、canonical URL、sitemap対象URL
- `alt`、aria-label、コメント、ログ、エラーメッセージ
- `README.md`、`AGENTS.md`、`CLAUDE.md`、docs、スクリプト、バックアップ名

### 推奨する改名順

1. `src/components/renewal/`、`src/styles/renewal*`、`src/assets/renewal/` を新しい名前へ移す。
2. `Renewal*` のコンポーネント名、型名、APIモジュール名を変更する。
3. CSSの `.renewal-*`、`--renewal-*`、`data-renewal-*` を変更する。
4. `src/pages/renewal/` のページをルートへ移し、相対importを修正する。
5. `/api/renewal/` を新しいAPIパスへ移し、呼び出し元を修正する。
6. ナビゲーション、CTA、パンくず、404、CMSパス、canonical、sitemapを修正する。
7. 旧ファイルを `docs/legacy/old-pages/` へ退避する。退避先のファイル名にも `renewal` を残さない。

大量の単純置換を行う場合でも、URLとCSSクラスを同じ置換規則で機械的に変更しない。URL、コンポーネント、CSS、APIはそれぞれの命名規則に合わせて確認する。

### 最終検索

生成物や依存パッケージを除外して、大小文字を無視した検索結果を0件にする。

```sh
rg -n -i 'renewal' \
  src public docs scripts astro.config.mjs package.json README.md AGENTS.md CLAUDE.md \
  -g '!docs/route-migration.md'
```

次も確認する。

```sh
rg -n -i 'renewal' dist || true
find src/pages -type f -path '*renewal*' -print
find src/components -type f -path '*renewal*' -print
find src/styles src/assets -type f -path '*renewal*' -print
```

`dist/` はビルド前の古いファイルが残ることがあるため、クリーンな出力ディレクトリでビルドして確認する。Basic認証下で外部利用されていない `/renewal/` URLは、301設定を残さず削除する。

## 実施手順

### 1. 移行前の確認

```sh
npm run build
find dist -type f | sort
```

次を記録する。

- 現在の旧URL一覧
- `/renewal/` 配下の新URL一覧
- CMS APIが参照しているページ設定のパス
- 外部リンク、SNSプロフィール、広告、Search Consoleに登録しているURL

### 2. 旧ルートページを退避する

現在の旧ルートページを `docs/legacy/old-pages/` に移す。対象例:

```text
src/pages/index.astro
src/pages/application.astro
src/pages/benefit.astro
src/pages/faq.astro
src/pages/flow.astro
src/pages/overview.astro
src/pages/precautions.astro
src/pages/schedule.astro
src/pages/setlist.astro
```

旧ページが参照する専用CSSや画像を新ページが使っていない場合も、同じ退避ディレクトリまたはGit履歴に残す。ただし `src/assets/` から移す場合は、新ページのimportがないことを `rg` で確認する。

### 3. Renewalページをルートへ移す

`src/pages/renewal/` のページを `src/pages/` 直下へ移す。移動後は相対importの階層が1つ浅くなるため、次を修正する。

- `../../components/renewal/` → `../components/renewal/`
- `../../layouts/` → `../layouts/`
- `../../lib/` → `../lib/`
- `../../styles/` → `../styles/`
- アセットの相対パス

`index.module.css` のようなページ隣接ファイルも、対応するページと一緒に移動する。

### 4. パス依存の実装を更新する

次を検索して、`/renewal/` 前提を新ルートに直す。

```sh
rg -n '(/renewal/|renewal/application|renewal/archive|Astro\.url\.pathname)' src public astro.config.mjs
```

特に確認する箇所:

- 共通ヘッダー・サイドバーのリンク
- フッター、CTA、パンくず
- `RenewalLayout.astro` の `/renewal/application/` 判定
- Canonical URLとCMSの `page_settings` のパス
- SEO descriptionのページ判定
- APIエンドポイントのURL
- `404.astro` のホームリンク

### 5. 旧 `/renewal/` URLを削除する

`/renewal/` はBasic認証下で外部利用されておらず、アクセスされていない前提のため、新URLへの301リダイレクトは設定しない。`src/pages/renewal/` を削除または退避し、`/renewal/*` はファイルが存在しない状態にする。

```text
/renewal/                    → 404
/renewal/application/        → 404
/renewal/faq/                → 404
/renewal/archive/            → 404
/renewal/archive/[id]/      → 404
```

移行後にBasic認証の設定から `/renewal` 用ルールも削除する。ホスティング側に古い静的ファイルが残っている場合は、デプロイ時に削除する。

### 6. `/old/` を公開しない

確認事項:

- `src/pages/old/` を作らない
- `public/old/` に旧HTMLを置かない
- `dist/old/` が生成されていないことを確認する
- 既存ホスティングの残存ファイルを削除する
- CDNやホスティングに `/old/*` のdeny設定が必要か確認する

`/old/` を明示的に404にしたい場合は、ホスティング側のルールを優先する。静的サイトでは、存在するHTMLファイルをアプリ側だけで隠すことはできない。

### 7. ビルドとURL検証

```sh
npm run build
test ! -e dist/old
test -f dist/index.html
test -f dist/application/index.html
test -f dist/archive/index.html
test -f dist/faq/index.html
test -f dist/overview/index.html
test -f dist/history/index.html
git diff --check
```

デプロイ後は、次を確認する。

- `/` がRenewalホームになる
- 新ルートの全ページが200で表示される
- `/renewal/` と `/renewal/*` が404になる
- `/old/` と `/old/*` が404または403になる
- Canonical、sitemap、robots.txtに旧URLが残っていない
- 内部リンクに `/renewal/` が残っていない
- PCとSPの表示が移行前と同じである

## ロールバック

移行直後に問題が出た場合は、旧ページの退避先から `src/pages/` へ戻すのではなく、Gitで移行コミットを戻して復旧する。ルート変更と旧ページ退避は、1コミットまたは少数の関連コミットにまとめると戻しやすい。

## 完了条件

- 新ページがルートで表示される
- 旧ページのソースはGit上に保管されている
- `/old/` は公開されていない
- 旧 `/renewal/` URLが削除されている
- sitemap、canonical、内部リンクが新ルートに揃っている
- `npm run build` とURL検証が成功している
