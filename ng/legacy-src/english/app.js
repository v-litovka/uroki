/* ===== English with Vira & Wendy: движок ===== */
const store={get(){try{return JSON.parse(localStorage.getItem('english3'))||{}}catch(e){return {}}},set(v){try{localStorage.setItem('english3',JSON.stringify(v))}catch(e){}}};
const S=Object.assign({stars:0,lv:{},sel:['pron'],done:{},sfx:true,voice:true,minutes:15,goal:20,history:[]},store.get());
const save=()=>store.set(S);
const $=s=>document.querySelector(s);
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lvlAt=n=>5*n*(n+3);
const levelOf=st=>{let n=0;while(lvlAt(n+1)<=st)n++;return n};
const LVN=['лёгкий','средний','сложный'];
const TOPICS=[{id:'pron',n:'★',en:'He, she, they…',ru:'Местоимения: мой папа → he',pic:'👨➡️<b>he</b>',c:'#E2557A'},
 {id:'be',n:'★',en:'am / is / are',ru:'Глагол to be: не…, вопросы',pic:'🐄🐱 <b>is</b>',c:'#2D6CDF'},
 {id:'have',n:'★',en:'have got / has got',ru:'У меня есть… / нет…, вопросы',pic:'🥣 <b>has</b>',c:'#13A3A0'},
 {id:'can',n:'★',en:'can / can\'t',ru:'Могу, не могу, вопросы',pic:'🐈✅🐄❌',c:'#FF8A1C'}].concat(UNITS.map(u=>({id:u.id,n:u.n,en:u.en,ru:u.ru,pic:u.pic,c:u.c})));
const LVD={be:['am / is / are, узнать отрицание','Сделай «не…», вопрос, короткий ответ','Собери вопрос из слов, напиши сама'],have:['have или has, узнать hasn\'t','«Нет у…», вопрос Has…got?, короткий ответ','Собери вопрос из слов, напиши сама'],can:['can или can\'t по картинке','«Не может», вопрос Can…?, короткий ответ','Собери вопрос из слов, напиши сама'],pron:['Кто это? he, she, it, they — с картинками','Замени в предложении: he → his, she → her','Два шага: кто это → чей? Все местоимения'],
  unit:['Картинка → слово, слушай → картинка','Слово с перепутанными буквами, собери из букв','Собери из букв с лишними, напиши сама']};

/* ---------- звук и голос ---------- */
let AC=null;
function tone(f,st,d,type,vol){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();const t=AC.currentTime+st,o=AC.createOscillator(),g=AC.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol||.25,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+.05)}catch(e){}}
const SFX={ok(){[784,1047,1319].forEach((f,i)=>tone(f,i*.11,.25))},bad(){tone(220,0,.25,'sawtooth',.12);tone(180,.18,.3,'sawtooth',.1)},tap(){tone(880,0,.06,'triangle',.12)},meow(){tone(700,0,.12,'sine',.2);tone(900,.08,.25,'sine',.18)},fin(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.12,.3))}};
const play=n=>{if(S.sfx)try{SFX[n]()}catch(e){}};
let VOICE=null;
function pickVoice(){try{const vs=speechSynthesis.getVoices();VOICE=vs.find(v=>/en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null}catch(e){}}
try{speechSynthesis.onvoiceschanged=pickVoice;pickVoice()}catch(e){}
function say(t){if(!S.voice||!t)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t.replace(/___/g,'…'));u.lang='en-GB';if(VOICE)u.voice=VOICE;u.rate=.8;speechSynthesis.speak(u)}catch(e){}}
const canSpeak=()=>{try{return 'speechSynthesis' in window}catch(e){return false}};

/* ---------- слова с перепутанными буквами ---------- */
const VOW='aeiou';
function scrambles(w){
  const out=new Set(),f=w[0],l=w[w.length-1],core=w.slice(1,-1).split('');
  const add=c=>{const v=f+c.join('')+l;if(v!==w)out.add(v)};
  for(let t=0;t<40&&out.size<6;t++){
    const c=core.slice(),k=t%4;
    if(k===0&&c.length>=2){add(shuffle(c))}
    else if(k===1){const idx=c.map((x,i)=>VOW.includes(x)?i:-1).filter(i=>i>=0);if(idx.length){const i=idx[Math.floor(Math.random()*idx.length)];c[i]=pickOne(VOW.split('').filter(v=>v!==c[i]));add(c)}}
    else if(k===2&&c.length>=2){const i=Math.floor(Math.random()*(c.length-1));[c[i],c[i+1]]=[c[i+1],c[i]];add(c)}
    else if(k===3){const i=Math.floor(Math.random()*c.length);if(!VOW.includes(c[i])){c.splice(i,0,c[i]);add(c)}else{c[i]=pickOne('aeiou'.split(''));add(c)}}
  }
  return shuffle([...out]).slice(0,3);
}
const spellable=w=>/^[A-Za-z]{3,11}$/.test(w[0]);

