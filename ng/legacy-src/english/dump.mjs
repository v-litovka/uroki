const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage();
await p.goto('file:///home/claude/uroki/english/index.html');
const out=await p.evaluate(()=>{const o=[];const strip=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 for(const [t,f] of [['be',genBe],['have',genHave],['can',genCan]])for(const lv of [0,1,2]){const seen=new Set();for(let i=0;i<300&&seen.size<12;i++){const q=f(lv);const k=q.key.split(':')[1];const s=`${t}${lv} [${k}] ${strip(q.show)} | ans=${q.ans||q.tokens.join(' ')} | opts=${(q.opts||[]).join(' / ')} | say=${q.say}`;if(![...seen].some(x=>x.startsWith(`${t}${lv} [${k}]`)&&seen.size>6))seen.add(s)}o.push(...seen)}
 return o});
console.log(out.join('\n'));await b.close();
