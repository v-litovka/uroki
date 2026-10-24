/* ===== Домашка: интерфейс ===== */
const store={get(){try{return JSON.parse(localStorage.getItem('domashka3'))||{}}catch(e){return {}}},set(v){try{localStorage.setItem('domashka3',JSON.stringify(v))}catch(e){}}};
const S=Object.assign({done:{},sfx:true},store.get());
function save(){store.set(S)}
const $=s=>document.querySelector(s);
const view=()=>$('#view');

/* звуки */
let AC=null,OUT=null;
function ac(){try{if(!AC){AC=new (window.AudioContext||window.webkitAudioContext)();OUT=AC.createGain();OUT.gain.value=1.6;OUT.connect(AC.destination)}if(AC.state==='suspended')AC.resume()}catch(e){AC=null}return AC}
function tone(f,st,d,type,vol,to){const c=ac();if(!c)return;const t=c.currentTime+st,o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+d);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.2,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(OUT);o.start(t);o.stop(t+d+.05)}
const SFX={step(){tone(988,0,.11,'triangle',.3)},right(){[[784,0,.2],[1047,.12,.22],[1319,.24,.42]].forEach(([f,s,d])=>tone(f,s,d,'triangle',.4))},
  wrong(){tone(220,0,.22,'sawtooth',.14,150)},finish(){[523,659,784,1047].forEach((f,i)=>tone(f,i*.13,.28,'triangle',.4));tone(1319,.55,.8,'triangle',.4)}};
function play(n){if(!S.sfx)return;try{SFX[n]()}catch(e){}}

const doneKey=(b,p,n)=>`${b}${p}-${n}`;
function pageDone(b,p){const pg=PAGES[b][p];return pg.ex.filter(e=>S.done[doneKey(b,p,e.n)]).length}

/* ---------- экраны ---------- */
function home(){
  NAV={};
  view().innerHTML=`<section class="hero"><a class="hub" href="../">← Все игры</a><h1>Домашка</h1><p>Решаем домашнее задание по математике по шагам. Ответы не подсказываю — только наводящие вопросы. Думать будешь ты!</p></section>
  <div class="books">${Object.keys(BOOKS).map(b=>{const n=Object.keys(PAGES[b]).length;
    return `<button class="book b-${b}" data-b="${b}"><span class="bi">${b==='wb'?'✏️':'📘'}</span><b>${BOOKS[b].name}</b><span>${n?n+' '+plural(n,'страница','страницы','страниц')+' в игре':'пока страниц нет'}</span></button>`}).join('')}</div>`;
  view().querySelectorAll('.book').forEach(x=>x.onclick=()=>pages(x.dataset.b));
  scrollTo(0,0);
}
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:(m>=2&&m<=4&&(h<12||h>14)?b:c)}
function pages(b){
  const ps=Object.keys(PAGES[b]).map(Number).sort((x,y)=>x-y);
  view().innerHTML=`<button class="back" id="bk">← Назад</button>
  <h2 class="h2">${BOOKS[b].name}</h2>
  <form class="pgform" id="pf"><label for="pn">Какая страница задана?</label><div class="row"><input id="pn" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="№"><button class="btn" type="submit">Открыть</button></div><p class="msg" id="pm" role="status"></p></form>
  ${ps.length?`<p class="sub">Страницы в игре</p><div class="pgs">${ps.map(p=>{const d=pageDone(b,p),t=PAGES[b][p].ex.length;
    return `<button class="pg${d===t?' full':''}" data-p="${p}"><b>стр. ${p}</b><span>${PAGES[b][p].lesson}</span><i>${d} из ${t}</i></button>`}).join('')}</div>`:''}`;
  $('#bk').onclick=home;
  view().querySelectorAll('.pg').forEach(x=>x.onclick=()=>page(b,+x.dataset.p));
  $('#pf').onsubmit=e=>{e.preventDefault();const n=parseInt($('#pn').value,10);
    if(PAGES[b][n])page(b,n);else $('#pm').textContent=isNaN(n)?'Напиши номер страницы.':`Страницы ${n} пока нет в игре. Попроси взрослого сфотографировать её — добавим.`};
  scrollTo(0,0);
}
function page(b,p){
  const pg=PAGES[b][p];
  view().innerHTML=`<button class="back" id="bk">← Страницы</button>
  <p class="kick">${BOOKS[b].short}, страница ${p}</p><h2 class="h2">${pg.lesson}</h2>
  <details class="rulebox"><summary>📖 Тема урока</summary><div>${pg.rule}</div></details>
  <p class="sub">Какое упражнение решаем?</p>
  <div class="exs">${pg.ex.map(e=>`<button class="exb${S.done[doneKey(b,p,e.n)]?' ok':''}" data-n="${e.n}"><span class="num">${e.n}</span><span class="et">${e.title}</span><span class="ck">${S.done[doneKey(b,p,e.n)]?'✓':''}</span></button>`).join('')}</div>`;
  $('#bk').onclick=()=>pages(b);
  view().querySelectorAll('.exb').forEach(x=>x.onclick=()=>{const n=+x.dataset.n;S.done[doneKey(b,p,n)]?doneScreen(b,p,n):run(b,p,n)});
  view().insertAdjacentHTML('beforeend',`<div class="parent"><button class="link" id="par">👨‍👩‍👧 Показать решение (для родителей)</button><div id="pgate"></div></div>`);
  $('#par').onclick=()=>parentGate(b,p);
  scrollTo(0,0);
}