/* ---------- задания ---------- */
const wordsOf=id=>UNITS.find(u=>u.id===id).words;
function others(list,w,n){return shuffle(list.filter(x=>x[0]!==w[0]&&x[1]!==w[1])).slice(0,n)}
const big=w=>`<div class="pic">${picHTML(w)}</div>`;
const ruL=w=>`<p class="ru">${w[2]}</p>`;
function genUnit(id,lv){
  const ws=wordsOf(id),sp=ws.filter(spellable),gr=GR[id]||[];
  const kinds=lv===0?['p2w','p2w','l2p','gram','gram']:lv===1?['scr','scr','tiles','gram','p2w']:['tilesX','spell','spell','gramT','scr'];
  let k=pickOne(kinds);
  if((k==='scr'||k==='tiles'||k==='tilesX'||k==='spell')&&!sp.length)k='p2w';
  if(k==='scr'&&!sp.some(w=>w[0].length>=4))k='p2w';
  if((k==='gram'||k==='gramT')&&!gr.length)k='p2w';
  if(k==='l2p'&&!canSpeak())k='p2w';
  const w=pickOne(k==='scr'?sp.filter(w=>w[0].length>=4):(k==='tiles'||k==='tilesX'||k==='spell')?sp:ws);
  switch(k){
    case 'p2w':return {kind:'choice',key:id+':'+w[0],ask:'Что это по-английски?',show:big(w)+ruL(w),opts:shuffle([w[0],...others(ws,w,2).map(x=>x[0])]),ans:w[0],say:w[0],rule:wordRule(w),hint:wordHint(w)};
    case 'l2p':{const o=shuffle([w,...others(ws,w,2)]);return {kind:'choice',key:id+':'+w[0],ask:'Послушай и выбери картинку',listen:w[0],show:'',pics:1,opts:o.map(x=>x[0]),optHTML:o.map(x=>`<span class="op">${picHTML(x)}</span>`),ans:w[0],say:w[0],rule:wordRule(w),hint:`Слушай ещё раз 🔊 — ${wordHint(w)}`}}
    case 'scr':return {kind:'choice',key:id+':'+w[0],ask:'Какое слово написано правильно?',show:big(w)+ruL(w),opts:shuffle([w[0],...scrambles(w[0])]),ans:w[0],say:w[0],sayFirst:1,hint:'Первая и последняя буквы у всех одинаковые — смотри на <b>середину</b> слова. Послушай, как оно звучит.',rule:`Первая и последняя буквы у всех одинаковые — смотри на <b>середину</b>. Правильно: <b>${w[0]}</b> — ${w[2]}.`};
    case 'tiles':return {kind:'tiles',key:id+':'+w[0],ask:'Собери слово из букв',show:big(w)+ruL(w),word:w[0],extra:0,say:w[0],rule:wordRule(w)};
    case 'tilesX':return {kind:'tiles',key:id+':'+w[0],ask:'Собери слово. Осторожно: есть лишние буквы!',show:big(w)+ruL(w),word:w[0],extra:3,say:w[0],rule:wordRule(w)};
    case 'spell':return {kind:'spell',key:id+':'+w[0],ask:'Напиши слово сама',show:big(w)+ruL(w),word:w[0],say:w[0],rule:wordRule(w)};
    case 'gram':case 'gramT':{const g=pickOne(gr);const typ=k==='gramT'&&/^[a-z]+$/.test(g[1]);
      return {kind:typ?'type':'choice',key:id+':g:'+g[0],ask:typ?'Впиши пропущенное слово':'Выбери слово для пропуска',show:`<div class="pic sm">${g[4]}</div><p class="sent">${gapHTML(g[0])}</p>`,
        opts:shuffle([g[1],...g[2]]),ans:g[1],accept:[g[1]],say:g[0].replace('___',g[1]),rule:g[3],sentFill:g[0]}}
  }
}
const gapHTML=s=>esc(s).replace('___','<span class="gap">?</span>');
const wordHint=w=>`Подсказка: слово начинается на <b>«${w[0][0]}»</b>, в нём ${w[0].replace(/[^A-Za-z]/g,'').length} ${w[0].replace(/[^A-Za-z]/g,'').length<5?'буквы':'букв'}.`;
const wordRule=w=>`<span class="big">${picHTML(w)}</span> <b>${w[0]}</b> — ${w[2]}`;

