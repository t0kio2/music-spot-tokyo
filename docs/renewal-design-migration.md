# renewal デザイン移行設計

## 目的

`renewal/` にあるデザインモックを、Astro の実ページ（`src/pages`）へ段階的に反映する。
デザインとコンテンツの管理場所を分離し、公開ページでは既存のURL、SEO設定、microCMS連携、アクセシビリティを維持する。

## 現状の整理

### `renewal/` の位置づけ

- 9ページ分の独立したHTMLモック。
- 各HTMLにページ固有のCSS、ナビゲーション、フッター、レスポンシブCSSが含まれる。
- モック内には固定のイベント・FAQ・活動内容があり、外部のUnsplash画像URLも含まれる。
- ページごとにCSS変数、フォント、サイドバー幅、色名が異なるため、移行時に共通のデザイントークンへ統合する。
- `href="#"`、デモ用のメニュー表示など、モック固有の仮実装は公開ページへ持ち込まない。

### `src/` の現状
- `Layout.astro` がHTMLメタ情報、JSON-LD、GA4、共通レイアウトを担当する。
- `Header.astro` がmicroCMSの `pages` 一覧からナビゲーションを生成する。
- 静的本文は `pages` API、FAQは `faq` API、予定・過去ライブは `schedule_and_archive` APIから取得する。
- スケジュール、FAQ、過去ライブは `<details>` を使ったアコーディオンとして実装済み。
- `/benefit/` は既存サイトにあるが、今回のモック群には対応ページがない。
- テストはAstroコンポーネントを直接読み、重要なレイアウト・ナビゲーション・アニメーションの契約を検証している。

## ページとURLの対応

| モック | 公開URL | 移行先 | データ方針 |
| --- | --- | --- | --- |
| `01_ホーム.html` | `/` | `src/pages/index.astro` | ホーム本文は `pages` の `home`。予定カードは `schedule_and_archive` を利用 |
| `02_MuSTについて.html` | `/overview/` | `src/pages/overview.astro` | `pages` の `overview`。モックの特徴カードは本文表現へ反映 |
| `03_演奏曲について.html` | `/setlist/` | `src/pages/setlist.astro` | `past_songs_url`、`youtube_url`、過去イベントを利用 |
| `04_活動実績.html` | 要決定 | 新規ページまたは `/setlist/` のセクション | 現行APIに活動実績専用の型がないため、先に情報設計を決める |
| `05_過去のライブ.html` | `/setlist/` または新規URL | `src/pages/setlist.astro` で暫定対応 | `schedule_and_archive.schedules` の過去分を利用。別URLにする場合はcanonicalとリダイレクトを設計 |
| `06_参加までの流れ.html` | `/flow/` | `src/pages/flow.astro` | `pages` の `flow` |
| `07_よくある質問.html` | `/faq/` | `src/pages/faq.astro` | `faq` API。固定FAQは登録データに置き換える |
| `08_注意事項.html` | `/precautions/` | `src/pages/precautions.astro` | `pages` の `precautions` |
| `09_募集状況・申込み.html` | `/application/` または `/schedule/` | `src/pages/application.astro` | 申込み導線は `application`。イベント表示の正本は既存API |

### 既存ページとの扱い

`/benefit/` は対応するモックがないため、今回の移行ではURLと内容を維持する。ナビゲーションから削除する場合は、microCMSのページ一覧と合わせて判断し、孤立ページを作らない。

モックにある「メンバー」「退会事項」は、現行の `src/pages` とAPIに対応するページがない。仮リンクを追加せず、追加する場合はページ要件・URL・データ項目を別途定義する。

## 目標アーキテクチャ

### 責務分割

