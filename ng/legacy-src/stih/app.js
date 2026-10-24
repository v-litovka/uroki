/* ===== Стишок умножения: тренировка ===== */
/* строчка: строка текста или [текст, x, y, ответ-словами] — строчка с примером */
const BLOCKS=[{"id": "3a", "name": "На 3 (3, 4, 5, 6)", "lines": ["Вире снится шоколадка,", ["3 на 3 — будет 9 (девятка).", 3, 3, "9 (девятка)", "девятка"], "Венди к ней пришла подраться,", ["3, 4 — даст 12.", 3, 4, "12", "двенадцать"], "После драки — умываться,", ["3 на 5 — у нас 15.", 3, 5, "15", "пятнадцать"], "Помирились — обниматься!", ["3 на 6 — есть 18.", 3, 6, "18", "восемнадцать"]]},{"id": "3b", "name": "На 3 (7, 8, 9)", "lines": ["Вира спит, как господин,", ["3 на 7 — 21.", 3, 7, "21", "двадцать один"], ["3 на 8 — 2 4 (два четыре),", 3, 8, "2 4 (два четыре)", "два четыре"], "Вира толще всех в квартире.", "Вира скажет: «Всё я съем!»", ["3 на 9 — 27.", 3, 9, "27", "двадцать семь"]]},{"id": "4a", "name": "На 4 (4, 5)", "lines": ["Дважды 2 — у нас 4,", "И ещё раз на 4 —", ["Получаем мы 16,", 4, 4, "16", "шестнадцать"], "Кошки будут улыбаться.", "Венди нравится загадка:", ["4, 5 — будет 20 (двадцатка).", 4, 5, "20 (двадцатка)", "двадцатка"]]},{"id": "4b", "name": "На 4 (6, 7, 8, 9)", "lines": ["Венди спинку выгнет шире,", ["4, 6 — как 2 4 (два четыре).", 4, 6, "2 4 (два четыре)", "два четыре"], "Вира мячик лапой бросит,", ["4, 7 — есть 28.", 4, 7, "28", "двадцать восемь"], "Венди смотрит, как сова,", ["4, 8 — 32.", 4, 8, "32", "тридцать два"], "Будто Виру хочет съесть,", ["4, 9 — 36.", 4, 9, "36", "тридцать шесть"]]},{"id": "5", "name": "На 5", "lines": ["Венди хочет погулять,", ["5 на 5 — есть 25.", 5, 5, "25", "двадцать пять"], "Вира спит так сладко-сладко,", ["5 на 6 — будет 30 (тридцатка).", 5, 6, "30 (тридцатка)", "тридцатка"], "Венди ляжет на кровать,", ["5 на 7 — есть 35.", 5, 7, "35", "тридцать пять"], "Вира слышит тихий шорох,", ["5 на 8 — будет 40.", 5, 8, "40", "сорок"], "Венди в шкаф легла опять,", ["5 на 9 — 45.", 5, 9, "45", "сорок пять"]]},{"id": "6", "name": "На 6", "lines": ["Венди к Вире хочет сесть,", ["6 на 6 — есть 36.", 6, 6, "36", "тридцать шесть"], "Вира спряталась в дрова,", ["6 на 7 — 4 2 (четыре два).", 6, 7, "4 2 (четыре два)", "четыре два"], "Мы котов на ручках носим,", ["6 на 8 — 48.", 6, 8, "48", "сорок восемь"], "Убегают по квартире,", ["6 на 9 — 5 4 (пять четыре).", 6, 9, "5 4 (пять четыре)", "пять четыре"]]},{"id": "7", "name": "На 7 (7, 8)", "lines": ["Вира тапки будет мерить,", ["7 на 7 — есть 49.", 7, 7, "49", "сорок девять"], "5 и 6 и 7 и 8 —", "Вира кушать снова просит,", "Венди миску ей приносит.", ["56 — даст 7 на 8.", 7, 8, "56", "пятьдесят шесть"]]},{"id": "8", "name": "На 7 и 8 (7×9, 8×8, 8×9)", "lines": ["Венди, ну-ка, посмотри:", ["7 на 9 — 63.", 7, 9, "63", "шестьдесят три"], ["8, 8 — 6 4 (шесть четыре),", 8, 8, "6 4 (шесть четыре)", "шесть четыре"], "Как убраться мне в квартире?", "Венди ловит комара,", ["8, 9 — 72.", 8, 9, "72", "семьдесят два"]]}];
BLOCKS.forEach(b=>{b.L=b.lines.map(l=>typeof l==='string'?{t:l}:{t:l[0],x:l[1],y:l[2],g:l[3],w:l[4],v:l[1]*l[2]});b.F=b.L.map((l,i)=>l.x?Object.assign({i},l):null).filter(Boolean)});
/* пара для факта: строчка про кошек рядом */
function pairOf(b,i){const L=b.L;if(b.id==='7'&&i===5)return [2,3,4,5];if(b.id==='4a'&&i===2)return [0,1,2,3];if(i>0&&!L[i-1].x)return [i-1,i];if(i+1<L.length&&!L[i+1].x)return [i,i+1];return [i]}
const MODES=[{k:'read',n:'Читаем',i:'📖',d:'Прочитай вслух и запомни'},{k:'gap',n:'Допиши ответ',i:'✏️',d:'Какое число спряталось?'},{k:'pair',n:'Найди пару',i:'🐾',d:'Какая строчка про кошек подходит?'},{k:'order',n:'Собери стишок',i:'🧩',d:'Расставь строчки по порядку'}];

