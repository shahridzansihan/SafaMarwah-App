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

test("blog category filter changes selected state", async ({ page }) => {
  await page.goto("/#/blog");
  await expect(page.getByRole("heading", { name: "Blog" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Segar Semula" })).toBeVisible();
});