```text
src/layouts/Layout.astro
  ├─ SiteHeader / SiteNavigation
  ├─ PageHero
  ├─ page content
  └─ SiteFooter

src/components/
  ├─ SiteHeader.astro       共通ヘッダー、モバイルメニュー
  ├─ SiteNavigation.astro   microCMSのページ一覧をURLへ変換
  ├─ PageHero.astro         パンくず、タイトル、英字サブタイトル
  ├─ SectionHeading.astro   見出しとアクセント装飾
  ├─ EventCard.astro        予定・募集イベントの表示
  ├─ Accordion.astro        FAQ・イベント詳細・過去ライブ
  └─ SiteFooter.astro       共通フッター

src/styles/
  ├─ global.css             リセット、トークン、汎用要素
  ├─ tokens.css             色、書体、余白、境界、ブレークポイント
  └─ components.css         共通コンポーネントの見た目
```

既存の `Header.astro` と `Footer.astro` は、移行初期はファイル名を維持してもよい。責務が増えた時点で分割する。ページ固有のレイアウトは各ページに置き、複数ページで再利用する表示だけをコンポーネント化する。

### データフロー

1. ページが `getPageBySlug()`、`getFaqList()`、`getScheduleAndArchive()` を呼び出す。
2. 取得したデータを表示用コンポーネントへ渡す。
3. 表示用コンポーネントは日付の分類、空状態、リンク属性を担当する。
4. 固定データはデザイン上のラベル・装飾に限定し、イベント名、日時、会場、募集状況、FAQ本文はmicroCMSから取得する。

イベントの表現がモックどおり複雑になる場合は、既存の `ScheduleItem` だけで表現できる範囲を先に明確にする。出演パート別募集、会場、費用、画像などが必要なら、`api_schema` と `src/lib/microcms.ts` を同時に拡張する。

## デザインシステムへの統合

### 採用する方向性

- 深いネイビーを背景に、シアン・ピンク・ゴールドをアクセントにする。
- 日本語本文は可読性を優先したサンセリフ、見出し・手書き英字は用途を限定して使用する。
- サイドバー（デスクトップ）とモバイルヘッダーを共通レイアウトにする。
- ヒーロー、パンくず、セクション見出し、カード、ステータス、CTAを共通部品にする。
- 背景画像・写真は意味のあるコンテンツではなく装飾として扱い、取得不能でも本文を読めるようにする。

### 初期トークン案

既存の `global.css` の変数を置き換えるのではなく、まず以下へ寄せ、ページ単位の色指定を減らす。

```css
:root {
  --color-bg: #020b14;
  --color-bg-deep: #01070e;
  --color-surface: #031722;
  --color-surface-soft: #061d2a;
  --color-cyan: #00eaff;
  --color-pink: #ff4fd8;
  --color-gold: #ffc486;
  --color-text: #f5f8ff;
  --color-muted: #b8d3e1;
  --color-border: rgba(0, 234, 255, 0.64);
  --font-body: "Noto Sans JP", sans-serif;
  --font-display: "Zen Old Mincho", serif;
  --font-script: "Caveat", cursive;
  --sidebar-width: 166px;
  --content-width: 1120px;
}
```

値は移行中に画面比較で調整する。フォントはGoogle Fontsの読み込み失敗時にシステムフォントへフォールバックし、本文の可読性を損なわない。

## 実装フェーズ

### Phase 0: 仕様固定

- この設計のページ対応表を確定する。
- `04_活動実績.html` と `05_過去のライブ.html` のURL・情報設計を決める。
- `renewal` 内の外部画像を公開利用してよいか確認し、必要なら `public/images/` へ差し替える素材を用意する。
- 固定モックに含まれる将来日付や募集状況を、microCMSの実データとして登録するか判断する。

### Phase 1: 共通シェル

- デザイントークンと背景、書体、基本リンク・ボタンを整備する。
- `Header.astro` のサイドバー、モバイルメニュー、現在地表示をrenewalの構成へ寄せる。
- `Layout.astro` にヒーローとフッターを安全に組み込める拡張点を作る。
- 既存のGA4、canonical、JSON-LD、404、`no_ga` の挙動を維持する。

