const {chromium}=await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message,e.stack.split('\n').slice(0,3).join(' | ')));
await p.goto('file:///home/claude/uroki/domashka/index.html');await p.waitForTimeout(500);await b.close();
