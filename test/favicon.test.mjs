import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutSource = await readFile(
	new URL("../src/layouts/Layout.astro", import.meta.url),
	"utf8",
);

test("レイアウトは生成したファビコンを参照する", async () => {
	assert.match(layoutSource, /href="\/favicon-32\.png"/);
	assert.match(layoutSource, /href="\/apple-touch-icon\.png"/);
	assert.match(layoutSource, /href="\/favicon\.ico"/);

	const [favicon, appleIcon, legacyIcon] = await Promise.all([
		readFile(new URL("../public/favicon-32.png", import.meta.url)),
		readFile(new URL("../public/apple-touch-icon.png", import.meta.url)),
		readFile(new URL("../public/favicon.ico", import.meta.url)),
	]);

	assert.deepEqual([favicon.readUInt32BE(16), favicon.readUInt32BE(20)], [32, 32]);
	assert.deepEqual([appleIcon.readUInt32BE(16), appleIcon.readUInt32BE(20)], [180, 180]);
	assert.deepEqual([legacyIcon[6], legacyIcon[7]], [32, 32]);
});
