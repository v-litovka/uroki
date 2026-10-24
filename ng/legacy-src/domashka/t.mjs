let wrongCount=0;
const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const W=+(process.argv[2]||390),PG=process.argv[3]||'30';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file:///home/claude/uroki/domashka/index.html');
const shot=n=>p.screenshot({path:`dz/s/${PG}-${W}-${n}.png`,fullPage:true});
await shot('0home');
await p.click('.book.b-wb');await shot('1pages');
await p.fill('#pn','99');await p.click('#pf button');await shot('1miss');
await p.fill('#pn',PG);await p.click('#pf button');await shot('2page');
for(const n of [1,2,3,4,5]){wrongCount=0;
  await p.click(`.exb[data-n="${n}"]`);await p.waitForTimeout(100);
  let k=0,wrongDone=false;
  while(await p.$('#stepc .q')){
    const st=await p.evaluate(()=>{const s=curStep();return {k:s.k,ok:s.ok,n:s.opts?s.opts.length:0,f:s.testv||(s.fields?s.fields.map(x=>x.ok):null)}});
    if(k<3)await shot(`e${n}-${k}`);
    if(st.k==='note'){await p.waitForSelector('#ntb');await p.evaluate(()=>{const b=document.querySelector('#ntb');b.disabled=false});await p.click('#ntb');await p.waitForTimeout(800);k++;continue}
    if(!wrongDone||k%4===3){ // одна ошибка — показать подсказку
      wrongDone=true;
      if(st.k==='pick'){await p.click(`.opt[data-i="${(st.ok+1)%st.n}"]`)}
      else if(st.k==='num'){await p.fill('#ni',String(st.ok+1));await p.click('#nf button')}
      else if(st.k==='order'){const all=await p.$$eval('button.opb',x=>x.map(y=>+y.dataset.i));const w=all.find(i=>i!==st.ok[0]);if(w!=null)await p.click(`button.opb[data-i="${w}"]`)}
      else if(st.k==='nums'){const ins=await p.$$('.nfi');for(let i=0;i<ins.length;i++)await ins[i].fill(String(st.f[i]+1));await p.click('#nf button')}
      else if(st.k==='multi'){await p.click('.chip[data-i="1"]');await p.click('#chk');await p.click('.chip[data-i="1"]')}
      await p.waitForTimeout(150);await shot(`e${n}-wrong`);
    }
    if(st.k==='pick')await p.click(`.opt[data-i="${st.ok}"]`);
    else if(st.k==='num'){await p.fill('#ni',String(st.ok));await p.click('#nf button')}
    else if(st.k==='order'){for(const i of st.ok)await p.click(`button.opb[data-i="${i}"]`)}
    else if(st.k==='nums'){const ins=await p.$$('.nfi');for(let i=0;i<ins.length;i++)await ins[i].fill(String(st.f[i]));await p.click('#nf button')}
    else if(st.k==='multi'){for(const i of st.ok)await p.click(`.chip[data-i="${i}"]`);await p.click('#chk')}
    await p.waitForTimeout(300);
    if(await p.$('.wopt')){await shot(`e${n}-why${k}`);
      const bad=await p.$('.wopt[data-ok="0"]');if(bad){await bad.click();await p.waitForTimeout(100)}
      else{const dis=await p.$eval('.wopt',b=>b.disabled);if(!dis)errs.push('not locked');await p.evaluate(()=>{document.querySelector('.wopt').disabled=false})}
      await p.click('.wopt[data-ok="1"]')}
    await p.waitForTimeout(700);if(await p.$(".okmsg"))await p.waitForTimeout(900);k++;
    if(await p.$('.win'))break;
    if(k>150){errs.push('stuck '+n);break}
  }
  console.log("ex",n,"k",k,"win",!!(await p.$(".win")),"q",await p.evaluate(()=>{const e=document.querySelector("#stepc");return e?e.innerText.slice(0,80):"-"}));await shot(`e${n}-done`);
  await p.click('#tp');
}
await shot('3page-done');
console.log('errors:',errs);
await b.close();
