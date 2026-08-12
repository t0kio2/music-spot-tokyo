import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const indexSource = await readFile(
	new URL("../src/pages/index.astro", import.meta.url),
	"utf8",
);

test("ホーム画像は共通の最大幅を解除して本文幅を利用する", () => {
	assert.match(
		indexSource,
		/\.home\s+:global\(figure\)[\s\S]*?max-width:\s*none;/,
	);
});

test("ホーム画像は縦横比を保ち画面の高さ以内に収める", () => {
	assert.match(
		indexSource,
		/\.home\s+:global\(figure img\)[\s\S]*?width:\s*auto;[\s\S]*?max-width:\s*100%;[\s\S]*?height:\s*auto;[\s\S]*?max-height:\s*calc\(100svh - 8rem\);/,
	);
});
