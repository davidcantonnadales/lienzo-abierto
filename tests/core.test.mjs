import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(
  new URL("../src/lib/catalog.ts", import.meta.url),
  "utf8",
);
const catalog = [...source.matchAll(/src:\s*["']([^"']+)["']/g)].map((m, i) => ({
  src: m[1],
  id: i,
}));
test("el catálogo público solo apunta a WebP locales existentes", async () => {
  assert.equal(catalog.length, 4);
  assert.equal(new Set(catalog.map((x) => x.id)).size, catalog.length);
  for (const art of catalog) {
    assert.match(art.src, /^\/art\/[a-z]+\.webp$/);
    const bytes = await readFile(
      new URL("../public" + art.src, import.meta.url),
    );
    assert.equal(bytes.subarray(8, 12).toString(), "WEBP");
    assert.ok(bytes.length > 1000);
  }
});
