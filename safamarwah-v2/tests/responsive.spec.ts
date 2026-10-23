import { test, expect } from "@playwright/test";
const routes = ["/", "/panduan", "/panduan/persediaan", "/doa", "/doa/doa-perjalanan", "/blog", "/blog/persediaan-sebelum-umrah"];
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
test("blog cards use responsive columns", async ({ page }) => {
  await page.goto("/#/blog");
  const grid = page.locator(".article-grid").first();
  const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length);
  const width = page.viewportSize()!.width;
  expect(cols).toBe(width >= 768 ? 3 : 1);
});
test("removed pages do not render active content", async ({ page }) => {
  await page.goto("/#/waktu-solat");
  await expect(page.getByRole("heading", { name: "Halaman tidak ditemui" })).toBeVisible();
});