/* запись для тетради — из данных упражнения (тот же вид, что после решения) */
function copyHTML(ex){
  let rec=ex.items.map(it=>it.record||(it.steps.length?it.steps[it.steps.length-1].board||'':''));
  const cols=ex.items.map(i=>i.col).filter(Boolean);
  if(cols.length)rec=[`<table class="tblc">${['Уменьшаемое','Вычитаемое','Разность'].map((h,r)=>`<tr><th>${h}</th>${cols.map(c=>`<td>${r===2?'<b>'+c[r]+'</b>':c[r]}</td>`).join('')}</tr>`).join('')}</table>`];
  rec=rec.filter(Boolean);
  return `${rec.join('').includes('class="pen"')?'<p class="penl">✏️ ПРОМЕЖУТОЧНЫЕ ОТВЕТЫ (СЕРЫЕ) ПЕРЕПИШИ КАРАНДАШОМ В ТЕТРАДЬ!</p>':''}<div class="copy">${rec.map(r=>`<div class="bl">${r}</div>`).join('')}</div>`;
}
let PARENT=false;
function doneScreen(b,p,n){
  const ex=PAGES[b][p].ex.find(e=>e.n===n);
  view().innerHTML=`<button class="back" id="bk">← Упражнения</button>
  <div class="task"><p class="kick">${BOOKS[b].short}, стр. ${p} · упражнение ${n}</p><div class="tt">${ex.text}</div></div>
  <div class="card"><h3 class="win">✓ Это упражнение уже решено</h3><p class="sub">Что делаем?</p>
  <div class="acts"><button class="btn" id="cp">✏️ Переписать в тетрадь</button><button class="btn ghost" id="rs">🔄 Начать заново</button></div><div id="cpw"></div></div>`;
  $('#bk').onclick=()=>page(b,p);
  $('#rs').onclick=()=>run(b,p,n);
  $('#cp').onclick=()=>{$('#cpw').innerHTML=`<p class="sub">Перепиши в тетрадь</p>${copyHTML(ex)}`;$('#cp').disabled=true};
  scrollTo(0,0);
}
function parentGate(b,p){
  const box=$('#pgate');
  if(PARENT)return parentView(b,p);
  box.innerHTML=`<form class="row" id="pwf" autocomplete="off"><input id="pw" type="password" inputmode="numeric" pattern="[0-9]*" placeholder="пароль" aria-label="пароль для родителей"><button class="btn" type="submit">Открыть</button></form><p class="msg" id="pwm"></p>`;
  const i=$('#pw');setTimeout(()=>{try{i.focus()}catch(e){}},50);
  $('#pwf').onsubmit=e=>{e.preventDefault();if(i.value.trim()==='2924'){PARENT=true;parentView(b,p)}else{$('#pwm').textContent='Неверный пароль';i.select()}};
}
function parentView(b,p){
  const pg=PAGES[b][p];
  view().innerHTML=`<button class="back" id="bk">← Упражнения</button>
  <p class="kick">Для родителей · ${BOOKS[b].short}, страница ${p}</p><h2 class="h2">Решение: ${pg.lesson}</h2>
  ${pg.ex.map(e=>`<div class="task sol"><p class="kick">Упражнение ${e.n}</p><div class="tt">${e.text}</div>${copyHTML(e)}</div>`).join('')}
  <button class="btn ghost" id="lock">🔒 Закрыть решение</button>`;
  $('#bk').onclick=()=>page(b,p);$('#lock').onclick=()=>{PARENT=false;page(b,p)};
  scrollTo(0,0);
}

