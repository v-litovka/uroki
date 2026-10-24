const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const errs=[];
for(const pg of [28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57]){const p=await b.newPage({viewport:{width:390,height:900}});p.on('pageerror',e=>errs.push(pg+' '+e.message));
await p.goto('file:///home/claude/uroki/domashka/index.html');
await p.evaluate(pg=>{S.done[`wb${pg}-1`]=1;page('wb',pg)},pg);
if(pg===28){await p.screenshot({path:'dz/par-page.png',fullPage:true});await p.click('.exb[data-n="1"]');await p.click('#cp');await p.screenshot({path:'dz/par-done.png',fullPage:true});await p.click('#bk')}
await p.click('#par');await p.fill('#pw','1111');await p.click('#pwf button');const m=await p.textContent('#pwm');
await p.fill('#pw','2924');await p.click('#pwf button');await p.waitForTimeout(200);
const n=await p.$$eval('.task.sol',x=>x.map(y=>y.querySelector('.copy')?.innerText.trim().length||0));
if(pg===28||pg===33)await p.screenshot({path:`dz/par-sol-${pg}.png`,fullPage:true});
console.log(pg,m,n.join(','));await p.close()}
console.log(errs);await b.close();
