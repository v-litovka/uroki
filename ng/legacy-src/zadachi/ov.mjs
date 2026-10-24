const {chromium}=await import(process.env.PW);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('file://'+process.cwd()+'/zadachi-off.html');await p.waitForTimeout(300);
await p.click('#cheat');await p.waitForTimeout(200);
console.log(await p.evaluate(()=>[...document.querySelectorAll('*')].filter(e=>e.getBoundingClientRect().right>392).slice(0,8).map(e=>e.tagName+'.'+e.className.baseVal+e.className+' '+Math.round(e.getBoundingClientRect().right))));
await b.close();