/* ---------- решение упражнения ---------- */
let R=null;
function run(b,p,n){
  const ex=PAGES[b][p].ex.find(e=>e.n===n);
  R={b,p,ex,item:0,step:0,miss:0,hint:0,records:[]};
  view().innerHTML=`<button class="back" id="bk">← Упражнения</button>
  <div class="task"><p class="kick">${BOOKS[b].short}, стр. ${p} · упражнение ${n}</p><div class="tt">${ex.text}</div>
  <details class="rulebox"><summary>📖 Правило</summary><div>${ex.rule}</div></details></div>
  <div id="prog" class="prog"></div>
  <div id="board" class="board"></div>
  <div id="stepc" class="card"></div>
  <div id="hintc"></div>`;
  $('#bk').onclick=()=>page(b,p);
  showStep();
}
function curItem(){return R.ex.items[R.item]}
function curStep(){return curItem().steps[R.step]}
function setBoard(html){$('#board').innerHTML=html||'';$('#board').hidden=!html}
function showStep(){
  const it=curItem(),st=curStep(),items=R.ex.items.length;
  $('#prog').innerHTML=items>1?`<span>Пример ${R.item+1} из ${items}</span>`+R.ex.items.map((_,i)=>`<i class="${i<R.item?'d':i===R.item?'c':''}"></i>`).join(''):'';
  if(R.step===0)setBoard(it.start);
  R.miss=0;R.hint=0;$('#hintc').innerHTML='';
  const c=$('#stepc');
  let body='';
  if(st.k==='pick'){
    body=`<div class="opts${st.svg?' svgs':''}${st.signs?' signs':''}">${st.opts.map((o,i)=>`<button class="opt" data-i="${i}">${st.signs||st.svg?o:fmt(o)}</button>`).join('')}</div>`;
  }else if(st.k==='multi'){
    body=`<div class="chips">${st.opts.map((o,i)=>`<button class="chip" data-i="${i}" aria-pressed="false">${st.raw?o:exprHTML(o)}</button>`).join('')}</div><button class="btn" id="chk">Проверить</button>`;
  }else if(st.k==='num'){
    body=`<form class="numf" id="nf"><input id="ni" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="ответ"><button class="btn" type="submit">Проверить</button></form>`;
  }else if(st.k==='nums'){
    body=`<form class="numf" id="nf">${st.pre?`<span class="tk big2">${st.pre}</span>`:''}${st.fields.map((f,i)=>`<label class="nfl"><input class="nfi" data-i="${i}" inputmode="numeric" pattern="[0-9]*" autocomplete="off" aria-label="${f.u}"> ${f.u}</label>`).join('')}<button class="btn" type="submit">Проверить</button></form>`;
  }else if(st.k==='note'){
    body=`<button class="btn locking" id="ntb" disabled style="--t:3s"><span class="lbl">${st.btn||'Готово'}</span></button>`;
  }else if(st.k==='order'){
    body=`<div class="bl big">${exprHTML(st.expr,{},{tap:1})}</div>`;
  }
  c.innerHTML=`<p class="q">${st.q}</p>${st.show||''}${body}${st.k==='note'?'':'<button class="link" id="hb">Не знаю, подскажи</button>'}`;
  if(st.k==='note'){const b=$('#ntb');setTimeout(()=>{b.disabled=false;b.classList.remove('locking')},3000);b.onclick=()=>{if(!b.disabled)good()};return}
  $('#hb').onclick=()=>hint(true);
  if(st.k==='pick')c.querySelectorAll('.opt').forEach(x=>x.onclick=()=>{if(+x.dataset.i===st.ok||(st.alt||[]).includes(+x.dataset.i)){x.classList.add('right');good()}else{x.classList.add('bad');setTimeout(()=>x.classList.remove('bad'),600);bad()}});
  if(st.k==='multi'){c.querySelectorAll('.chip').forEach(x=>x.onclick=()=>x.setAttribute('aria-pressed',x.getAttribute('aria-pressed')==='true'?'false':'true'));
    $('#chk').onclick=()=>{const sel=[...c.querySelectorAll('.chip')].filter(x=>x.getAttribute('aria-pressed')==='true').map(x=>+x.dataset.i);
      const miss=st.ok.filter(i=>!sel.includes(i)).length,extra=sel.filter(i=>!st.ok.includes(i)).length;
      const M=st.msgs||{};if(!miss&&!extra)good();else bad(extra?(M.extra||'Отмечено лишнее. В выражении с переменной обязательно есть буква.'):!sel.length?(M.none||'Ничего не отмечено. Нажми на выражения, в которых есть буква.'):(M.miss||'Отмечены не все. Проверь каждое выражение ещё раз.'))}}
  if(st.k==='num'){const inp=$('#ni');setTimeout(()=>{try{inp.focus({preventScroll:true})}catch(e){}},50);
    $('#nf').onsubmit=e=>{e.preventDefault();const v=inp.value.trim();if(!v)return;const n=parseInt(v,10);
      if(st.any||n===st.ok){inp.classList.add('right');good()}else{inp.select();bad(numFeedback(st,n))}}}
  if(st.k==='nums'){const ins=[...c.querySelectorAll('.nfi')];setTimeout(()=>{try{ins[0].focus({preventScroll:true})}catch(e){}},50);
    $('#nf').onsubmit=e=>{e.preventDefault();const v=ins.map(x=>parseInt(x.value,10));if(v.some(isNaN))return bad('Заполни все окошки.');
      if(st.check?st.check(v):st.fields.every((f,i)=>f.ok===v[i])){ins.forEach(x=>x.classList.add('right'));good()}else bad()}}
  if(st.k==='order'){let pos=0;c.querySelectorAll('.opb').forEach(x=>x.onclick=()=>{if(x.classList.contains('set'))return;
    if(+x.dataset.i===st.ok[pos]){pos++;x.classList.add('set');x.querySelector('.ci').textContent=pos;x.querySelector('.ci').classList.add('on');play('step');if(pos===st.ok.length)good()}
    else{x.classList.add('bad');setTimeout(()=>x.classList.remove('bad'),600);bad(pos===0?'Это действие не первое.':'Это действие пока рано делать.')}})}
}
function fmt(o){return /^[\d\s()+−·:a-z]+$/.test(o)?exprHTML(o):o}
function numFeedback(st,n){
  if(!st.act)return '';
  const {a,o,b}=st.act;const nm={'+':'сложение','−':'вычитание','·':'умножение',':':'деление'};
  for(const p of '+−·:'){if(p!==o&&(p!==':'||a%b===0)&&apply(a,p,b)===n)return `Похоже, получилось ${nm[p]}, а знак тут «${o}» — ${nm[o]}.`}
  return '';
}
function hint(asked){
  const st=curStep();const hs=st.hints||[];if(!hs.length)return;
  const h=hs[Math.min(R.hint,hs.length-1)];R.hint++;
  $('#hintc').innerHTML=`<div class="hint" role="status"><b>${asked?'Подсказка':'Подумай ещё'}</b><p>${h}</p></div>`;
}
function bad(msg){
  play('wrong');R.miss++;
  const st=curStep(),hs=st.hints||[];
  const h=hs.length?hs[Math.min(R.hint,hs.length-1)]:'';R.hint++;
  $('#hintc').innerHTML=`<div class="hint bad" role="status"><b>Не так, попробуй ещё</b>${msg?`<p>${msg}</p>`:''}${h?`<p>${h}</p>`:''}</div>`;
}
function good(){
  const st=curStep(),it=curItem();
  if(st.board)setBoard(st.board);
  $('#hintc').innerHTML='';
  $('#stepc').querySelectorAll('button,input').forEach(x=>x.disabled=true);
  if(st.why){showWhy(st);return}
  advance();
}
function showWhy(st){
  play('step');
  const w=st.why;const hb=$('#hb');if(hb)hb.remove();
  const q=w.q||(st.k==='pick'&&!st.svg?`Почему <b${String(st.opts[st.ok]).length<18?' class="nw"':''}>${st.signs?st.opts[st.ok]:fmt(st.opts[st.ok])}</b>?`:'Почему?');
  const opts=[{t:w.ok,ok:1}].concat((w.no||[]).map(t=>({t,ok:0})));
  for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]]}
  const single=opts.length===1;
  $('#stepc').insertAdjacentHTML('beforeend',`<div class="why" role="status"><b class="wh">Верно! ${q}</b>
    <div class="wopts">${opts.map((o,i)=>`<button class="wopt${single?' btn locking':''}" data-ok="${o.ok}" ${single?'disabled style="--t:5s"':''}><span class="lbl">${o.t}</span></button>`).join('')}</div>
    <p class="wmsg" id="wmsg"></p></div>`);
  try{$('.why').scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}
  const bs=[...document.querySelectorAll('.wopt')];
  if(single)setTimeout(()=>{bs[0].disabled=false;bs[0].classList.remove('locking')},5000);
  bs.forEach(b=>b.onclick=()=>{if(b.disabled)return;
    if(b.dataset.ok==='1'){b.classList.add('right');bs.forEach(x=>x.disabled=true);play('step');setTimeout(advance,700)}
    else{play('wrong');b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),600);$('#wmsg').textContent='Нет, это не так. Подумай ещё.'}});
}
function advance(){
  const it=curItem();
  R.step++;
  if(R.step<it.steps.length){setTimeout(showStep,450);return}
  play('right');R.records.push(it.record||'');
  R.item++;R.step=0;
  if(R.item<R.ex.items.length){$('#stepc').insertAdjacentHTML('beforeend','<p class="okmsg">Верно! Дальше следующий пример.</p>');setTimeout(showStep,1300);return}
  finish();
}
function finish(){
  play('finish');S.done[doneKey(R.b,R.p,R.ex.n)]=1;save();
  const pg=PAGES[R.b][R.p],next=pg.ex.find(e=>e.n>R.ex.n&&!S.done[doneKey(R.b,R.p,e.n)])||pg.ex.find(e=>!S.done[doneKey(R.b,R.p,e.n)]);
  $('#stepc').innerHTML=`<h3 class="win">⭐ Упражнение ${R.ex.n} решено!</h3>
  <p class="sub">Перепиши в тетрадь</p>${copyHTML(R.ex)}
  <div class="acts">${next?`<button class="btn" id="nx">Упражнение ${next.n} →</button>`:'<p class="okmsg">Вся страница решена! Молодец!</p>'}<button class="btn ghost" id="tp">К упражнениям</button></div>`;
  if(next)$('#nx').onclick=()=>run(R.b,R.p,next.n);
  $('#tp').onclick=()=>page(R.b,R.p);
  setBoard('');
}
document.addEventListener('DOMContentLoaded',()=>{
  const stl=document.createElement('style');stl.textContent=SCHEME_CSS;document.head.appendChild(stl);
  const sb=$('#sfx');sb.setAttribute('aria-pressed',S.sfx?'true':'false');
  sb.onclick=()=>{S.sfx=!S.sfx;save();sb.setAttribute('aria-pressed',S.sfx?'true':'false')};
  home();
});
let NAV={};
