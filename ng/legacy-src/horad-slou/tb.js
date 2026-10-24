const fs=require('fs');const html=fs.readFileSync(__dirname+'/horad.html','utf8');
let js=html.split('<script>')[1].split('</script>')[0];
const mk=()=>({hidden:false,querySelectorAll(){return []},addEventListener(){},querySelector(){return mk()},setAttribute(){},style:{setProperty(){}},classList:{toggle(){},remove(){},add(){}},textContent:'',innerHTML:''});
global.window={addEventListener(){}};global.localStorage={getItem(){return null},setItem(){}};
global.document={body:mk(),querySelector:()=>mk(),querySelectorAll:()=>[],addEventListener(){}};
eval(js);
const {ITEMS,mainSpecs,solved,taskView,lessonHTML,STREETS,ruleFor}=window.__TEST__;
let bad=0;const cnt={};
for(const it of ITEMS){cnt[it.street]=(cnt[it.street]||0)+1;
  if(!STREETS.find(s=>s.id===it.street)){bad++;console.log('street?',it.id)}
  const sp=mainSpecs(it);if(!sp||!sp.length){bad++;console.log('nospec',it.id);continue}
  for(const s of sp){
    if(s.tap){const ws=s.tap.map(w=>w.replace(/[.,!?…]/g,''));if(ws.filter(w=>w===s.ans).length!==1){bad++;console.log('tap',it.label,s.ans)}}
    else{const ok=s.okv||[s.ans];if(!ok.every(a=>s.opts.includes(a))){bad++;console.log('opt',it.label,s.ans,s.opts)} if(new Set(s.opts).size!==s.opts.length){bad++;console.log('dup',it.label,s.opts)}}
  }
  if(it.w&&!it.w.includes('_')&&it.type!=='syn'&&it.type!=='ant'&&it.type!=='hom'){bad++;console.log('nogap',it.w)}
  if(it.w&&it.w.split('_').length>2){bad++;console.log('2gaps',it.w)}
  try{const r=ruleFor(it);if(!r||!r.title)throw Error('rule');solved(it);taskView(it);lessonHTML(it)}catch(e){bad++;console.log('render',it.id,e.message)}
}
// no russian-only letters in visible data
const txt=JSON.stringify(ITEMS)+JSON.stringify(STREETS);
const ru=txt.match(/[^"]{0,15}[ищъэ][^"]{0,15}/g)||[];
console.log('items',ITEMS.length,JSON.stringify(cnt),'bad',bad);
console.log('ru-letters', ru.filter(s=>/[ищъ]/.test(s)).slice(0,10));
