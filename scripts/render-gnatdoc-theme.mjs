#!/usr/bin/env node

import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requestedConfig = process.argv[2];
const requestedDestination = process.argv[3];
if (!requestedConfig || !requestedDestination) {
  console.error(
    "usage: node scripts/render-gnatdoc-theme.mjs <config.json> <destination>"
  );
  process.exit(2);
}

const requiredFields = Object.freeze({
  PAGE_TITLE: "pageTitle",
  INDEX_DESCRIPTION: "indexDescription",
  INDEX_TITLE: "indexTitle",
  CANONICAL_URL: "canonicalUrl",
  BRAND_LABEL: "brandLabel",
  NAVIGATION_HTML: "navigationHtml",
  INDEX_INTRODUCTION: "indexIntroduction",
  FOOTER_NOTE: "footerNote",
});

const configPath = resolve(requestedConfig);
const destination = resolve(requestedDestination);
const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(scriptDirectory, "../gnatdoc/html");
const templateRoot = join(sourceRoot, "template");
const staticRoot = join(sourceRoot, "static");

const config = JSON.parse(await readFile(configPath, "utf8"));
for (const field of Object.values(requiredFields)) {
  if (typeof config[field] !== "string" || config[field].length === 0) {
    console.error(`GNATdoc theme config requires a non-empty ${field} string`);
    process.exit(2);
  }
}

for (const directory of [templateRoot, staticRoot]) {
  const directoryStat = await stat(directory).catch(() => null);
  if (!directoryStat?.isDirectory()) {
    console.error(`GNATdoc theme directory does not exist: ${directory}`);
    process.exit(2);
  }
}

await mkdir(join(destination, "template"), { recursive: true });
await mkdir(join(destination, "static"), { recursive: true });

const templateNames = (await readdir(templateRoot)).filter((name) =>
  name.endsWith(".xhtml")
);
for (const name of templateNames) {
  const source = await readFile(join(templateRoot, name), "utf8");
  const rendered = source.replace(/\{\{([A-Z_]+)\}\}/g, (match, token) => {
    const field = requiredFields[token];
    if (!field) throw new Error(`unknown GNATdoc theme token: ${token}`);
    return config[field];
  });
  if (/\{\{[A-Z_]+\}\}/.test(rendered)) {
    throw new Error(`unresolved GNATdoc theme token in ${name}`);
  }
  await writeFile(join(destination, "template", name), rendered);
}

await cp(staticRoot, join(destination, "static"), {
  recursive: true,
  force: true,
});

console.log(`GNATdoc theme rendered at ${destination}`);
