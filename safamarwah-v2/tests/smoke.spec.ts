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


test("five-tab bottom navigation opens and closes Lainnya",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/#/");
 const bottom=page.getByRole("navigation",{name:"Navigasi aplikasi"});
 await expect(bottom.getByRole("link")).toHaveCount(4);
 const more=bottom.getByRole("button",{name:"Lainnya"});
 await expect(more).toHaveAttribute("aria-expanded","false");
 await more.click();
 await expect(more).toHaveAttribute("aria-expanded","true");
 await page.getByRole("navigation",{name:"Menu tambahan"}).getByRole("link",{name:"Persediaan Umrah"}).click();
 await expect(page).toHaveURL(/#\/panduan\/persediaan$/);
 await expect(more).toHaveAttribute("aria-expanded","false");
 await expect(page.getByRole("navigation",{name:"Menu tambahan"})).toHaveCount(0);
});


test("Saudi prayer times use same-day cached data when API is unavailable",async({page})=>{
 const timings={Fajr:"05:12",Dhuhr:"12:22",Asr:"15:32",Maghrib:"18:42",Isha:"20:02"};
 await page.route("https://api.aladhan.com/v1/timingsByCity/**",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({code:200,data:{meta:{timezone:"Asia/Riyadh"},timings}})}));
 await page.goto("/#/");
 const widget=page.getByRole("region",{name:"Waktu Solat"});
 await expect(widget.getByText("05:12")).toBeVisible();
 await page.unrouteAll();
 await page.route("https://api.aladhan.com/v1/timingsByCity/**",route=>route.abort());
 await page.reload();
 await expect(widget.getByText("05:12")).toBeVisible();
 await expect(widget.getByText(/Menggunakan jadual tersimpan untuk hari ini/)).toBeVisible();
});

test("Saudi prayer cache does not substitute yesterday's timetable",async({page})=>{
 await page.addInitScript(()=>{
  const yesterday=new Date(Date.now()-86400000);
  const date=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Riyadh",day:"2-digit",month:"2-digit",year:"numeric"}).format(yesterday).split("/").join("-");
  localStorage.setItem("safamarwah-prayer-v2:Makkah:"+date,JSON.stringify({Fajr:"01:01",Dhuhr:"02:02",Asr:"03:03",Maghrib:"04:04",Isha:"05:05"}));
 });
 await page.route("https://api.aladhan.com/v1/timingsByCity/**",route=>route.abort());
 await page.goto("/#/");
 const widget=page.getByRole("region",{name:"Waktu Solat"});
 await expect(widget.getByText(/Jadual waktu solat tidak dapat dimuatkan/)).toBeVisible();
 await expect(widget.getByText("01:01")).toHaveCount(0);
});


test("Lainnya menu supports keyboard dismissal",async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto("/#/");
 const more=page.getByRole("navigation",{name:"Navigasi aplikasi"}).getByRole("button",{name:"Lainnya"});
 await more.click();
 await expect(more).toHaveAttribute("aria-expanded","true");
 await page.keyboard.press("Escape");
 await expect(more).toHaveAttribute("aria-expanded","false");
 await expect(page.getByRole("navigation",{name:"Menu tambahan"})).toHaveCount(0);
});
