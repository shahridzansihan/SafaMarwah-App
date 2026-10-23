import {test,expect} from "@playwright/test";
test("homepage, navigation and article grid",async({page})=>{
 await page.goto("http://127.0.0.1:4173/");
 await expect(page.getByRole("heading",{name:/Perjalanan Umrah Anda/i})).toBeVisible();
 await page.getByRole("navigation",{name:"Akses pantas"}).getByRole("link",{name:"Panduan Umrah"}).click();
 await expect(page).toHaveURL(/#\/panduan$/);
 await expect(page.getByRole("heading",{name:"Panduan Umrah"})).toBeVisible();
 if(await page.getByRole("button",{name:"Buka menu"}).isVisible())await page.getByRole("button",{name:"Buka menu"}).click();
 await page.locator("#site-navigation").getByRole("link",{name:"Doa & Zikir",exact:true}).click();
 await expect(page).toHaveURL(/#\/doa$/);
 if(await page.getByRole("button",{name:"Buka menu"}).isVisible())await page.getByRole("button",{name:"Buka menu"}).click();
 await page.locator("#site-navigation").getByRole("link",{name:"Blog",exact:true}).click();
 await expect(page).toHaveURL(/#\/blog$/);
});
for(const viewport of [{width:390,height:844},{width:820,height:1180},{width:1440,height:900}]){
 test("no horizontal overflow "+viewport.width,async({page})=>{
  await page.setViewportSize(viewport);
  await page.goto("http://127.0.0.1:4173/#/panduan");
  await expect(page.getByRole("heading",{name:"Panduan Umrah"})).toBeVisible();
  const dimensions=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client+1);
 });
}

test("mobile navigation closes after route change", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/");
  const openMenu = page.getByRole("button", { name: "Buka menu" });
  await page.getByRole("navigation",{name:"Akses pantas"}).getByRole("link",{name:"Panduan Umrah"}).click();
  await expect(page).toHaveURL(/#\/panduan$/);
  await expect(openMenu).toBeVisible();
  await openMenu.click();
  await expect(page.getByRole("button", { name: "Tutup menu" })).toHaveAttribute("aria-expanded", "true");
  await page.locator("#site-navigation").getByRole("link", { name: "Doa & Zikir", exact: true }).click();
  await expect(page).toHaveURL(/#\/doa$/);
  await expect(openMenu).toHaveAttribute("aria-expanded", "false");
});
