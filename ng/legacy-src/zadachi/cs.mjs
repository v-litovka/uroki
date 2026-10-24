const {chromium}=await import(process.env.PW);
const b=await chromium.launch();
for(const [w,f] of [[1000,'cs-wide.png'],[390,'cs-mob.png']]){const p=await b.newPage({viewport:{width:w,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+process.cwd()+'/math/shpargalka.html');await p.waitForTimeout(300);
const sw=await p.evaluate(()=>document.documentElement.scrollWidth);console.log(w,sw,errs);
await p.screenshot({path:'math/'+f,fullPage:true});}
await b.close();