### Phase 2: データを持たないページ

次の順で、見た目と既存本文の表示を移行する。

1. `/overview/`
2. `/flow/`
3. `/precautions/`
4. `/faq/`

FAQは既存の `<details>` と低モーション対応を維持し、renewalのカード・見出しへ置き換える。

### Phase 3: イベント系ページ

- `/schedule/` をイベントカードと空状態を含むレイアウトへ変更する。
- `/setlist/` に過去ライブカード、外部リンク、動画リンクを移行する。
- `/application/` は申込みCTAを更新し、実際のフォームURLが存在する場合だけリンクする。
- イベントの日付による upcoming/past の分類、Event JSON-LD、タイムゾーンを回帰確認する。

### Phase 4: ホームと仕上げ

- `/` にヒーロー、次回ライブ、活動実績、参加CTAを配置する。
- 画像は遅延読み込み、`alt`、表示失敗時の背景を設定する。
- すべてのページでデスクトップ・タブレット・モバイルを確認する。

## アクセシビリティとSEOの要件

- 装飾アイコン、音符、背景画像には `aria-hidden="true"` を付ける。
- ナビゲーションはリンクの文字だけでも目的が分かるようにする。
- モバイルメニューはキーボードで操作でき、開閉状態を `aria-expanded` で表現する。現状のチェックボックス方式を維持する場合も、ラベルとの関連とフォーカス順を検証する。
- 見出し階層はページごとに `h1` を1つにし、カードの見出しを論理的に配置する。
- シアンやピンクを状態の唯一の手掛かりにせず、「募集中」「キャンセル待ち」などのテキストを必ず表示する。
- `Layout.astro` のtitle、description、canonical、OGP、JSON-LDをページ移行後も維持する。
- 新規URLを作る場合は既存URLとの重複を避け、必要に応じてcanonicalまたはリダイレクトを追加する。

## 検証計画

### 自動検証

- `npm test`
- `npm run build`
- `git diff --check`
- 既存テストに以下を追加する。
  - 全ページが `Layout` とページ固有の `h1` を利用する。
  - ナビゲーションのURLが実在するページへ解決される。
  - upcoming/past のイベント分類が維持される。
  - モバイルメニューのラベル、状態属性、主要リンクが存在する。
  - 画像に `alt` があり、外部画像に依存しない。

### 目視検証

- `astro dev --background` で起動し、デスクトップ幅、タブレット幅、390px前後のモバイル幅を確認する。
- `/`、`/overview/`、`/schedule/`、`/setlist/`、`/application/`、`/faq/`、`/precautions/`、`/flow/` を確認する。
- 長いタイトル、本文空欄、イベント0件、FAQ0件、画像読み込み失敗、`prefers-reduced-motion` を確認する。
- 本番ビルドでは `dist/` の全URL、sitemap、404、canonicalを確認する。

## 完了条件

- `renewal` の主要な視覚要素が `src/pages` の各公開ページで再現されている。
- コンテンツは固定HTMLではなく、既存のmicroCMSデータから表示される。
- 既存URL、SEOメタ情報、GA4、404、ナビゲーション、アコーディオンの挙動が壊れていない。
- デスクトップとモバイルの両方で、メニュー・リンク・フォーム導線を操作できる。
- `npm test` と `npm run build` が成功し、目視検証で重大なレイアウト崩れがない。

## 未決事項

1. 「活動実績」を独立URLにするか、ホームまたは過去ライブへ統合するか。
2. 「過去のライブ」を `/setlist/` の一部にするか、独立URLにするか。
3. 「メンバー」「退会事項」を公開ナビゲーションへ追加するか。
4. renewal内のUnsplash画像を利用するか、サイト固有素材へ差し替えるか。
5. 募集状況・出演パート・会場・費用をmicroCMSの新しい構造化フィールドで管理するか。

