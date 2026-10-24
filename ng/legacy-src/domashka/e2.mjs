const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/uroki/domashka/index.html');
await p.evaluate(()=>run('wb',31,5));await p.waitForTimeout(3500);
console.log(await p.evaluate(()=>({step:R.step,dis:document.querySelector('#ntb').disabled})));
await p.click('#ntb');await p.waitForTimeout(1000);
console.log(await p.evaluate(()=>({step:R.step,q:document.querySelector('#stepc .q').textContent})));
await b.close();
