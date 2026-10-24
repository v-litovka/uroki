const {chromium}=await import(process.env.PW);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/zadachi-off.html');await p.waitForTimeout(300);
await p.screenshot({path:'m0.png',fullPage:true});
await p.click('#cheat');await p.waitForTimeout(200);
console.log(await p.evaluate(()=>document.documentElement.scrollWidth),errs);
await p.screenshot({path:'m1.png'});
await p.click('#back');await p.click('#play');await p.waitForTimeout(200);await p.screenshot({path:'m2.png'});
await b.close();