const PR_ICON={He:'👨',She:'👩',It:'📦',They:'👨‍👩‍👧',We:'🙋‍♀️🙋',I:'🙋‍♀️',You:'🫵'};
const PR_RU={He:'он',She:'она',It:'это (предмет, животное)',They:'они',We:'мы',I:'я',You:'ты'};
const POSS={i:'my',you:'your',he:'his',she:'her',it:'its',we:'our',they:'their'};
const PRON_RULE=`<table class="pt"><tr><th></th><th>кто?</th><th>чей?</th></tr>
<tr><td>👨 он</td><td><b>he</b></td><td><b>his</b></td></tr><tr><td>👩 она</td><td><b>she</b></td><td><b>her</b></td></tr>
<tr><td>📦🐶 оно</td><td><b>it</b></td><td><b>its</b></td></tr><tr><td>👨‍👩‍👧 они</td><td><b>they</b></td><td><b>their</b></td></tr>
<tr><td>🙋‍♀️ я</td><td><b>I</b></td><td><b>my</b></td></tr><tr><td>🙋‍♀️🙋 мы</td><td><b>we</b></td><td><b>our</b></td></tr></table>
<p>Мальчик, папа, дедушка → <b>he</b>. Девочка, мама, бабушка, Вира → <b>she</b>. Вещь → <b>it</b>. Двое и больше → <b>they</b>.</p>
<p>🐈 <b>Животное:</b> кошка с улицы, чужая собака → <b>it</b>. А наша Вира — член семьи, мы знаем, что она девочка → <b>she</b>. Венди тоже <b>she</b>.</p>`;
function genPron(lv){
  const kinds=lv===0?['who','who','ru']:lv===1?['sent','sent','poss','who']:['two','two','sentAll','typeP'];
  const k=pickOne(kinds);
  if(k==='who'){const p=pickOne(PRON_SUBJ);const opts=['He','She','It','They'].concat(p[2]==='We'?['We']:[]);
    return {kind:'choice',key:'pron:'+p[0],ask:'Замени одним словом: кто это?',show:`<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])}</p><p class="ru">${p[3]}</p>`,
      opts,optHTML:opts.map(o=>`<span class="pi">${PR_ICON[o]}</span>${o}`),ans:p[2],say:p[0]+'. '+p[2],rule:PRON_RULE,pr:1}}
  if(k==='ru'){const p=pickOne(PRON_RU);const opts=['He','She','It','They'].concat(p[2]==='We'?['We']:[]);
    return {kind:'choice',key:'pronru:'+p[0],ask:'Как сказать по-английски одним словом?',show:`<div class="pic">${p[1]}</div><p class="sent">«${p[0]}»</p>`,opts,optHTML:opts.map(o=>`<span class="pi">${PR_ICON[o]}</span>${o}`),ans:p[2],say:p[2],rule:PRON_RULE,pr:1}}
  if(k==='sent'||k==='sentAll'||k==='typeP'){const p=pickOne(PRON_SENT);
    const all=k==='sentAll'?shuffle([p[2],...shuffle(['He','She','It','They','His','Her','Their','Its','My','Our'].filter(x=>x.toLowerCase()!==p[2].toLowerCase())).slice(0,4)]).map(x=>/^[A-Z]/.test(p[2])?x:x.toLowerCase()):shuffle([p[2],...p[3]]);
    return {kind:k==='typeP'?'type':'choice',key:'ps:'+p[1],ask:k==='typeP'?'Впиши нужное слово':'Какое слово вместо пропуска?',show:`<div class="pic sm">${p[4]}</div><p class="sent">${esc(p[0])}<br>${gapHTML(p[1])}</p>`,
      opts:all,ans:p[2],accept:[p[2].toLowerCase()],ci:1,say:p[0]+' '+p[1].replace('___',p[2]),rule:PRON_RULE,pr:1}}
  if(k==='poss'){const p=pickOne(PRON_POSS);const opts=shuffle(['his','her','their','its']);
    return {kind:'choice',key:'pp:'+p[0],ask:'Замени: чей?',show:`<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])} → <span class="gap">?</span> ${esc(p[0].split(' ').pop())}</p>`,opts,ans:p[2],say:p[2]+' '+p[0].split(' ').pop(),rule:PRON_RULE,pr:1}}
  /* два шага: кто → чей */
  const p=pickOne(PRON_POSS),obj=p[0].split(' ').pop(),who=p[3];
  return {kind:'steps',key:'pp2:'+p[0],rule:PRON_RULE,pr:1,say:p[2]+' '+obj,steps:[
    {ask:'Шаг 1. Кто владелец? Замени одним словом',show:`<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])}</p>`,opts:['he','she','it','they'],optHTML:['he','she','it','they'].map(o=>`<span class="pi">${PR_ICON[o[0].toUpperCase()+o.slice(1)]}</span>${o}`),ans:who},
    {ask:`Шаг 2. <b>${who}</b> → чей? Выбери слово`,show:`<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])} → <span class="gap">?</span> ${esc(obj)}</p>`,opts:shuffle(['my','your','his','her','its','our','their']),ans:p[2],small:1}]};
}
function genQ(topic){const lv=S.lv[topic]||0;return topic==='pron'?genPron(lv):topic==='be'?genBe(lv):topic==='have'?genHave(lv):topic==='can'?genCan(lv):genUnit(topic,lv)}

