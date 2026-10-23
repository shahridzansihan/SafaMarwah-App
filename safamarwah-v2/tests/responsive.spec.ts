import { test, expect } from "@playwright/test";
const routes = ["/", "/panduan", "/panduan/persediaan", "/doa", "/doa/doa-perjalanan", "/blog"];
for (const route of routes) {
  test(`layout fits viewport: ${route}`, async ({ page }) => {
    await page.goto("/#" + route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toBeVisible();
    const sizes = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    expect(sizes.page, `horizontal overflow on ${route}`).toBeLessThanOrEqual(sizes.viewport + 1);
    await expect(page.getByRole("link", { name: /SafaMarwah/i }).first()).toBeVisible();
  });
}
test("topic cards use responsive columns", async ({ page }) => {
  await page.goto("/#/panduan");
  await expect(page.locator(".article-grid > *")).toHaveCount(3);
  const grid = page.locator(".article-grid").first();
  const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
  const width = page.viewportSize()!.width;
  expect(cols).toBe(width >= 1200 ? 3 : width >= 768 ? 2 : 1);
});
test("removed pages do not render active content", async ({ page }) => {
  await page.goto("/#/waktu-solat");
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemui" })).toBeVisible();
});

test("modular pages retain correct content and breadcrumbs", async ({ page }) => {
  await page.goto("/#/panduan/persediaan");
  await expect(page.getByRole("heading", { name: "Persediaan Sebelum Berangkat" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Panduan Umrah" })).toBeVisible();
  await expect(page.locator(".page-content li")).toHaveCount(3);

  await page.goto("/#/doa/doa-perjalanan");
  await expect(page.getByRole("heading", { name: "Doa Perjalanan" })).toBeVisible();

  await page.goto("/#/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();

  await page.goto("/#/halaman-tiada");
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemui" })).toBeVisible();
});

test("removed v1 features stay unavailable", async ({ page }) => {
  for (const route of ["/kad-digital", "/alat-jemaah", "/waktu-solat"]) {
    await page.goto("/#" + route);
    await expect(page.getByRole("heading", { name: "Halaman tidak ditemui" })).toBeVisible();
  }
});

test("blog feed offers a retry action when Blogger is unreachable", async ({ page }) => {
  await page.route("https://www.safamarwah.my/feeds/posts/default**", route => route.abort());
  await page.goto("/#/blog");
  await expect(page.getByRole("button", { name: "Cuba Lagi" })).toBeVisible({ timeout: 20000 });
  await expect(page.getByRole("link", { name: /Baca terus di SafaMarwah/i })).toBeVisible();
});

test("blog exposes a refresh control", async ({ page }) => {
  await page.goto("/#/blog");
  await expect(page.getByRole("button", { name: "Segar Semula" })).toBeVisible();
});

test("Blogger categories fetch matching articles and reset to all", async ({ page }) => {
  await page.route(/safamarwah\.my\/feeds\/posts\/default/, async route => {
    const url = new URL(route.request().url());
    const callback = url.searchParams.get("callback") || "callback";
    const selected = decodeURIComponent(url.pathname.split("/-/")[1] || "");
    const first = Number(url.searchParams.get("start-index") || 1);
    const article = (id: string, label: string) => ({
      id: { $t: id }, title: { $t: id },
      content: { $t: "<p>Sample article</p>" },
      category: [{ term: label }],
      link: [{ rel: "alternate", href: "https://www.safamarwah.my/2026/10/" + id + ".html" }]
    });
    const entries = selected === "Doa" ? [article("doa-sample", "Doa")] : first > 1 ? [] : [article("panduan-sample", "Panduan")];
    const feed = { category: [{ term: "Panduan" }, { term: "Doa" }], entry: entries };
    await route.fulfill({ status: 200, contentType: "application/javascript", body: callback + "(" + JSON.stringify({ feed }) + ");" });
  });
  await page.goto("/#/blog");
  await expect(page.getByRole("button", { name: "Doa", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Doa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Doa", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "doa-sample" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "panduan-sample" })).toHaveCount(0);
  await page.getByRole("button", { name: "Semua", exact: true }).click();
  await expect(page.getByRole("button", { name: "Semua", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "panduan-sample" })).toBeVisible();
  await page.getByRole("button", { name: "Segar Semula" }).click();
  await expect(page.getByRole("heading", { name: "panduan-sample" })).toBeVisible();
});

test("Blogger pagination avoids duplicate articles across pages", async ({ page }) => {
  await page.route(/safamarwah\.my\/feeds\/posts\/default/, async route => {
    const url = new URL(route.request().url());
    const callback = url.searchParams.get("callback") || "callback";
    const start = Number(url.searchParams.get("start-index") || 1);
    const entry = (id: string) => ({
      id: { $t: id }, title: { $t: id },
      content: { $t: "<p>Article content</p>" },
      link: [{ rel: "alternate", href: "https://www.safamarwah.my/2026/10/" + id + ".html" }]
    });
    const entries = start === 1
      ? Array.from({ length: 12 }, (_, index) => entry("post-" + (index + 1)))
      : [entry("post-12"), entry("post-13")];
    await route.fulfill({
      status: 200, contentType: "application/javascript",
      body: callback + "(" + JSON.stringify({ feed: { entry: entries, category: [] } }) + ");"
    });
  });
  await page.goto("/#/blog");
  await expect(page.locator(".article-grid .article-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Muat Lagi Artikel" }).click();
  await expect(page.locator(".article-grid .article-card")).toHaveCount(13);
  await expect(page.getByRole("heading", { name: "post-12" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "post-13" })).toHaveCount(1);
});

test("Blogger label pagination stays within selected category", async ({ page }) => {
  const requested: string[] = [];
  await page.route(/safamarwah\.my\/feeds\/posts\/default/, async route => {
    const url = new URL(route.request().url());
    const callback = url.searchParams.get("callback") || "callback";
    const label = decodeURIComponent(url.pathname.split("/-/")[1] || "");
    const start = Number(url.searchParams.get("start-index") || 1);
    if (label) requested.push(label + ":" + start);
    const entry = (id: string) => ({
      id: { $t: id }, title: { $t: id },
      category: [{ term: "Doa" }],
      content: { $t: "<p>Doa content</p>" },
      link: [{ rel: "alternate", href: "https://www.safamarwah.my/2026/10/" + id + ".html" }]
    });
    const entries = label === "Doa"
      ? (start === 1 ? Array.from({ length: 12 }, (_, i) => entry("doa-" + i)) : [entry("doa-12")])
      : [entry("general")];
    await route.fulfill({
      status: 200, contentType: "application/javascript",
      body: callback + "(" + JSON.stringify({ feed: { category: [{ term: "Doa" }], entry: entries } }) + ");"
    });
  });
  await page.goto("/#/blog");
  await page.getByRole("button", { name: "Doa", exact: true }).click();
  await expect(page.locator(".article-grid .article-card")).toHaveCount(12);
  await page.getByRole("button", { name: "Muat Lagi Artikel" }).click();
  await expect(page.locator(".article-grid .article-card")).toHaveCount(13);
  expect(requested).toContain("Doa:1");
  expect(requested).toContain("Doa:13");
});


test("homepage keeps approved responsive article cards and image ratio",async({page})=>{
 const viewport=page.viewportSize()!;
 await page.route("**/feeds/posts/default**",async route=>{
  const url=new URL(route.request().url());
  const callback=url.searchParams.get("callback")||"callback";
  const entry=(id:number)=>({id:{$t:"home-"+id},title:{$t:"Artikel "+id},content:{$t:"<p>Ringkasan artikel Umrah.</p>"},link:[{rel:"alternate",href:"https://www.safamarwah.my/2026/10/home-"+id+".html"}]});
  await route.fulfill({status:200,contentType:"application/javascript",body:callback+"("+JSON.stringify({feed:{entry:[entry(1),entry(2),entry(3)]}})+");"});
 });
 await page.goto("/#/");
 await expect(page.locator(".home-app__articles .article-card")).toHaveCount(3);
 const grid=page.locator(".home-app__articles .article-grid");
 const cols=await grid.evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
 expect(cols).toBe(viewport.width>=1200?3:viewport.width>=768?2:1);
 const ratio=await page.locator(".home-app__articles .article-card__image").first().evaluate(el=>{
  const box=el.getBoundingClientRect();return box.width/box.height;
 });
 expect(ratio).toBeGreaterThan(1.30);
 expect(ratio).toBeLessThan(1.37);
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 expect(overflow).toBeLessThanOrEqual(1);
});