const KEY='stih-umnozh-v1';
const store={get(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
const S=Object.assign({stars:0,done:{},sfx:true},store.get());
const save=()=>store.set(S);
const lvlAt=n=>5*n*(n+3);
const level=st=>{let n=0;while(lvlAt(n+1)<=st)n++;return n};
const $=s=>document.querySelector(s);const view=()=>$('#view');
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
let AC=null;
function tone(f,t,d,type,v){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.15,AC.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+t+d);o.connect(g).connect(AC.destination);o.start(AC.currentTime+t);o.stop(AC.currentTime+t+d+.05)}catch(e){}}
const SFX={ok(){[784,1047,1319].forEach((f,i)=>tone(f,i*.11,.25))},bad(){tone(220,0,.25,'sawtooth',.12);tone(180,.18,.3,'sawtooth',.1)},tap(){tone(880,0,.06,'triangle',.12)},fin(){[523,659,784,1047].forEach((f,i)=>tone(f,i*.14,.35))}};
const play=n=>{if(S.sfx)try{SFX[n]()}catch(e){}};
let RV=null;function pickV(){try{const vs=speechSynthesis.getVoices();RV=vs.find(v=>/^ru/i.test(v.lang))||null}catch(e){}}
try{speechSynthesis.onvoiceschanged=pickV;pickV()}catch(e){}
const canSay=()=>{try{return 'speechSynthesis' in window&&!!RV}catch(e){return false}};
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ru-RU';if(RV)u.voice=RV;u.rate=.85;speechSynthesis.speak(u)}catch(e){}}
const OKS=['Вира от радости покаталась по полу! 🐾','Венди гордо подняла хвост!','Мур-р! Правильно!','Вира довольна — можно и пообедать 😺','Венди мурлычет: «Умница!»'];
const BADS=['Ой! Вира легла на ответ… Попробуй ещё 🙀','Венди смотрит с подозрением 🤨','Почти! Вспомни строчку про кошек.'];

function sync(){$('#starN').textContent=S.stars;const l=level(S.stars);$('#lvlN').textContent=l?'ур. '+l:'';$('#sfx').setAttribute('aria-pressed',S.sfx?'true':'false')}
function addStar(n){const before=level(S.stars);S.stars+=n||1;save();sync();return level(S.stars)>before}
$('#sfx').onclick=()=>{S.sfx=!S.sfx;save();sync()};
$('#home').onclick=()=>{try{speechSynthesis.cancel()}catch(e){}home()};

function poemHTML(b,o){o=o||{};return `<p class="poem">${b.L.map((l,i)=>{let t=esc(l.t);
  if(o.gap===i)t=t.replace(esc(l.g),'<span class="gapw">?</span>');
  return `<span class="ln${l.x?' mul':''}${o.hl&&o.hl.includes(i)?' hl':''}">${t}</span>`}).join('')}</p>`}
