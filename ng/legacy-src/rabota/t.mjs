import {chromium} from '/opt/node-tools/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/d0e6d958-b3c0-5104-9cd2-c1cfd6909a4b/scratchpad/rab/rab.html');
const T=await p.evaluate(()=>{const t=window.__TEST__;return {TSA:t.TSA,ADJ:t.ADJ,NOUN:t.NOUN,SOFT:t.SOFT,DW:t.DW}});
const all=[...T.TSA,...T.ADJ,...T.NOUN];
const byS=txt=>all.find(it=>{const pre=it.s.split('{}')[0].trim();return txt.replace(/\s+/g,' ').includes(pre.replace(/\s+/g,' '))&&new RegExp('(^|\\s)'+it.b,'i').test(txt)});
const softBy=t=>T.SOFT.find(x=>t.includes(x.w))||null;
async function clickText(t){const bs=await p.$$('#fb ~ *, .opts .opt');for(const x of await p.$$('.card .opt:not([disabled])')){if((await x.innerText()).trim().replace(/\s+/g,' ')===t){await x.click();return true}}return false}
async function why(){await p.waitForSelector('.why .opt');const os=await p.$$('.why .opt:not([disabled])');
  for(const o of os){const t=await o.innerText();if(!/как слышу|Слышу|У всех|всегда|длинное|короткое|Между согласным|не нужен|Проверю ударением|две с|одна н/.test(t)){await o.click();break}}}
let k0=0;const topics=process.argv[2]?process.argv[2].split(','):['tsa','adj','noun','soft','dw'];let rounds=0;
for(const tid of topics){
  await p.click('#home');await p.click(`button.topic[data-t="${tid}"]`);
  const modes=await p.$$eval('.mb',a=>a.map(x=>x.dataset.m));
  for(const m of modes){
    await p.click('#home');await p.click(`button.topic[data-t="${tid}"]`);await p.click(`.mb[data-m="${m}"]`);
    for(let k=0;k<80;k++){
      await p.waitForTimeout(150);
      if(await p.$('.fin')) break;
      const txt=(await p.innerText('.card').catch(()=>'')).replace(/ /g,' ');
      if(await p.$('.why .opt:not([disabled])')){await why();await p.waitForTimeout(1400);continue}
      if(tid==='soft'||tid==='dw'){
        if(await p.$('#hd')){const w=(await p.innerText('#lw')).trim();await p.click('#hd');await p.fill('.inp',w);await p.click('.inrow .btn');continue}
        const big=await p.$('.big');const bt=big?(await big.innerText()).trim():'';
        if(tid==='soft'){
          if(m==='gap'){await clickText('ь');continue}
          if(m==='pick'){const ws=await p.$$eval('.card .opt',a=>a.map(x=>x.innerText.trim()));const w=ws.find(x=>T.SOFT.some(s=>s.w===x));await clickText(w);continue}
        } else {
          if(m==='letter'){for(const d of T.DW)for(const sp of d.sp)if(sp[0]===bt){await clickText(sp[1])}continue}
          if(m==='pick'){const ws=await p.$$eval('.card .opt',a=>a.map(x=>x.innerText.trim()));await clickText(ws.find(x=>T.DW.some(s=>s.w===x)));continue}
        }
        throw new Error('stuck '+tid+m+txt.slice(0,200));
      }
      const it=byS(txt);if(!it) throw new Error('no item '+txt.slice(0,300));
      if(/Задай вопрос/.test(txt)&&!/Вопрос «/.test(txt)&&m!=='word'&&m!=='err'){await clickText(it.q);await p.waitForTimeout(800);continue}
      if(m==='choose'){await clickText(it.e);continue}
      if(m==='type'){await p.fill('.inp',it.e);await p.click('.inrow .btn');continue}
      if(m==='word'){if(process.env.D)console.log(JSON.stringify(txt),it.w);await p.fill('.inp',it.w);await p.click('.inrow .btn');continue}
      if(m==='err'){if(await p.$('.inp:not([disabled])')){await p.fill('.inp',it.w);await p.click('.inrow .btn');continue}
        const shown=await p.innerText('.vb');await clickText(shown.trim()===it.w?'Верно':'Есть ошибка');await p.waitForTimeout(300);continue}
      throw new Error('?'+m);
    }
    if(!await p.$('.fin')) throw new Error('not finished '+tid+' '+m);rounds++;
    if(k0) console.log(tid,m,'steps');if(tid==='adj'&&m==='choose') await p.screenshot({path:'rab/fin.png'});
  }
}
await p.click('#home');await p.click('button.topic[data-t="adj"]');await p.screenshot({path:'rab/adj.png',fullPage:true});
await p.click('.mb[data-m="choose"]');await p.screenshot({path:'rab/q1.png'});
console.log('rounds',rounds,'errs',errs);await b.close();
