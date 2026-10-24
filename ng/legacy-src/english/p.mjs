const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();
for(const W of [390,1000]){const p=await b.newPage({viewport:{width:W,height:900}});
await p.goto('file:///home/claude/uroki/english/index.html');
await p.evaluate(()=>{S.voice=false;S.sel=['pron'];S.lv.pron=0});await p.click('#go');
await p.screenshot({path:`en/pr-${W}-0.png`,fullPage:true});
await p.evaluate(()=>{S.lv.pron=2;R.q=null;let q;do{q=genPron(2)}while(q.kind!=='steps');q.topic='pron';R.q=q;R.si=0;R.tries=0;render(q)});
await p.screenshot({path:`en/pr-${W}-2a.png`,fullPage:true});
const a=await p.evaluate(()=>R.q.steps[0].ans);await p.click(`.opt[data-v="${a}"]`);await p.waitForTimeout(800);
const w=await p.evaluate(()=>R.q.steps[1].opts.find(o=>o!==R.q.steps[1].ans));await p.click(`.opt[data-v="${w}"]`);await p.waitForTimeout(200);
await p.screenshot({path:`en/pr-${W}-2b.png`,fullPage:true});await p.close()}
await b.close();