const blockDone=b=>MODES.filter(m=>S.done[b.id+':'+m.k]).length;

function home(){
  view().innerHTML=`<a class="hub" href="../">← Игры</a>
  <div class="hero"><div class="cats">${vira('happy',78)}${wendy('happy',68)}</div><h1>Стишок умножения</h1>
  <p>Таблица умножения в стихах с Вирой и Венди. Выбери кусочек: сначала прочитай, потом допиши ответы, найди пары и собери стишок.</p></div>
  <div class="topics">${BLOCKS.map(b=>{const d=blockDone(b);return `<button class="bt${d===MODES.length?' done':''}" data-b="${b.id}"><b>${b.name}</b><span>${b.F.map(f=>`${f.x}×${f.y}`).join(', ')}</span><span class="mods">${MODES.map(m=>`<i class="${S.done[b.id+':'+m.k]?'d':''}">${m.i}</i>`).join('')}</span></button>`}).join('')}
  <button class="bt" data-b="exam" style="background:#FFF6CC"><b>⭐ Экзамен</b><span>Вся таблица вперемешку. Ошибёшься — подскажет стишок.</span></button></div>`;
  view().querySelectorAll('.bt').forEach(x=>x.onclick=()=>{play('tap');x.dataset.b==='exam'?exam():blockMenu(BLOCKS.find(b=>b.id===x.dataset.b))});
  sync();window.scrollTo(0,0);
}
function blockMenu(b){
  view().innerHTML=`<p class="kick" style="color:var(--accent);font-weight:900;margin:0">Кусочек стишка</p><h2 class="ask" style="margin:0 0 12px">${b.name}</h2>
  <div class="card">${poemHTML(b)}</div><div class="modes" style="margin-top:16px">${MODES.map(m=>`<button class="mb${S.done[b.id+':'+m.k]?' ok':''}" data-m="${m.k}"><span class="mi">${m.i}</span><span><b>${m.n}</b><span>${m.d}</span></span>${S.done[b.id+':'+m.k]?'<span class="ck">✓</span>':''}</button>`).join('')}</div>`;
  view().querySelectorAll('.mb').forEach(x=>x.onclick=()=>{play('tap');({read,gap,pair,order})[x.dataset.m](b)});
  window.scrollTo(0,0);
}
function fb(ok,msg){const c=ok?(Math.random()<.5?vira('happy',54):wendy('happy',48)):(Math.random()<.5?vira('sad',54):wendy('sly',48));return `<div class="fb${ok?'':' bad'}">${c}<p>${msg||(ok?OKS:BADS)[Math.floor(Math.random()*(ok?OKS:BADS).length)]}</p></div>`}
function finish(b,k,gain){
  const first=!S.done[b.id+':'+k];S.done[b.id+':'+k]=1;const up=addStar(gain);save();play('fin');
  const next=MODES[MODES.findIndex(m=>m.k===k)+1];
  view().innerHTML=`<div class="card fin"><div class="cats">${vira('happy',90)}${wendy('happy',80)}</div><h2>Готово!</h2><p class="big2">+${gain} ⭐${first?'':' (повторение)'}</p>${up?`<div class="lvup">🏆 <b>Новый уровень ${level(S.stars)}!</b></div>`:''}
  <div class="acts">${next?`<button class="btn" id="nx">${next.i} ${next.n} →</button>`:''}<button class="btn ghost" id="bk">К кусочку</button></div></div>`;
  if(next)$('#nx').onclick=()=>({read,gap,pair,order})[next.k](b);$('#bk').onclick=()=>blockMenu(b);
}
const head=(b,m,i,n)=>`<div class="rtop"><span class="kick">${m.i} ${m.n} · ${b.name}</span>${n?`<span>${i} / ${n}</span>`:''}</div>${n?`<div class="pbar"><i style="width:${i/n*100}%"></i></div>`:''}`;

