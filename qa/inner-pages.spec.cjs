const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({headless:true});
 const sizes=[{name:'desktop',width:1440,height:900},{name:'tablet-landscape',width:1024,height:768},{name:'tablet-portrait',width:768,height:1024},{name:'mobile-regression',width:390,height:844}];
 fs.mkdirSync('qa-screenshots',{recursive:true});
 let failures=[];
 for(const size of sizes){
  const page=await browser.newPage({viewport:{width:size.width,height:size.height},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  try {
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForSelector('#main',{timeout:15000});
   await page.screenshot({path:'qa-screenshots/'+size.name+'-home.png',fullPage:true});
   for(const [label,expression,selector] of [
    ['panduan',"show('steps')",'.steps .step'],
    ['doa',"show('dua')",'#main .sm-master-header'],
    ['checklist',"phasePage('checklist')",'#main input[data-phase-check]'],
    ['rukun',"phase2Page('ilm')",'#main .phase2-panel'],
    ['panduan-subpage',"show('step',0)",'#main .step-panel']
   ]){
    await page.evaluate(expression);
    await page.waitForSelector(selector,{timeout:10000});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
    if(overflow)throw Error(label+' has horizontal overflow at '+size.width+'px');
    await page.screenshot({path:'qa-screenshots/'+size.name+'-'+label+'.png',fullPage:true});
   }
   await page.evaluate("sm50Card()");
   await page.waitForSelector('#main .sm-id-screen .sm-id-card',{timeout:10000});
   await page.screenshot({path:'qa-screenshots/'+size.name+'-digital-card.png',fullPage:true});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))throw Error('digital card horizontal overflow at '+size.width+'px');
   await page.evaluate("showMore()");
   await page.waitForSelector('#main .more-list',{timeout:10000});
   await page.screenshot({path:'qa-screenshots/'+size.name+'-more.png',fullPage:true});
   await page.evaluate("smArticlesPage()");
   await page.waitForSelector('#sm-articles-content',{timeout:10000});
   await page.screenshot({path:'qa-screenshots/'+size.name+'-articles.png',fullPage:true});
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))throw Error('articles horizontal overflow at '+size.width+'px');
   if(size.width>=768){
    await page.evaluate("show('steps')");
    const grid=await page.locator('.steps').evaluate(el=>getComputedStyle(el).gridTemplateColumns);
    if(!grid)throw Error('Panduan grid styles missing');
   }
   if(errors.length)throw Error(size.name+' JavaScript runtime errors: '+errors.slice(0,5).join(' | '));
   console.log('PASS '+size.name);
  }catch(e){failures.push(size.name+': '+e.message);console.error('FAIL '+size.name,e.message)}
  await page.close();
 }
 await browser.close();
 if(failures.length){console.error(failures.join('\n'));process.exitCode=1}
})();
