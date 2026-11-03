## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Renewal design rules

- `/renewal/` のサイドバーは `renewal/org_png/01_ホーム画面.png` を基準にする。
- サイドバーはネオンロゴ、線画アイコン付きの9項目ナビ、固定コピーライトで構成する。メニュー番号は表示しない。
- サイドバー下部の「音楽でつながる、新しい仲間たち。」と、コピーライト上の街並み・装飾イラストは表示しない。
- ホーム上部のキャッチコピーには、ルートに配置された `あんずもじ2020/AP.ttf` を適用する。
- PC用デザイン画像に含まれるスマートフォン枠は実装せず、同一DOMをレスポンシブに変形する。
- SP画面のデザイン基準は、`renewal/org_png/01_ホーム画面.png` の右側にあるスマートフォン内の表示とする。
- SP画面では、ロゴ・ハンバーガーメニュー、ヒーロー、各コンテンツカード、ライブ情報、スケジュール、募集状況・申込み導線の順序と見え方をこのSPデザインに合わせる。
- スマートフォン内の表示は、PC版とは別ページ・別DOMを作らず、PC版と同一DOMをレスポンシブにレイアウト変形して実装する。
