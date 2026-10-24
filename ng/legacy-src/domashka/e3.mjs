const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file:///home/claude/uroki/domashka/index.html');
await p.evaluate(()=>page('wb',31));await p.click('.exb[data-n="5"]');await p.waitForTimeout(100);
await p.evaluate(()=>{const b=document.querySelector('#ntb');b.disabled=false});
try{await p.click('#ntb',{timeout:3000})}catch(e){console.log('click fail',e.message.split('\n')[0])}
await p.waitForTimeout(800);
console.log(await p.evaluate(()=>({step:R.step})));
await b.close();
