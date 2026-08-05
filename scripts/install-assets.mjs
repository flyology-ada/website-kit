#!/usr/bin/env node

import { cp, mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requestedDestination = process.argv[2];
if (!requestedDestination) {
  console.error("usage: node scripts/install-assets.mjs <site-directory>");
  process.exit(2);
}

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const source = resolve(scriptDirectory, "../assets");
const destination = resolve(requestedDestination, "assets");

const sourceStat = await stat(source).catch(() => null);
if (!sourceStat?.isDirectory()) {
  console.error(`shared asset directory does not exist: ${source}`);
  process.exit(2);
}

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });

console.log(`Website kit assets installed at ${destination}`);
