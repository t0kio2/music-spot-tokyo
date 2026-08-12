import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
	new URL("../src/pages/schedule.astro", import.meta.url),
	"utf8",
);

test("スケジュールは先頭を開いたアコーディオンとして表示する", () => {
	assert.match(source, /upcoming\.map\(\(ev, i\) => \(/);
	assert.match(source, /<details class="schedule-item" open=\{i === 0\}>/);
	assert.match(source, /<summary>\{ev\.title\}<\/summary>/);
	assert.match(source, /<div class="prose schedule-content" set:html=\{ev\.content\} \/>/);
});

test("アコーディオン見出しにはタイトル以外の番号や日付を表示しない", () => {
	assert.doesNotMatch(source, /q-mark|Q\{i \+ 1\}/);
	assert.doesNotMatch(source, /dateFormatter|event_date\)\)<\/p>/);
});

test("本文は上から下へ展開し低モーション設定にも対応する", () => {
	assert.match(source, /\.schedule-item::details-content\s*{[\s\S]*?block-size:\s*0;[\s\S]*?transition:/);
	assert.match(source, /\.schedule-item\[open\]::details-content\s*{[\s\S]*?block-size:\s*auto;/);
	assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
});
