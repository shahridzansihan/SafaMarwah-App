import {test,expect} from "@playwright/test";
test("homepage, navigation and article grid",async({page})=>{
 await page.goto("http://127.0.0.1:4173/");
 await expect(page.getByRole("heading",{name:/Teman perjalanan ibadah/i})).toBeVisible();
 await page.getByRole("link",{name:"Panduan Umrah",exact:true}).first().click();
 await expect(page).toHaveURL(/#\/panduan$/);
 await expect(page.getByRole("heading",{name:"Panduan Umrah"})).toBeVisible();
 await page.getByRole("link",{name:"Doa & Zikir",exact:true}).first().click();
 await expect(page).toHaveURL(/#\/doa$/);
 await page.getByRole("link",{name:"Blog",exact:true}).first().click();
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
