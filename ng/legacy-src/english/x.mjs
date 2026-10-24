const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/uroki/english/index.html');
await p.evaluate(()=>{S.voice=false;S.sel=['be'];S.goal=20;S.stars=17});await p.click('#go');await p.waitForTimeout(1100);
await p.screenshot({path:'en/x-q.png',fullPage:true});
// ответить верно 3 раза -> уровень 1 (порог 20)
for(let i=0;i<3;i++){const q=await p.evaluate(()=>({k:R.q.kind,a:R.q.ans,t:R.q.tokens}));
 if(q.k==='choice')await p.click(`.opt[data-v="${q.a}"]`);else if(q.k==='type'){await p.fill('#ti',q.a);await p.click('#tf button')}else{for(const t of q.t)await p.evaluate(t=>{[...document.querySelectorAll('.wt')].find(x=>!x.disabled&&x.textContent===t).click()},t)}
 await p.waitForTimeout(200);if(i===2)await p.screenshot({path:'en/x-lv.png',fullPage:true});await p.click('#nx');}
await p.evaluate(()=>{R.lim=0});await p.waitForTimeout(1100);
const q=await p.evaluate(()=>({k:R.q.kind,a:R.q.ans,t:R.q.tokens}));
if(q.k==='choice')await p.click(`.opt[data-v="${q.a}"]`);else if(q.k==='type'){await p.fill('#ti',q.a);await p.click('#tf button')}else{for(const t of q.t)await p.evaluate(t=>{[...document.querySelectorAll('.wt')].find(x=>!x.disabled&&x.textContent===t).click()},t)}
await p.click('#nx');await p.waitForTimeout(200);await p.screenshot({path:'en/x-extra.png',fullPage:true});
await p.click('#home');await p.waitForTimeout(200);await p.screenshot({path:'en/x-stop.png',fullPage:true});
await p.click('#tm');await p.waitForTimeout(200);await p.screenshot({path:'en/x-menu.png',fullPage:true});
console.log(errs);await b.close();
