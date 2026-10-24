const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const FILE=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route(/^https?:/,r=>r.abort());
await p.goto('file://'+FILE);
const SD='/tmp/claude-0/-home-claude/d0e6d958-b3c0-5104-9cd2-c1cfd6909a4b/scratchpad/stih/s';
const shot=n=>p.screenshot({path:`${SD}/${n}.png`,fullPage:true});
await shot('home');
const ids=await p.$$eval('.bt',x=>x.map(y=>y.dataset.b));
const ans=async()=>{ // текущий вопрос: найти x × y
  const t=await p.evaluate(()=>document.querySelector('.card').innerText);const m=t.match(/(\d+)\s×\s(\d+)\s=\s(\d+|\?)/);return m?(+m[1])*(+m[2]):null};
for(const id of ids.filter(x=>x!=='exam')){
  await p.click(`.bt[data-b="${id}"]`);
  // read
  await p.click('.mb[data-m="read"]');if(id==='3a')await shot('read');await p.evaluate(()=>{document.querySelector('#dn').disabled=false});await p.click('#dn');await p.waitForTimeout(200);
  if(id==='3a')await shot('fin');
  await p.click('#nx');// gap
  let k=0;while(await p.$('#a')&&k<20){const v=await ans();if(k===0){await p.fill('#a',String(v+1));await p.click('#f button');await p.waitForTimeout(150);if(id==='3a')await shot('gap-wrong')}
    await p.fill('#a',String(v));await p.click('#f button');await p.waitForTimeout(1600);k++}
  await p.click('#nx');// pair
  k=0;while(await p.$('.opt')&&k<20){const t=await p.evaluate(()=>document.querySelector('.card').innerText);
    let ok=await p.evaluate(()=>{const T=document.querySelector('.card').innerText;return null});
    // правильный ищем через перебор: кликаем по очереди пока не right
    const n=(await p.$$('.opt')).length;let done=false;
    for(let j=0;j<n&&!done;j++){const el=await p.$(`.opt[data-k="${j}"]:not([disabled])`);if(!el)continue;await el.click();await p.waitForTimeout(120);done=!!(await p.$('.opt.right'))}
    if(id==='3a'&&k<2)await shot('pair'+k);
    await p.waitForTimeout(1800);k++}
  await p.click('#nx');// order
  const n=(await p.$$('.lt')).length;
  for(let pos=0;pos<n;pos++){const els=await p.$$('.lt:not(.used)');for(const el of els){const kk=+(await el.getAttribute('data-k'));if(kk===pos){await el.click();break}}}
  if(id==='3a')await shot('order');
  await p.waitForTimeout(1200);
  const fin=await p.$('.fin');console.log(id,'fin',!!fin);
  await p.click('#home');
}
await p.click('.bt[data-b="exam"]');
for(let k=0;k<12;k++){const v=await ans();if(k===0){await p.fill('#a',String(v+1));await p.click('#f button');await p.waitForTimeout(150);await shot('exam-wrong')}await p.fill('#a',String(v));await p.click('#f button');await p.waitForTimeout(1300)}
console.log('exam fin',!!(await p.$('.fin')));await p.click('#home');await shot('home2');
console.log('stars',await p.$eval('#starN',e=>e.textContent),'errors',errs);await b.close();
