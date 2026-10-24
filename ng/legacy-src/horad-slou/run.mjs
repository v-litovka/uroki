import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:860}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.clock.install();
await p.goto('file://'+process.cwd()+'/bel/horad.html');
await p.evaluate(()=>localStorage.setItem('horad-slou-v1',JSON.stringify({streets:['dict','ak','uv','dzc','zac','dvo','apos','par','err','sent','mem','lex','mean','parts'],goal:10})));
await p.reload();await p.screenshot({path:'bel/m.png',fullPage:true});
await p.click('#play');
const seen={};let answered=0,wrongDone=false,shots=0,lessonSeen=false;
for(let r=0;r<400 && !(await p.$('.sum'));r++){
  const nx=await p.$('#next');
  if(nx){if(await nx.isDisabled()){await p.clock.runFor(1000);continue}
    if(!lessonSeen&&await p.$('.kicker.red')){lessonSeen=true;await p.screenshot({path:'bel/l.png',fullPage:true});}
    await nx.evaluate(e=>e.click());await p.clock.runFor(150);continue}
  const sp=await p.evaluate(()=>window.__CUR&&{ans:window.__CUR.ans,okv:window.__CUR.okv,tap:!!window.__CUR.tap,k:document.querySelector('.kicker')?.innerText});
  if(!sp){await p.clock.runFor(300);continue}
  seen[sp.k]=(seen[sp.k]||0)+1;
  const wantWrong=(answered===5&&!wrongDone);
  if(sp.tap){const chips=await p.$$('.chip');for(const c of chips){const t=(await c.innerText()).trim();if((t===sp.ans)!==wantWrong){await c.evaluate(e=>e.click());break}}}
  else{const opts=await p.$$('.opt');for(const o of opts){const v=await o.getAttribute('data-v');if((v===sp.ans)!==wantWrong){await o.evaluate(e=>e.click());break}}}
  if(wantWrong)wrongDone=true;
  answered++;await p.clock.runFor(450);
  if(shots<2&&await p.$('.rulebox')){await p.screenshot({path:'bel/s'+shots+'.png',fullPage:true});shots++;}
  if(answered===80)await p.clock.runFor(16*60*1000);
}
await p.screenshot({path:'bel/sum.png',fullPage:true});
console.log(JSON.stringify({errs,answered,lessonSeen,sum:!!(await p.$('.sum')),seen}));await b.close();
