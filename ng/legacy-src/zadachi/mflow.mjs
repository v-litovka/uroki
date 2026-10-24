const {chromium}=await import(process.env.PW);
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.clock.install();
await p.goto('file://'+process.cwd()+'/zadachi.html');
await p.screenshot({path:'f0-menu.png',fullPage:true});
// only kosv street
await p.evaluate(()=>{const S=window.__TEST__.S;S.streets=['kosv'];});
await p.click('#play');await p.waitForTimeout(200);
await p.screenshot({path:'f1.png',fullPage:true});
// answer correctly through steps
async function solveAll(tag){for(let k=0;k<8;k++){const sp=await p.evaluate(()=>{const s=window.__CUR;return s?{ans:s.ans,num:!!s.num,cards:!!s.cards}:null});
 if(!sp)break;
 if(!(await p.$('#qcard')))break;
 if(sp.num){await p.fill('#inp',sp.ans);await p.screenshot({path:`${tag}-${k}.png`,fullPage:true});await p.evaluate(()=>document.querySelector('#inform button').click());}
 else{await p.screenshot({path:`${tag}-${k}.png`,fullPage:true});await p.evaluate(a=>{[...document.querySelectorAll('.opt')].find(x=>x.dataset.v===a).click()},sp.ans);}
 await p.clock.runFor(500);await p.waitForTimeout(50);
 if(!(await p.$('#qcard')))break;}}
await solveAll('k');
await p.screenshot({path:'f2-ok.png',fullPage:true});
await p.clock.runFor(4000);await p.click('#next');await p.waitForTimeout(100);
// wrong answer -> lesson
await p.evaluate(()=>{const s=window.__CUR;[...document.querySelectorAll('.opt')].find(x=>x.dataset.v!==s.ans).click()});
await p.clock.runFor(1500);await p.waitForTimeout(100);
await p.screenshot({path:'f3-lesson.png',fullPage:true});
// k1 street
await p.evaluate(()=>{window.__TEST__.S.streets=['k1'];});
await p.clock.runFor(16000);await p.click('#next');await p.waitForTimeout(100);
await solveAll('r');
await p.clock.runFor(1000);await p.click('#next').catch(()=>{});await p.clock.runFor(500);
await solveAll('t');
await p.screenshot({path:'f4.png',fullPage:true});
console.log('errs',errs);await b.close();
