import fs from 'fs';
const {chromium}=await import(process.env.PW);
const js=fs.readFileSync('shared.js','utf8');
const b=await chromium.launch();const p=await b.newPage({viewport:{width:700,height:900}});
await p.setContent(`<style>body{font-family:sans-serif}</style><div id=o></div><script>${js};document.querySelector('style').textContent+=SCHEME_CSS;
const L=[SCH.sum(27,15,'?','27','15'),SCH.sum(6,19,'25','6','?'),SCH.more('Г.','О.',5,3,'5','3','?'),SCH.less('М.','Д.',9,3,'9','3','?'),SCH.times('Г.','О.',5,3,'5','?'),SCH.part('Т.','Л.',20,4,'20','?'),SCH.diff('Ф.','М.',17,9,'17','9'),SCH.ratio('П.','С.',35,7,5,'35','7'),SCH.both(SCH.more('Н.','М.',15,7,'15','7',''),'?')];
document.getElementById('o').innerHTML=L.map(d=>'<div style="border:1px solid #ccc;margin:6px;display:inline-block;width:300px">'+drawScheme(d)+'</div>').join('');</script>`);
await p.screenshot({path:'sch.png',fullPage:true});await b.close();
