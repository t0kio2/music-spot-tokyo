import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutSource = await readFile(
	new URL("../src/layouts/Layout.astro", import.meta.url),
	"utf8",
);
const headerSource = await readFile(
	new URL("../src/components/Header.astro", import.meta.url),
	"utf8",
);

test("サイトは画面高に固定され本文だけがスクロールする", () => {
	assert.match(layoutSource, /\.site\s*{[\s\S]*?height:\s*100svh;[\s\S]*?overflow:\s*hidden;/);
	assert.match(layoutSource, /\.content\s*{[\s\S]*?position:\s*fixed;[\s\S]*?overflow-y:\s*auto;/);
});

test("フッターは本文スクロール領域の末尾に表示する", () => {
	assert.match(layoutSource, /<main class="content">[\s\S]*?<slot \/>[\s\S]*?<Footer \/>[\s\S]*?<\/main>/);
	assert.doesNotMatch(layoutSource, /<\/div>\s*<Footer \/>/);
});

test("サイドバーは画面高に固定する", () => {
	assert.match(headerSource, /\.sidebar\s*{[\s\S]*?position:\s*fixed;[\s\S]*?height:\s*100svh;/);
	assert.match(headerSource, /\.topbar\s*{[\s\S]*?position:\s*fixed;/);
});
