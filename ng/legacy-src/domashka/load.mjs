const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///home/claude/uroki/domashka/index.html');
console.log(await p.evaluate(()=>Object.keys(PAGES.wb).join(',')),errs);await b.close();
