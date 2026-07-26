import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const packageJsonUrl = new URL("../package.json", import.meta.url);
const layoutFileUrl = new URL("../app/layout.tsx", import.meta.url);
const globalCssUrl = new URL("../app/globals.css", import.meta.url);
const d1ExampleDirUrl = new URL("../examples/d1", import.meta.url);
const drizzleDirUrl = new URL("../drizzle", import.meta.url);
const agentsFileUrl = new URL("../AGENTS.md", import.meta.url);
const bunLockUrl = new URL("../bun.lock", import.meta.url);
const packageLockUrl = new URL("../package-lock.json", import.meta.url);
const nestedProjectDirUrl = new URL("../sapphire-learning-hub", import.meta.url);
const readmeUrl = new URL("../README.md", import.meta.url);

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
    "create-admin": "bun scripts/create-admin.ts",
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

test("does not keep unused Drizzle metadata after removing database tooling", () => {
  assert.equal(existsSync(drizzleDirUrl), false);
});

test("uses bun as the only package manager", async () => {
  const packageJson = await readPackageJson();

  assert.equal(packageJson.packageManager, "bun@1.3.10");
  assert.equal(existsSync(bunLockUrl), true);
  assert.equal(existsSync(packageLockUrl), false);
});

test("documents repo-specific agent rules in AGENTS.md", async () => {
  const agentsSource = await readUtf8(agentsFileUrl);

  assert.equal(agentsSource.includes("bun"), true);
  assert.equal(agentsSource.includes("Conventional Commits"), true);
  assert.equal(agentsSource.includes("app/"), true);
});

test("keeps the workspace root as the project root", () => {
  assert.equal(existsSync(nestedProjectDirUrl), false);
});

test("README uses bun-based workflow examples", async () => {
  const readmeSource = await readUtf8(readmeUrl);

  assert.equal(readmeSource.includes("bun install"), true);
  assert.equal(readmeSource.includes("bun run dev"), true);
  assert.equal(readmeSource.includes("npm install"), false);
  assert.equal(readmeSource.includes("npm run dev"), false);
});

test("keeps runtime dependencies to the approved allowlist", async () => {
  const packageJson = await readPackageJson();

  assert.deepEqual(Object.keys(packageJson.dependencies).sort(), [
    "mysql2",
    "next",
    "react",
    "react-dom",
  ]);
});

test("keeps the expected backend and admin route layout", () => {
  const routes = [
    "../app/api/join/route.ts",
    "../app/api/announcements/route.ts",
    "../app/api/visits/route.ts",
    "../app/api/admin/login/route.ts",
    "../app/api/admin/repos/route.ts",
    "../app/api/admin/repos/sync/route.ts",
    "../app/admin/page.tsx",
    "../app/admin/login/page.tsx",
    "../app/admin/repos/page.tsx",
    "../instrumentation.ts",
  ];
  for (const route of routes) {
    assert.equal(
      existsSync(new URL(route, import.meta.url)),
      true,
      `${route} should exist`,
    );
  }
});

test("keeps the home page a server component", async () => {
  const pageSource = await readUtf8(new URL("../app/page.tsx", import.meta.url));

  assert.equal(pageSource.includes('"use client"'), false);
});

test("keeps SQL and schema definitions inside lib/", async () => {
  const dbSource = await readUtf8(new URL("../lib/db.ts", import.meta.url));

  assert.equal(dbSource.includes("CREATE TABLE IF NOT EXISTS"), true);
  const routeSources = await Promise.all(
    [
      "../app/api/join/route.ts",
      "../app/api/announcements/route.ts",
      "../app/api/visits/route.ts",
    ].map((route) => readUtf8(new URL(route, import.meta.url))),
  );
  for (const source of routeSources) {
    assert.equal(source.includes("CREATE TABLE"), false);
    assert.equal(source.includes("createPool"), false);
  }
});

test("README documents the backend environment variables", async () => {
  const readmeSource = await readUtf8(readmeUrl);

  assert.equal(readmeSource.includes("DATABASE_URL"), true);
  assert.equal(readmeSource.includes("SESSION_SECRET"), true);
  assert.equal(readmeSource.includes("create-admin"), true);
});

test("keeps an env example file in sync with documented variables", async () => {
  const envExample = await readUtf8(new URL("../.env.example", import.meta.url));

  assert.equal(envExample.includes("DATABASE_URL"), true);
  assert.equal(envExample.includes("SESSION_SECRET"), true);
  assert.equal(envExample.includes("GITHUB_TOKEN"), true);
});
