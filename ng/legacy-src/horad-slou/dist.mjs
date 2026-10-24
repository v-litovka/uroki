import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const out={};
for(const [f,key,sts] of [['bel/horad.html','horad-slou-v1',['ak','err','sent']],['gorod-slov.html','gorod-slov-v1',['vow','err','sent']]]){
 const p=await b.newPage();await p.route(/^https?:/,r=>r.abort());
 await p.goto('file://'+process.cwd()+'/'+f);
 await p.evaluate(([k,s])=>localStorage.setItem(k,JSON.stringify({streets:s})),[key,sts]);await p.reload();
 const c=await p.evaluate(()=>{const n={};for(let i=0;i<3000;i++){document.querySelector('#play')||0;}return n});
 await p.click('#play');const cnt={};
 for(let i=0;i<60;i++){const k=await p.evaluate(()=>document.querySelector('.kicker').innerText);cnt[k]=(cnt[k]||0)+1;await p.click('#home');await p.click('#again');}
 out[f]=cnt;}
console.log(JSON.stringify(out));await b.close();
