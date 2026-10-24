const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const W=+(process.argv[2]||390);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/uroki/english/index.html');
await p.screenshot({path:`en/s-${W}-menu.png`,fullPage:true});
// стресс-тест генераторов
const gen=await p.evaluate(()=>{const bad=[];for(const t of TOPICS)for(const lv of [0,1,2]){S.lv[t.id]=lv;for(let i=0;i<150;i++){try{const q=genQ(t.id);if(!q)bad.push(t.id+lv+' null');
  const chk=st=>{if(st.opts){if(!st.opts.includes(st.ans))bad.push(t.id+lv+' noans '+st.ans);if(new Set(st.opts).size!==st.opts.length)bad.push(t.id+lv+' dup '+st.opts)}};
  if(q.kind==='steps')q.steps.forEach(chk);else if(q.kind==='choice')chk(q);}catch(e){bad.push(t.id+lv+' '+e.message)}}}S.lv={};return [...new Set(bad)].slice(0,20)});
console.log('gen',gen);
// играем: все темы, разные уровни
for(const lv of [0,1,2]){
 await p.evaluate(l=>{S.sel=TOPICS.map(t=>t.id);TOPICS.forEach(t=>S.lv[t.id]=l);S.voice=false},lv);
 await p.evaluate(()=>menu());await p.click('#go');
 for(let k=0;k<10;k++){
  const q=await p.evaluate(()=>{const q=R.q;const st=q.kind==='steps'?q.steps[R.si||0]:q;return {kind:q.kind,ans:st.ans,word:q.word,tokens:q.tokens,steps:q.kind==='steps'?q.steps.map(s=>s.ans):null}});
  if(k<4)await p.screenshot({path:`en/s-${W}-l${lv}-${k}.png`,fullPage:true});
  if(q.kind==='choice'){const wrongB=await p.$(`.opt:not([data-v="${q.ans.replace(/"/g,'\\"')}"])`);if(k===1&&wrongB){await wrongB.click();await p.waitForTimeout(100);await p.screenshot({path:`en/s-${W}-l${lv}-wrong.png`,fullPage:true})}
    await p.click(`.opt[data-v="${q.ans}"]`)}
  else if(q.kind==='steps'){for(const a of q.steps){await p.click(`.opt[data-v="${a}"]`);await p.waitForTimeout(700)}}
  else if(q.kind==='words'){for(const t of q.tokens){await p.evaluate(t=>{const b=[...document.querySelectorAll('.wt')].find(x=>!x.disabled&&x.textContent===t);b.click()},t)}}
  else if(q.kind==='type'){await p.fill('#ti',q.ans);await p.click('#tf button')}
  else if(q.kind==='tiles'){for(const c of q.word){await p.evaluate(c=>{const t=[...document.querySelectorAll('.tile')].find(x=>!x.disabled&&x.textContent===c);t.click()},c)}}
  else if(q.kind==='spell'){await p.click('#rdy');const cs=await p.$$('.cell');for(let i=0;i<cs.length;i++)await cs[i].fill(q.word[i]);await p.click('#cchk')}
  await p.waitForTimeout(200);
  if(k<4)await p.screenshot({path:`en/s-${W}-l${lv}-${k}ok.png`,fullPage:true});
  if(k===9)await p.evaluate(()=>{R.lim=0;S.goal=1});
  await p.click('#nx');await p.waitForTimeout(100);
 }
 await p.screenshot({path:`en/s-${W}-l${lv}-fin.png`,fullPage:true});
 console.log('lv',lv,await p.evaluate(()=>document.querySelector('.fin h2')?.textContent));
}
console.log('errors',errs);await b.close();
