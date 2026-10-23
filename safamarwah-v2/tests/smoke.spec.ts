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

test("Saudi clock city selector and refresh remain functional", async ({page}) => {
 await page.route("https://api.aladhan.com/v1/timingsByCity/**",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({code:200,data:{meta:{timezone:"Asia/Riyadh"},timings:{Fajr:"05:00",Dhuhr:"12:10",Asr:"15:20",Maghrib:"18:30",Isha:"20:00"}}})}));
 await page.goto("/#/");
 const widget=page.getByRole("region",{name:"Waktu Solat"});
 await expect(widget.getByText("WAKTU SEMASA · ARAB SAUDI")).toBeVisible();
 const makkah=widget.getByRole("button",{name:"Makkah"});
 const madinah=widget.getByRole("button",{name:"Madinah"});
 await expect(makkah).toHaveAttribute("aria-pressed","true");
 await madinah.click();
 await expect(madinah).toHaveAttribute("aria-pressed","true");
 await expect(widget.getByText("05:00")).toBeVisible();
 await expect(widget.getByText(/Madinah · Waktu solat hari ini/)).toBeVisible();
 await widget.getByRole("button",{name:"Segar semula jam Arab Saudi"}).click();
 await expect(widget.getByText(/Jam di atas menunjukkan waktu semasa Arab Saudi/)).toBeVisible();
});
