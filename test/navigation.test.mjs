import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { pageSlugToPath } from "../src/lib/page.ts";

test("ホームの slug はルートパスに変換する", () => {
	assert.equal(pageSlugToPath("home"), "/");
});

test("通常ページの slug は末尾スラッシュ付きパスに変換する", () => {
	assert.equal(pageSlugToPath("overview"), "/overview/");
	assert.equal(pageSlugToPath("/overview/"), "/overview/");
});

test("ヘッダーは microCMS のページ一覧とタイトルを使用する", async () => {
	const source = await readFile(
		new URL("../src/components/Header.astro", import.meta.url),
		"utf8",
	);

	assert.match(source, /const pages = await getPageList\(\);/);
	assert.match(source, /pages\.map\(\(page\)/);
	assert.match(source, /\{page\.title\}/);
	assert.doesNotMatch(source, /const navItems\s*=/);
});
