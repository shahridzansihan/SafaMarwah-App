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
  // Deterministic Blogger JSONP fixture: validates single-post rendering offline.
  await page.route('**/feeds/posts/default?**',async route=>{
   const url=new URL(route.request().url());
   const callback=url.searchParams.get('callback')||'smBloggerFeedCallback';
   const feed={feed:{entry:[{
    title:{$t:'Panduan Umrah — Artikel Ujian'},
    content:{$t:'<h2>Pengenalan Umrah</h2><p>Ini kandungan demonstrasi untuk menguji paparan single post artikel pada semua resolusi.</p>'},
    published:{$t:'2026-10-22T08:00:00.000Z'},
    link:[{rel:'alternate',href:'https://example.com/demo-umrah'}],
    category:[{term:'Panduan'}]
   }]}};
   await route.fulfill({status:200,contentType:'application/javascript',body:callback+'('+JSON.stringify(feed)+');'});
  });

  try {
   await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForSelector('#main',{timeout:15000});
   await page.screenshot({path:'qa-screenshots/'+size.name+'-home.png',fullPage:true});
   for(const [label,expression,selector] of [
    ['panduan',"show('steps')",'.steps .step'],
    ['doa',"show('dua')",'#main .dua-card'],
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
   for(const [label,expression,selector] of [
    ['faq',"phase2Page('faq')",'#main #phase2-faq-results'],
    ['miqat',"phase2Page('miqat')",'#main .phase2-panel'],
    ['audio',"phase2Page('audio')",'#main #phase2-dua'],
    ['tawaf',"phasePage('tawaf')",'#main .phase-counter'],
    ['saie',"phasePage('saie')",'#main .phase-counter'],
    ['notes',"phasePage('notes')",'#main #phase-notes'],
    ['bookmarks',"phasePage('bookmark')",'#main .phase-bookmarks'],
    ['schedule',"phase3Page('schedule')",'#main .phase3-form'],
    ['emergency',"phase3Page('emergency')",'#main .phase3-form'],
    ['backup',"phase5Page()",'#main .phase5-panel']
   ]){
    await page.evaluate(expression);
    await page.waitForSelector(selector,{timeout:10000});
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))throw Error(label+' horizontal overflow at '+size.width+'px');
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
   await page.evaluate("smArticleRead(0)");
   await page.waitForSelector('#sm-articles-content .sm-single-v3 .sm-single-title',{timeout:10000});
   const articleTitle=await page.locator('.sm-single-title').innerText();
   if(!articleTitle.includes('Panduan Umrah'))throw Error('single post title missing');
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3))throw Error('single post horizontal overflow at '+size.width+'px');
   await page.screenshot({path:'qa-screenshots/'+size.name+'-single-post.png',fullPage:true});
   if(size.width>=768){
    const layout=await page.locator('#sm-articles-content > .sm-article-reader.sm-single-v3').evaluate(el=>{
      const panel=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect(),mainEl=document.querySelector('#main'),main=mainEl.getBoundingClientRect(),mainStyle=getComputedStyle(mainEl),contentLeft=main.left+parseFloat(mainStyle.paddingLeft),contentRight=main.right-parseFloat(mainStyle.paddingRight);
      const body=el.querySelector('#sm-article-body').getBoundingClientRect();
      return {panelWidth:panel.width,bodyWidth:body.width,leftGap:panel.left-contentLeft,rightGap:contentRight-panel.right,parentLeftGap:panel.left-parent.left,parentRightGap:parent.right-panel.right};
    });
    if(layout.panelWidth<Math.min(640,size.width-100))throw Error('single-post panel too narrow at '+size.width+'px: '+layout.panelWidth);
    if(layout.bodyWidth>770)throw Error('single-post text measure too wide at '+size.width+'px');
    if(Math.abs(layout.parentLeftGap-layout.parentRightGap)>5)throw Error('single-post panel not centered within its article container at '+size.width+'px: '+JSON.stringify(layout));
   }

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