/* ---------- экраны ---------- */
const view=()=>$('#view');
function updStars(){$('#starN').textContent=S.stars;const n=levelOf(S.stars);$('#lvlN').textContent=n?'ур. '+n:''}
function menu(){
  if(R&&R.t0&&!R.done){finish('stop');return}
  R=null;clearInterval(TICK);$('#strip').hidden=true;document.body.classList.remove('playing');updStars();
  view().innerHTML=`<section class="hero"><a class="hub" href="../">← Все игры</a>
    <div class="cats">${vira('happy',96)}${wendy('happy',84)}</div>
    <h1>English с Вирой и Венди</h1>
    <p>Учебник Magic Box 3. Выбери темы, которые проходите, и уровень. Вира — толстая пятнистая, любит поесть и валяться на полу. Венди — худая и быстрая. Они будут болеть за тебя!</p></section>
    <div class="topics">${TOPICS.map(t=>{const on=S.sel.includes(t.id),lv=S.lv[t.id]||0,d=S.done[t.id]||0,ld=(LVD[t.id]||LVD.unit)[lv];
      return `<div class="tw"><button class="topic${t.id==='pron'?' star':''}" data-t="${t.id}" aria-pressed="${on}" style="--c:${t.c}">
        <span class="tpic">${t.pic}</span><span class="tn">${t.id==='pron'?'Главное!':t.n==='★'?'Грамматика':'Unit '+t.n}</span><b class="ten">${t.en}</b><span class="tru">${t.ru}</span><span class="tdone">решено: ${d}</span><span class="tck">✓</span></button>
        <div class="lvrow">${LVN.map((n,j)=>`<button class="lvb" data-t="${t.id}" data-l="${j}" aria-pressed="${lv===j}">${n}</button>`).join('')}</div><p class="lvd">${ld}</p></div>`}).join('')}</div>
    <div class="settings">
      <div class="set"><span class="setl">Время</span><div class="stepper"><button id="tM" aria-label="Меньше минут">−</button><output id="tV"></output><button id="tP" aria-label="Больше минут">+</button></div></div>
      <div class="set"><span class="setl">Цель</span><div class="stepper"><button id="gM" aria-label="Меньше ответов">−</button><output id="gV"></output><button id="gP" aria-label="Больше ответов">+</button></div><span class="setu">правильных</span></div>
      <p class="snote" id="sN"></p></div>
    <div class="menu-actions"><button class="btn big" id="go">Начать занятие</button>
    <label class="tog"><input type="checkbox" id="vc" ${S.voice?'checked':''}> озвучка слов 🔊</label></div>`;
  view().querySelectorAll('.topic').forEach(b=>b.onclick=()=>{const t=b.dataset.t,i=S.sel.indexOf(t);if(i>=0){if(S.sel.length>1)S.sel.splice(i,1)}else S.sel.push(t);save();b.setAttribute('aria-pressed',S.sel.includes(t));play('tap')});
  view().querySelectorAll('.lvb').forEach(b=>b.onclick=()=>{S.lv[b.dataset.t]=+b.dataset.l;if(!S.sel.includes(b.dataset.t))S.sel.push(b.dataset.t);save();menu()});
  $('#vc').onchange=e=>{S.voice=e.target.checked;save()};
  const sync=()=>{$('#tV').textContent=S.minutes+' мин';$('#gV').textContent=S.goal;$('#sN').textContent=`Если за ${S.minutes} мин будет меньше ${S.goal} правильных, игра даст добавочное время и покажет, сколько ответов осталось до финиша.`;save()};
  const bump=(id,f)=>{$(id).onclick=()=>{f();sync();play('tap')}};
  bump('#tM',()=>S.minutes=Math.max(5,S.minutes-5));bump('#tP',()=>S.minutes=Math.min(60,S.minutes+5));
  bump('#gM',()=>S.goal=Math.max(5,S.goal-5));bump('#gP',()=>S.goal=Math.min(100,S.goal+5));sync();
  const h=(S.history||[]).slice(0,5);
  if(h.length)view().insertAdjacentHTML('beforeend',`<div class="hist"><h3>Прошлые занятия</h3><table><tr><th>Когда</th><th>Правильных</th><th>Ошибок</th><th>Время</th></tr>${h.map(x=>{const d=new Date(x.d);return `<tr><td>${d.toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}, ${d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}</td><td class="${x.c>=x.g?'okc':''}">${x.c} из ${x.g}</td><td>${x.w}</td><td>${mmss(x.t)}${x.k==='stop'?' · остановлено':''}</td></tr>`}).join('')}</table></div>`);
  $('#go').onclick=start;scrollTo(0,0);
}
let R=null;
let TICK=null;
const mmss=t=>{t=Math.max(0,Math.round(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0')};
function start(){R={n:0,ok:0,bad:0,seen:new Set(),t0:Date.now(),lim:S.minutes*60,done:false,learned:0};
  $('#strip').hidden=false;document.body.classList.add('playing');clearInterval(TICK);TICK=setInterval(tick,1000);tick();next()}
function elapsed(){return (Date.now()-R.t0)/1000}
function tick(){
  if(!R||R.done)return;
  const left=R.lim-elapsed(),c=$('#clk');
  if(left>0){c.textContent=mmss(left);c.className='clock'+(left<60?' soon':'')}
  else{c.textContent='+'+mmss(-left);c.className='clock over'}
  const g=Math.min(1,R.ok/S.goal);$('#gbar').style.width=g*100+'%';
  $('#glbl').textContent=R.ok>=S.goal?`Цель есть! ${R.ok} правильных`:`${R.ok} из ${S.goal} правильных`;
}
function next(){
  if(R.done)return;
  const left=R.lim-elapsed();
  if(left<=0&&R.ok>=S.goal)return finish('ok');
  if(left<=0&&!R.extraShown){R.extraShown=true;return extra()}
  let q,t;for(let k=0;k<12;k++){t=pickOne(S.sel);q=genQ(t);if(!R.seen.has(q.key))break}
  R.seen.add(q.key);q.topic=t;R.n++;R.q=q;R.tries=0;R.fail=false;
  render(q);
}
function extra(){
  const need=S.goal-R.ok;play('meow');
  view().innerHTML=`<div class="card fin"><p class="kick" style="color:var(--trap)">Время вышло</p><div class="cats">${vira('wow',90)}${wendy('sly',80)}</div>
   <h2>Ещё ${need} ${plural(need,'правильный ответ','правильных ответа','правильных ответов')}<br>${plural(need,'остался','осталось','осталось')}, чтобы закончить</h2>
   <p class="big2">Цель на сегодня — ${S.goal}. Добиваем, и занятие закончится само. Вира уже ждёт рыбку!</p><button class="btn big" id="xg">Добиваем!</button></div>`;
  $('#xg').onclick=next;
}
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:(m>=2&&m<=4&&(h<12||h>14)?b:c)};
function head(){const t=TOPICS.find(x=>x.id===R.q.topic);return `<div class="rtop"><span class="kick" style="color:${t.c}">${t.id==='pron'?'Местоимения':t.n==='★'?t.en:'Unit '+t.n+' · '+t.en}</span><span class="cnt">задание ${R.n}</span></div>`}
function render(q){
  if(q.kind==='steps'){R.si=R.si||0;const st=Object.assign({kind:'choice',rule:q.rule,pr:q.pr},q.steps[R.si]);return renderChoice(st,true)}
  if(q.kind==='choice')return renderChoice(q);
  if(q.kind==='tiles')return renderTiles(q);
  if(q.kind==='spell')return renderSpell(q);
  if(q.kind==='type')return renderType(q);
  if(q.kind==='words')return renderWords(q);
}
function card(q,body){
  view().innerHTML=`${head()}<div class="card" id="qc"><p class="ask">${q.ask}</p>${q.listen?`<button class="say" id="lis" aria-label="Послушать">🔊</button>`:''}${q.show||''}${body}<div id="fb"></div></div>`;
  if(q.listen){$('#lis').onclick=()=>say(q.listen);setTimeout(()=>say(q.listen),300)}
}
function renderChoice(q,isStep){
  card(q,`<div class="opts${q.pics?' pics':''}${q.small?' small':''}">${q.opts.map((o,i)=>`<button class="opt" data-v="${esc(o)}">${q.optHTML?q.optHTML[i]:esc(o)}</button>`).join('')}</div>`);
  view().querySelectorAll('.opt').forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    if(b.dataset.v===q.ans){b.classList.add('right');view().querySelectorAll('.opt').forEach(x=>x.disabled=true);
      if(isStep&&R.si<R.q.steps.length-1){play('tap');R.si++;setTimeout(()=>render(R.q),600);return}
      good()}
    else{b.classList.add('bad');b.disabled=true;wrong()}
  });
}
function renderWords(q){
  const toks=q.tokens,pool=shuffle(toks.map((t,i)=>({t,i})));
  card(q,`<div class="wline" id="wl">${toks.map(()=>'<span class="wslot"></span>').join('')}</div><div class="wtiles">${pool.map((o,j)=>`<button class="wt" data-j="${j}">${esc(o.t)}</button>`).join('')}</div>`);
  let pos=0;const slots=[...view().querySelectorAll('.wslot')];
  view().querySelectorAll('.wt').forEach(b=>b.onclick=()=>{if(b.disabled)return;
    if(b.textContent===toks[pos]){b.disabled=true;b.classList.add('used');slots[pos].textContent=toks[pos];slots[pos].classList.add('on');pos++;play('tap');
      if(pos===toks.length){if(R.tries)R.fail=true;good()}}
    else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),500);R.tries++;play('bad');
      fbMsg(`${pickOne(CAT_BAD)}<br>${pos===0?'Какое слово в вопросе <b>первое</b>? Подумай: is, are, has, have, can — их ставим вперёд.':'Не это слово. Какое должно идти дальше?'}${R.tries>=3?` Подсказка: <b>${esc(toks[pos])}</b>`:''}`,'sad')}});
}
function renderType(q){
  card(q,`<form class="inrow" id="tf" autocomplete="off"><input id="ti" class="inp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="слово" lang="en"><button class="btn" type="submit">Проверить</button></form>`);
  const inp=$('#ti');setTimeout(()=>{try{inp.focus()}catch(e){}},60);
  $('#tf').onsubmit=e=>{e.preventDefault();const v=inp.value.trim().replace(/[’`]/g,"'");if(!v)return;
    if(q.accept.some(a=>a.toLowerCase()===v.toLowerCase())){inp.disabled=true;inp.classList.add('right');good()}else{inp.classList.add('bad');setTimeout(()=>inp.classList.remove('bad'),500);inp.select();wrong()}};
}
function renderTiles(q){
  const w=q.word,letters=w.split('');
  const pool=shuffle(letters.concat(q.extra?shuffle('abcdefghiklmnoprstuwy'.split('').filter(c=>!w.toLowerCase().includes(c))).slice(0,q.extra):[]));
  card(q,`<div class="slots">${letters.map(()=>'<span class="slot"></span>').join('')}</div><div class="tiles">${pool.map((c,i)=>`<button class="tile" data-i="${i}">${c}</button>`).join('')}</div><button class="link" id="sayw">🔊 послушать слово</button>`);
  let pos=0;const slots=[...view().querySelectorAll('.slot')];
  if(canSpeak())$('#sayw').onclick=()=>say(w);else $('#sayw').remove();
  view().querySelectorAll('.tile').forEach(b=>b.onclick=()=>{
    if(b.disabled)return;
    if(b.textContent===letters[pos]){b.disabled=true;b.classList.add('used');slots[pos].textContent=b.textContent;slots[pos].classList.add('on');pos++;play('tap');
      if(pos===letters.length){if(R.tries)R.fail=true;good()}}
    else{b.classList.add('bad');setTimeout(()=>b.classList.remove('bad'),500);R.tries++;play('bad');fbMsg(`${pickOne(CAT_BAD)}<br>Нужна буква номер ${pos+1}.${R.tries>=3?` Подсказка: <b>${letters[pos]}</b>`:''}`,'sad')}
  });
}
function renderSpell(q){
  const w=q.word,chars=w.split('');
  card(q,`<div class="word">${esc(w)}</div><p class="note">Посмотри и запомни. Сейчас слово спрячется — напишешь его сама.</p><button class="btn" id="rdy">Готова! Пишу</button>`);
  setTimeout(()=>say(w),300);
  $('#rdy').onclick=()=>{
    const box=$('#qc');box.querySelector('.word').remove();box.querySelector('.note').remove();$('#rdy').remove();
    box.insertAdjacentHTML('beforeend',`<div class="cells" id="cells">${chars.map((c,j)=>`<input class="cell" data-j="${j}" maxlength="2" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" lang="en" aria-label="буква ${j+1}">`).join('')}</div><div class="inrow"><button class="btn" id="cchk">Проверить</button></div><div id="lookw"></div>`);
    const fb=$('#fb');box.appendChild(fb);
    const cells=[...box.querySelectorAll('.cell')];
    const nf=(k,d)=>{for(let m=k+d;m>=0&&m<cells.length;m+=d)if(!cells[m].disabled)return cells[m];return null};
    cells.forEach((c,k)=>{c.oninput=()=>{c.value=c.value.slice(-1);c.classList.remove('no');if(c.value){const n=nf(k,1);if(n)n.focus()}};
      c.onkeydown=e=>{if(e.key==='Backspace'&&!c.value){const p=nf(k,-1);if(p){p.value='';p.focus();e.preventDefault()}}else if(e.key==='Enter'){e.preventDefault();check()}}});
    setTimeout(()=>{try{cells[0].focus()}catch(e){}},60);
    $('#cchk').onclick=check;
    function check(){
      const em=cells.find(c=>!c.disabled&&!c.value);if(em){em.focus();return}
      let bad=0;cells.forEach(c=>{const j=+c.dataset.j;if(c.value.toLowerCase()===chars[j].toLowerCase()){c.disabled=true;c.classList.add('ok');c.classList.remove('no')}else{bad++;c.classList.add('no')}});
      if(!bad){if(R.tries)R.fail=true;good();return}
      R.tries++;play('bad');fbMsg('Красные буквы — неверные. Исправь только их.','sad');
      const f=cells.find(c=>!c.disabled);if(f){f.focus();f.select&&f.select()}
      if(R.tries>=2&&!$('#lkb')){$('#lookw').innerHTML='<button class="link" id="lkb">👀 Подсмотреть слово</button>';
        $('#lkb').onclick=()=>{const c=$('#cells');if($('#peek'))return;c.hidden=true;c.insertAdjacentHTML('beforebegin',`<div class="word" id="peek">${esc(w)}</div>`);say(w);
          setTimeout(()=>{const p=$('#peek');if(p)p.remove();c.hidden=false;const f2=cells.find(x=>!x.disabled);if(f2)f2.focus()},3000)}}
    }
  };
}
function fbMsg(html,mood){const sad=mood==='sad';$('#fb').innerHTML=`<div class="fb ${sad?'bad':'ok'}">${/Вир|Венд/.test(html)?catFor(html,sad?'wow':'eat',sad?'sly':'happy',56):(Math.random()<.5?vira(sad?'wow':'eat',56):wendy(sad?'sly':'happy',50))}<p>${html}</p></div>`}
function wrong(){
  R.tries++;R.fail=true;play('bad');
  const q=R.q;
  if(R.tries>=2&&q.kind!=='type'){ /* показываем правильный и правило */
    const st=q.kind==='steps'?q.steps[R.si]:q;
    view().querySelectorAll('.opt').forEach(x=>{x.disabled=true;if(x.dataset.v===st.ans)x.classList.add('show')});
    $('#fb').innerHTML=`<div class="fb bad">${vira('sad',56)}<div><p>Правильно: <b>${esc(st.ans)}</b></p><div class="rule">${q.rule||''}</div></div></div><button class="btn" id="nx">Дальше →</button>`;
    say(q.say);R.bad++;$('#nx').onclick=()=>{R.si=0;next()};return}
  if(R.tries>=3&&q.kind==='type'){$('#fb').innerHTML=`<div class="fb bad">${vira('sad',56)}<div><p>Правильно: <b>${esc(q.ans)}</b></p><div class="rule">${q.rule||''}</div></div></div><button class="btn" id="nx">Дальше →</button>`;say(q.say);R.bad++;$('#nx').onclick=next;return}
  const cb=pickOne(CAT_BAD);$('#fb').innerHTML=`<div class="fb bad">${catFor(cb,'wow','sly',56)}<div><p>${cb}</p><div class="rule">${q.hint||q.rule||''}</div></div></div>`;if(q.listen||q.sayFirst)say(q.listen||'');
}
function good(){
  const q=R.q;play('ok');say(q.say);
  const first=!R.fail;
  let lvUp='';
  if(first){const before=levelOf(S.stars);S.stars++;R.ok++;S.done[q.topic]=(S.done[q.topic]||0)+1;save();updStars();tick();
    const n=levelOf(S.stars);if(n>before){lvUp=`<div class="lvup">${vira('eat',64)}<div><b>Уровень ${n}!</b><br>Вира устроила праздник и съела торт 🎂</div></div>`;setTimeout(()=>play('fin'),400)}}
  else R.bad++;
  const nl=levelOf(S.stars),la=lvlAt(nl),lb=lvlAt(nl+1);
  const fb=$('#fb');
  const co=first?pickOne(CAT_OK):'Исправлено! Это ещё повторим 💪';fb.innerHTML=`<div class="fb ok">${first?catFor(co,pickOne(['happy','eat']),'happy',60):wendy('happy',54)}<div><p>${first?co+' +1 ⭐':co}</p>${q.sentFill?`<p class="sent sm">${esc(q.sentFill.replace('___',q.ans))}</p>`:''}</div></div>${lvUp}<p class="lvprog">Уровень ${nl}. До уровня ${nl+1}: ${S.stars-la} из ${lb-la} ⭐, осталось ${lb-S.stars}</p><button class="btn" id="nx">Дальше →</button>`;
  R.si=0;$('#nx').onclick=next;try{$('#nx').focus({preventScroll:true})}catch(e){}
}
function finish(kind){
  if(!R||R.done)return;R.done=true;clearInterval(TICK);
  const total=elapsed();
  S.history=[{d:Date.now(),c:R.ok,g:S.goal,w:R.bad,t:total,k:kind}].concat(S.history||[]).slice(0,30);save();
  $('#strip').hidden=true;document.body.classList.remove('playing');
  if(kind!=='stop')play('fin');
  const extraT=Math.max(0,total-R.lim);
  const head=kind==='stop'?'Занятие остановлено':extraT>1?'Цель выполнена!':'Цель выполнена вовремя!';
  const sub=kind==='stop'?`Сделано ${R.ok} из ${S.goal} правильных за ${mmss(total)}.`:extraT>1?`${R.ok} правильных: ${S.minutes} мин и ещё ${mmss(extraT)} добавочного времени.`:`${R.ok} правильных за ${S.minutes} мин.`;
  const acc=R.ok+R.bad?Math.round(R.ok/(R.ok+R.bad)*100):0;
  view().innerHTML=`<div class="card fin"><p class="kick">Итоги занятия</p><div class="cats">${vira(kind==='stop'?'sleep':'eat',110)}${wendy(kind==='stop'?'sly':'happy',96)}</div>
    <h2>${head}</h2><p class="big2">${sub}</p>
    <div class="sum"><div><b>${R.ok}</b><span>правильных</span></div><div><b>${R.bad}</b><span>${plural(R.bad,'ошибка','ошибки','ошибок')}</span></div><div><b>${acc}%</b><span>точность</span></div><div><b>${mmss(total)}</b><span>время</span></div></div>
    <p class="big2">${kind==='stop'?'Вира решила поваляться… В следующий раз добьём!':acc>=90?'Super! Вира в восторге и требует рыбку!':acc>=70?'Very good! Венди довольна!':'Good try! Вира верит в тебя!'}</p>
    <div class="acts"><button class="btn" id="again">Ещё занятие</button><button class="btn ghost" id="tm">К темам</button></div></div>`;
  $('#again').onclick=start;$('#tm').onclick=()=>{R=null;menu()};
}
document.addEventListener('DOMContentLoaded',()=>{
  const sb=$('#sfx');sb.setAttribute('aria-pressed',S.sfx?'true':'false');sb.onclick=()=>{S.sfx=!S.sfx;save();sb.setAttribute('aria-pressed',S.sfx?'true':'false')};
  $('#home').onclick=()=>menu();menu();
});