/* 1. Читаем */
function read(b){
  const m=MODES[0];
  view().innerHTML=head(b,m)+`<div class="card">${poemHTML(b)}${canSay()?'<button class="say" id="sy" aria-label="Послушать">🔊</button>':''}
  <p class="note">Прочитай стишок вслух 2 раза. Синие строчки — это таблица умножения.</p>
  <button class="btn lock" id="dn" disabled style="--t:8s">Прочитала!</button></div>`;
  if(canSay())$('#sy').onclick=()=>say(b.L.map(l=>l.t.replace(/\s*\([^)]*\)/g,'')).join(' '));
  setTimeout(()=>{const d=$('#dn');if(d)d.disabled=false},8000);
  $('#dn').onclick=()=>finish(b,'read',1);
}
/* 2. Допиши ответ */
function gap(b){
  const m=MODES[1];const qs=shuffle(b.F);let i=0,ok=0;
  const step=()=>{if(i>=qs.length)return finish(b,'gap',ok);
    const f=qs[i],P=pairOf(b,f.i);let tries=0;
    view().innerHTML=head(b,m,i,qs.length)+`<div class="card">${poemHTML(b,{gap:f.i,hl:P})}
    <p class="ask" style="text-align:center">${f.x} × ${f.y} = ?</p>
    <form class="inrow" id="f"><input class="inp" id="a" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="ответ"><button class="btn">Проверить</button></form><div id="fb"></div></div>`;
    const a=$('#a');setTimeout(()=>{try{a.focus({preventScroll:true})}catch(e){}},60);
    $('#f').onsubmit=e=>{e.preventDefault();const v=parseInt(a.value,10);if(isNaN(v))return;
      if(v===f.v){play('ok');if(!tries)ok++;a.classList.add('right');a.disabled=true;$('#fb').innerHTML=fb(true,`${f.x} × ${f.y} = ${f.v}`);
        view().querySelector('.gapw').outerHTML=`<b style="color:var(--good)">${esc(f.g)}</b>`;setTimeout(()=>{i++;step()},1400)}
      else{play('bad');tries++;a.classList.add('bad');setTimeout(()=>a.classList.remove('bad'),500);a.select();
        $('#fb').innerHTML=fb(false,tries===1?'Прочитай выделенные строчки вслух — рифма подскажет.':`В стишке это: «${esc(f.w)}». Запиши цифрами.`)}}};
  step();
}
/* 3. Найди пару: по примеру выбрать строчку про кошек (и наоборот) */
function pair(b){
  const m=MODES[2];const all=BLOCKS.flatMap(B=>B.F.map(f=>({B,f})));
  const catLine=(B,f)=>{const P=pairOf(B,f.i).filter(j=>!B.L[j].x);return P.length?B.L[P[0]].t:null};
  const qs=shuffle(b.F.filter(f=>catLine(b,f)));let i=0,ok=0;
  const step=()=>{if(i>=qs.length)return finish(b,'pair',ok);
    const f=qs[i],right=catLine(b,f);const rev=i%2===1;let tries=0;
    let opts,ask;
    if(!rev){const wr=shuffle(all.filter(o=>o.f.v!==f.v).map(o=>catLine(o.B,o.f)).filter(t=>t&&t!==right)).filter((t,k,A)=>A.indexOf(t)===k).slice(0,2);opts=shuffle([right,...wr]);ask=`<p class="q">${f.x} × ${f.y} = ${f.v}</p><p class="note">Какая строчка про кошек к этому примеру?</p>`}
    else{const near=shuffle([f.v+f.x,f.v-f.x,f.v+1,f.v-1,f.v+10].filter(v=>v>0&&v!==f.v)).slice(0,2);opts=shuffle([String(f.v),...near.map(String)]);ask=`<p class="poem" style="text-align:center">${esc(right)}</p><p class="note">Какой пример идёт с этой строчкой? ${f.x} × ${f.y} = ?</p>`}
    const okv=rev?String(f.v):right;
    view().innerHTML=head(b,m,i,qs.length)+`<div class="card">${ask}<div class="opts${rev?' small':''}" style="grid-template-columns:${rev?'repeat(3,1fr)':'1fr'}">${opts.map((o,k)=>`<button class="opt${rev?'':' optl'}" data-k="${k}">${esc(o)}</button>`).join('')}</div><div id="fb"></div></div>`;
    view().querySelectorAll('.opt').forEach(x=>x.onclick=()=>{if(x.disabled)return;if(opts[+x.dataset.k]===okv){play('ok');if(!tries)ok++;x.classList.add('right');view().querySelectorAll('.opt').forEach(y=>y.disabled=true);
        $('#fb').innerHTML=fb(true,pairOf(b,f.i).map(j=>esc(b.L[j].t)).join(' / '));setTimeout(()=>{i++;step()},1600)}
      else{play('bad');tries++;x.classList.add('bad');x.disabled=true;$('#fb').innerHTML=fb(false)}});
  };
  step();
}
/* 4. Собери стишок */
function order(b){
  const m=MODES[3];const L=b.L.map((l,k)=>({t:l.t,k}));const sh=shuffle(L.map((_,k)=>k));let pos=0,miss=0;
  view().innerHTML=head(b,m)+`<div class="card"><p class="note">Нажимай на строчки по порядку — с первой до последней.</p><div class="built" id="bu"></div>
  <div class="ord">${sh.map(k=>`<button class="lt" data-k="${k}">${esc(L[k].t)}</button>`).join('')}</div><div id="fb"></div></div>`;
  view().querySelectorAll('.lt').forEach(x=>x.onclick=()=>{const k=+x.dataset.k;
    if(k===pos){play('tap');x.classList.add('used');$('#bu').insertAdjacentHTML('beforeend',`<span class="ln">${esc(L[k].t)}</span>`);pos++;$('#fb').innerHTML='';
      if(pos===L.length){play('ok');setTimeout(()=>finish(b,'order',Math.max(1,3-Math.floor(miss/2))),900)}}
    else{play('bad');miss++;x.classList.add('bad');setTimeout(()=>x.classList.remove('bad'),500);$('#fb').innerHTML=fb(false,pos===0?'Это не первая строчка. С чего начинается стишок?':`После «${esc(L[pos-1].t)}» идёт другая строчка.`)}});
  window.scrollTo(0,0);
}
/* Экзамен: вся таблица вперемешку */
function exam(){
  const all=shuffle(BLOCKS.flatMap(B=>B.F.map(f=>({B,f})))).slice(0,12);let i=0,ok=0;
  const step=()=>{if(i>=all.length){const up=addStar(ok);play('fin');
      view().innerHTML=`<div class="card fin"><div class="cats">${vira('happy',90)}${wendy('happy',80)}</div><h2>Экзамен сдан!</h2><p class="big2">С первого раза: ${ok} из ${all.length} · +${ok} ⭐</p>${up?`<div class="lvup">🏆 <b>Новый уровень ${level(S.stars)}!</b></div>`:''}<div class="acts"><button class="btn" id="ag">Ещё раз</button><button class="btn ghost" id="bk">К стишку</button></div></div>`;
      $('#ag').onclick=exam;$('#bk').onclick=home;return}
    const {B,f}=all[i];let tries=0;
    view().innerHTML=`<div class="rtop"><span class="kick">⭐ Экзамен</span><span>${i+1} / ${all.length}</span></div><div class="pbar"><i style="width:${i/all.length*100}%"></i></div>
    <div class="card"><p class="q">${f.x} × ${f.y} = ?</p><form class="inrow" id="f"><input class="inp" id="a" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="ответ"><button class="btn">Проверить</button></form><div id="fb"></div></div>`;
    const a=$('#a');setTimeout(()=>{try{a.focus({preventScroll:true})}catch(e){}},60);
    $('#f').onsubmit=e=>{e.preventDefault();const v=parseInt(a.value,10);if(isNaN(v))return;
      if(v===f.v){play('ok');if(!tries)ok++;a.classList.add('right');a.disabled=true;$('#fb').innerHTML=fb(true);setTimeout(()=>{i++;step()},1100)}
      else{play('bad');tries++;a.classList.add('bad');setTimeout(()=>a.classList.remove('bad'),500);a.select();
        const P=pairOf(B,f.i);$('#fb').innerHTML=fb(false,'Вспомни стишок:')+`<div class="card" style="padding:12px"><p class="poem">${P.map(j=>`<span class="ln${B.L[j].x?' mul':''}">${esc(j===f.i&&tries<2?B.L[j].t.replace(B.L[j].g,'…'):B.L[j].t)}</span>`).join('')}</p></div>`}}};
  step();
}
window.__TEST__={BLOCKS,pairOf,S};
sync();home();
