import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const packageJsonUrl = new URL("../package.json", import.meta.url);
const layoutFileUrl = new URL("../app/layout.tsx", import.meta.url);
const globalCssUrl = new URL("../app/globals.css", import.meta.url);
const d1ExampleDirUrl = new URL("../examples/d1", import.meta.url);

async function readPackageJson() {
  return JSON.parse(await readFile(packageJsonUrl, "utf8"));
}

async function readUtf8(url) {
  return readFile(url, "utf8");
}

test("uses standard Next.js scripts for local development and deployment", async () => {
  const packageJson = await readPackageJson();

  assert.deepEqual(packageJson.scripts, {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "eslint .",
    test: "node --test tests/project-config.test.mjs",
  });
});

test("does not depend on vinext or worker-platform build tooling", async () => {
  const packageJson = await readPackageJson();
  const dependencyNames = [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ];

  assert.equal(dependencyNames.includes("vinext"), false);
  assert.equal(dependencyNames.includes("vite"), false);
  assert.equal(dependencyNames.includes("wrangler"), false);
  assert.equal(dependencyNames.includes("@cloudflare/vite-plugin"), false);
});

test("does not require remote Google Fonts during build", async () => {
  const [layoutSource, globalCssSource] = await Promise.all([
    readUtf8(layoutFileUrl),
    readUtf8(globalCssUrl),
  ]);

  assert.equal(layoutSource.includes('from "next/font/google"'), false);
  assert.equal(layoutSource.includes("Geist("), false);
  assert.equal(layoutSource.includes("Geist_Mono("), false);
  assert.equal(globalCssSource.includes("var(--font-geist-sans)"), false);
  assert.equal(globalCssSource.includes("var(--font-geist-mono)"), false);
});

test("does not keep template example code that pulls removed platform dependencies", () => {
  assert.equal(existsSync(d1ExampleDirUrl), false);
});
