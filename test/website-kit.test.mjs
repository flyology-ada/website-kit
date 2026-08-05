import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(script, ...arguments_) {
  const result = spawnSync(process.execPath, [join(repositoryRoot, "scripts", script), ...arguments_], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

test("renders both consumer GNATdoc themes without unresolved tokens", async (context) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "flyology-website-kit-"));
  context.after(() => rm(temporaryRoot, { recursive: true, force: true }));

  for (const consumer of ["flyology", "flyology-postgres"]) {
    const destination = join(temporaryRoot, consumer);
    const config = join(repositoryRoot, "test", "fixtures", consumer, "gnatdoc-theme.json");
    run("render-gnatdoc-theme.mjs", config, destination);

    const index = await readFile(join(destination, "template", "index.xhtml"), "utf8");
    assert.doesNotMatch(index, /\{\{[A-Z_]+\}\}/);
    assert.match(index, new RegExp(consumer === "flyology" ? "flyology.org/api" : "postgres.flyology.org/api"));
    assert.ok((await stat(join(destination, "static", "gnatdoc.css"))).isFile());
    assert.ok((await stat(join(destination, "static", "gnatdoc.js"))).isFile());
  }
});

test("installs browser assets and validates cache-busted references", async (context) => {
  const siteRoot = await mkdtemp(join(tmpdir(), "flyology-site-"));
  context.after(() => rm(siteRoot, { recursive: true, force: true }));

  run("install-assets.mjs", siteRoot);
  await writeFile(
    join(siteRoot, "index.html"),
    "<!doctype html><html lang='en'><head><meta name='viewport' content='width=device-width'><link rel='stylesheet' href='assets/styles/site.css?v=test'></head><body></body></html>"
  );

  run("check-site.mjs", siteRoot);
  assert.ok((await stat(join(siteRoot, "assets", "fonts", "geologica-latin-variable.woff2"))).isFile());
  assert.ok((await stat(join(siteRoot, "assets", "scripts", "ada-highlight.js"))).isFile());
});
