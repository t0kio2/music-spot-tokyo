import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
	new URL("../src/pages/faq.astro", import.meta.url),
	"utf8",
);

test("FAQ 本文は上から下へ展開する", () => {
	assert.match(source, /\.faq-item::details-content\s*{[\s\S]*?block-size:\s*0;[\s\S]*?transition:/);
	assert.match(source, /\.faq-item\[open\]::details-content\s*{[\s\S]*?block-size:\s*auto;/);
});

test("FAQ のアニメーションは低モーション設定に従う", () => {
	assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
	assert.match(source, /\.faq-item::details-content\s*{\s*transition:\s*none;/);
});
