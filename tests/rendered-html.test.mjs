import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Shanghai Minmeng history knowledge base", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>盟迹 · 上海民盟历史知识库<\/title>/i);
  assert.match(html, /51处历史现场/);
  assert.match(html, /16处传统教育阵地/);
  assert.match(html, /民盟是从爱国两个字上长出来的/);
  assert.match(html, /五处地址，/);
  assert.match(html, /南海花园饭店/);
  assert.match(html, /完整故事/);
  assert.doesNotMatch(html, /STORIES AT THE ADDRESS|中国科学院上海分院|杨斯盛临终最后惦记/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);
});

test("keeps architecture cross-reference content in the public site source", async () => {
  const [data, page, workflow, script] = await Promise.all([
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../scripts/build-pages.sh", import.meta.url), "utf8"),
  ]);

  assert.match(data, /architecture\?: \{ title: string; text: string \}\[\]/);
  assert.match(data, /const architecture:/);
  assert.match(page, /architecture-notes/);
  assert.match(data, /export const organizationHistory/);
  assert.match(data, /secondaryCategories: site\.id === "nanhai"/);
  assert.match(data, /supplementalStories/);
  assert.match(page, /organization-history\.jpg/);
  assert.doesNotMatch(page, /drawer-photo/);
  assert.doesNotMatch(page, /assetSrc\(selected\.image\)/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(script, /mengji-shanghai-history/);
});
