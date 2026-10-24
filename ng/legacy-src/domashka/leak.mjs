const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage();await p.goto('file:///home/claude/uroki/domashka/index.html');
const r=await p.evaluate(()=>{const out=[];const st=s=>String(s).replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').trim();
for(const pg in PAGES.wb)for(const ex of PAGES.wb[pg].ex)for(const it of ex.items)for(const s of it.steps){if(s.k==='pick'&&s.opts&&!s.signs&&!s.svg){const o=st(s.opts[s.ok]);if(o.length>2&&st(s.q).includes(o))out.push(pg+'/'+ex.n+': '+st(s.q)+' => '+o)}}return out});
console.log(r.join('\n'));await b.close();
