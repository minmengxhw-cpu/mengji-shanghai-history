import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

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
  assert.match(html, /66(?:<!-- -->)?处历史现场/);
  assert.match(html, /16(?:<!-- -->)?处传统教育档案/);
  assert.match(html, /从(?:<!-- -->)?16(?:<!-- -->)?处传统教育基地/);
  assert.match(html, /民盟是从爱国两个字上长出来的/);
  assert.match(html, /南海花园饭店/);
  assert.match(html, /完整故事/);
  assert.match(html, /16(?:<!-- -->)?处基地/);
  assert.doesNotMatch(html, /STORIES AT THE ADDRESS|中国科学院上海分院|杨斯盛临终最后惦记/);
  assert.doesNotMatch(html, /上海民盟机关沿革 · 五处地址|organization-history\.jpg/);
  assert.doesNotMatch(html, /四人帮|文化大革命|右派|汉奸|特务|法西斯|杀头|酷刑|黑名单/);
  assert.doesNotMatch(html, /Your site is taking shape|codex-preview|react-loading-skeleton/i);

  assert.doesNotMatch(html, />0\d\d</);
  assert.match(html, /<b>今天<\/b><span>18<\/span>/);
  assert.match(html, /<b>04<\/b>文化与当代/);

  const bars = html.match(/class="district-bars"[\s\S]*?<\/div>\s*<\/section>/)?.[0] ?? "";
  const widths = bars.match(/width:([\d.]+)%/g) ?? [];
  assert.ok(widths.length >= 10, `expected district bars, got ${widths.length}`);
  assert.equal(widths.filter((width) => width === "width:100%").length, 1);
});

test("serves lightweight versions of all 16 verified site photos", async () => {
  const imageDirectory = new URL("../public/sites-optimized/", import.meta.url);
  const names = (await readdir(imageDirectory)).filter((name) => name.endsWith(".jpg"));
  assert.equal(names.length, 16);
  const sizes = await Promise.all(names.map((name) => stat(new URL(name, imageDirectory))));
  assert.ok(sizes.every((item) => item.size < 150_000), "each optimized photo should stay under 150 KB");
  assert.ok(sizes.reduce((sum, item) => sum + item.size, 0) < 1_600_000, "optimized photo set should stay under 1.6 MB");
});

test("keeps architecture cross-reference content in the public site source", async () => {
  const [data, page, styles, workflow, script] = await Promise.all([
    readFile(new URL("../app/data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../scripts/build-pages.sh", import.meta.url), "utf8"),
  ]);

  assert.match(data, /architecture\?: \{ title: string; text: string \}\[\]/);
  assert.match(data, /const architecture:/);
  assert.match(page, /architecture-notes/);
  assert.match(data, /const secondaryCategories:/);
  assert.match(data, /supplementalStories/);
  assert.match(data, /deepResearchStories/);
  assert.match(data, /周谷城旧居/);
  assert.match(data, /华东师范大学校史馆/);
  assert.match(data, /苏步青旧居/);
  assert.match(data, /谈家桢、陈建功旧居/);
  assert.match(data, /陈伯吹纪念馆/);
  assert.match(data, /丁聪美术馆/);
  assert.doesNotMatch(page, /organization-history\.jpg/);
  assert.doesNotMatch(page, /drawer-photo/);
  assert.doesNotMatch(page, /assetSrc\(selected\.image\)/);
  assert.doesNotMatch(page, /behavior:\s*["']smooth["']/);
  assert.doesNotMatch(styles, /scroll-behavior:\s*smooth/);
  assert.doesNotMatch(styles, /\.nav\{[^}]*position:sticky/);
  assert.doesNotMatch(styles, /\.drawer-index\{[^}]*position:sticky/);
  assert.match(page, /className="base-entry"/);
  assert.match(page, /role="button"/);
  assert.doesNotMatch(styles, /\.base-list button/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(script, /mengji-shanghai-history/);
  assert.match(script, /dist\/client\/sites-optimized/);
  assert.match(script, /pages_base=/);
  assert.match(script, /404\.html/);
});

test("keeps all 66 site dossiers substantial and residence addresses unique", async () => {
  const source = await readFile(new URL("../app/data.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function("exports", "module", compiled)(exports, { exports });

  assert.equal(exports.sites.length, 66);
  const residences = exports.sites.filter((site) =>
    site.category === "名人故居" || site.secondaryCategories?.includes("名人故居"));
  const normalizedAddresses = residences.map((site) =>
    site.address.replace(/[，,。.\s]/g, "").replace(/（[^）]*）/g, ""));
  assert.equal(new Set(normalizedAddresses).size, normalizedAddresses.length);
  assert.equal(exports.sites.find((site) => site.id === "li-home")?.category, "名人故居");
  assert.equal(exports.sites.find((site) => site.id === "yuyuan-749")?.name, "民盟上海市支部筹委会成立地");
  assert.ok(!exports.sites.some((site) => site.id === "liwen-report"));
  for (const site of exports.sites) {
    assert.ok(site.chapters.length >= 6, `${site.id} should have at least 6 story chapters`);
    const storyLength = site.story.length
      + site.chapters.reduce((sum, chapter) => sum + chapter.text.length, 0)
      + (site.architecture || []).reduce((sum, note) => sum + note.text.length, 0);
    assert.ok(storyLength >= 450, `${site.id} dossier is too short (${storyLength} chars)`);
  }
});
