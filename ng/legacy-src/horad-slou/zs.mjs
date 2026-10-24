import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const errs=[];
for(const [st,name] of [['zs','z1'],['uv','u1']]){
 const p=await b.newPage({viewport:{width:900,height:620}});p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
 await p.goto('file://'+process.cwd()+'/bel/offline.html');
 await p.evaluate(s=>localStorage.setItem('horad-slou-v1',JSON.stringify({streets:[s]})),st);await p.reload();await p.click('#play');await p.waitForTimeout(200);
 const a=await p.evaluate(()=>window.__CUR?window.__CUR.ans:null);
 await p.screenshot({path:'bel/'+name+'.png'});
 if(st==='zs'){await p.evaluate(()=>{const s=window.__CUR;[...document.querySelectorAll('.opt')].find(o=>o.dataset.v===s.ans).click()});await p.waitForTimeout(450);await p.screenshot({path:'bel/z2.png'});}
}
console.log(JSON.stringify(errs));await b.close();
