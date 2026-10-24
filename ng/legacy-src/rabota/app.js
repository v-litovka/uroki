const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* ===== Работа над ошибками (русский, 3 класс) ===== */
/* -тся / -ться: [предложение с {} на месте глагола, основа, окончание, вопрос] */
const TSA=[
 ['Вира любит {} на ковре.','кувырка','ться','что делать?'],['Венди не хочет {}.','купа','ться','что делать?'],['Пора {} и завтракать.','умыва','ться','что делать?'],
 ['Надо хорошо {}.','учи','ться','что делать?'],['Котятам нельзя {}.','дра','ться','что делать?'],['Мы будем {} на санках.','ката','ться','что делать?'],
 ['Не надо {} темноты.','боя','ться','что делать?'],['Пора {} в школу.','собира','ться','что делать?'],['Вира решила {} под диваном.','спрята','ться','что сделать?'],
 ['Венди хочет {} на шкаф.','забра','ться','что сделать?'],['Нужно тепло {}.','одева','ться','что делать?'],['Котёнок будет {} за хвостом.','кружи','ться','что делать?'],
 ['Эта книга будет тебе {}.','нрави','ться','что делать?'],['Не стоит {}.','лени','ться','что делать?'],['Пора {}!','просыпа','ться','что делать?'],
 ['Солнце начало {} за лес.','сади','ться','что делать?'],['Вира любит {} на солнышке.','валя','ться','что делать?'],['Надо {} к контрольной.','готови','ться','что делать?'],
 ['Вира {} на ковре.','кувыркае','тся','что делает?'],['Венди {} лапкой.','умывае','тся','что делает?'],['Мальчик {} в третьем классе.','учи','тся','что делает?'],
 ['Мне {} эта песня.','нрави','тся','что делает?'],['Котёнок {} пылесоса.','бои','тся','что делает?'],['Дети {} на горке.','катаю','тся','что делают?'],
 ['Вира {} под диваном.','пряче','тся','что делает?'],['Солнце {} за лес.','сади','тся','что делает?'],['Малыш весело {}.','смеё','тся','что делает?'],
 ['Снег {} над домом.','кружи','тся','что делает?'],['Венди {} с клубком.','дерё','тся','что делает?'],['Ученики {} в школу.','собираю','тся','что делают?'],
 ['Мяч {} по полу.','кати','тся','что делает?'],['Скоро Вира {}.','проснё','тся','что сделает?'],['Брат быстро {}.','одевае','тся','что делает?'],
 ['Венди {} на шкаф.','забирае','тся','что делает?'],['Вира {} на солнышке.','валяе','тся','что делает?'],['Сестра {} к контрольной.','готови','тся','что делает?']
].map(([s,b,e,q],i)=>({id:'t'+i,s,b,e,q,w:b+e}));
const QPAIR={'что делать?':'что делает?','что сделать?':'что сделает?','что делает?':'что делать?','что делают?':'что делать?','что сделает?':'что сделать?'};
const whyTsa=it=>it.e==='ться'?{ok:`В вопросе «${it.q}» есть ь — и в слове есть ь`,no:['ь пишется, если слово длинное']}:{ok:`В вопросе «${it.q}» нет ь — и в слове нет ь`,no:['ь не пишется, если слово короткое']};
TSA.forEach(it=>{it.qs=[it.q,QPAIR[it.q]];it.es=['тся','ться'];it.qh='Задай вопрос к выделенному слову';
  it.h1='Подставь вопрос в предложение — какой звучит правильно?';it.h2=`Есть ли ь в вопросе «${it.q}»? Если есть — пиши ь и в слове.`;it.wy=whyTsa(it)});

/* окончания прилагательных: [предложение, основа, окончание, существительное, род] */
const GQ={m:['какой?','он мой'],f:['какая?','она моя'],n:['какое?','оно моё'],p:['какие?','они мои']};
const ADJ=[['В лесу живёт {} медведь.','бур','ый','медведь','m'],['В зоопарке есть {} зубр.','бел','ый','зубр','m'],['У нас {} собака.','умн','ая','собака','f'],
 ['Это {} яблоко.','вкусн','ое','яблоко','n'],['У дома растёт {} тополь.','стройн','ый','тополь','m'],['На грядке растёт {} морковь.','сладк','ая','морковь','f'],
 ['Это {} медаль.','серебрян','ая','медаль','f'],['Вира — {} кошка.','толст','ая','кошка','f'],['Венди — {} кошка.','худ','ая','кошка','f'],
 ['У Виры {} шерсть.','пушист','ая','шерсть','f'],['Над нами {} небо.','син','ее','небо','n'],['В миске {} молоко.','тёпл','ое','молоко','n'],
 ['У Венди {} хвост.','длинн','ый','хвост','m'],['На поляне {} цветы.','красив','ые','цветы','p'],['В саду цветёт {} сирень.','душист','ая','сирень','f'],
 ['У пруда гуляет {} гусь.','сер','ый','гусь','m'],['Наступила {} ночь.','тёмн','ая','ночь','f'],['По реке плывут {} лебеди.','бел','ые','лебеди','p'],
 ['Светит {} солнце.','ярк','ое','солнце','n'],['С дерева упал {} лист.','жёлт','ый','лист','m'],
 ['За окном {} день.','зимн','ий','день','m'],['Вира любит {} подушки.','мягк','ие','подушки','p'],['Это {} печаль.','больш','ая','печаль','f'],
 ['Пришла {} осень.','золот','ая','осень','f'],['Течёт {} ручей.','быстр','ый','ручей','m'],['В вазе {} варенье.','вишнёв','ое','варенье','n'],['Дует {} ветер.','холодн','ый','ветер','m']
].map(([s,b,e,n,g],i)=>{const [q,pr]=GQ[g];const soft=/^(ий|яя|ее|ие)$/.test(e);
  return {id:'a'+i,s,b,e,w:b+e,q,qs:shuffle(Object.values(GQ).map(x=>x[0]).filter(x=>x!==q)).slice(0,2).concat(q),
   es:soft?['ий','яя','ее','ие']:['ый','ая','ое','ые'],qh:`Задай вопрос от слова «${n}» к выделенному слову`,
   h1:`Подставь: ${n} — ${GQ[g][1]}? Или по-другому?`,h2:`Вопрос «${q}» — какое окончание звучит так же, как в вопросе?`,
   wy:{ok:`${n} — ${pr} → ${q} → -${e}`,no:['Пишу, как слышу','У всех слов окончание -ый']}}});
const RULE_ADJ=`<p>Окончание прилагательного узнаём по <b>вопросу</b> от существительного.</p><p>Сначала проверь слово: <b>он мой</b>, <b>она моя</b>, <b>оно моё</b> или <b>они мои</b>?</p><p>тополь — он мой → <b>какой?</b> → стройн<b>ый</b><br>морковь, медаль — она моя → <b>какая?</b> → сладк<b>ая</b><br>яблоко — оно моё → <b>какое?</b> → вкусн<b>ое</b><br>цветы — они мои → <b>какие?</b> → красив<b>ые</b></p><p>Окончание похоже на конец вопроса: как<b>ая</b> — умн<b>ая</b>.</p>`;

/* окончания существительных: лиса, лисы, лисе, лису, лисой */
const NN=[['лис','лиса'],['белк','белка'],['сорок','сорока'],['ворон','ворона']];
const CASES=[{q:'кто?',e:'а',h:'есть',s:['В лесу живёт {}.','По тропинке бежит {}.','На ветке сидит {}.']},
 {q:'нет кого?',e:'ы',h:'нет',s:['Пушистый хвост у {}.','Заяц убежал от {}.','Около {} лежит шишка.']},
 {q:'к кому?',e:'е',h:'к',s:['Вира подкралась к {}.','Ёжик подошёл к {}.','Дети подбежали к {}.']},
 {q:'вижу кого?',e:'у',h:'вижу',s:['Охотник увидел {}.','Мы встретили {}.','Венди заметила {}.']},
 {q:'кем?',e:'ой',h:'любуюсь',s:['Мы любовались {}.','Сова следила за {}.','Ребята гордились {}.']},
 {q:'о ком?',e:'е',h:'о',s:['Мы читали о {}.','Это сказка о {}.','Вира мечтала о {}.']}];
const NOUN=[];CASES.forEach((c,ci)=>c.s.forEach((s,si)=>NN.forEach(([b,nom])=>{const e=(c.e==='ы'&&/[кгхжшчщ]$/.test(b))?'и':c.e;
  NOUN.push({id:`n${ci}${si}${b}`,s,b,e,w:b+e,q:c.q,qs:shuffle(CASES.map(x=>x.q).filter(x=>x!==c.q)).slice(0,2).concat(c.q),
   es:['а',e==='и'?'и':'ы','е','у','ой'],qh:`Задай вопрос к выделенному слову (${nom})`,
   h1:'Подставь вопрос в предложение — какой подходит?',h2:`Подставь помощника: «${c.h} ${b}…» — как скажешь?`,
   wy:{ok:`«${c.q}» — ${c.h} ${b+e}`,no:['Пишу, как слышу',`Окончание всегда как в слове «${nom}»`]}})})));
const RULE_NOUN=`<p>Окончание существительного меняется от вопроса. Задай вопрос и подставь слово-помощник:</p><p><b>кто?</b> есть лис<b>а</b> · <b>нет кого?</b> нет лис<b>ы</b> · <b>к кому?</b> к лис<b>е</b><br><b>вижу кого?</b> вижу лис<b>у</b> · <b>кем?</b> любуюсь лис<b>ой</b> · <b>о ком?</b> о лис<b>е</b></p><p>После к, г, х, ж, ш, ч, щ пишем <b>и</b>, а не ы: нет белк<b>и</b>, у сорок<b>и</b>.</p>`;

const RULE_TSA=`<p>Задай вопрос к глаголу.</p><p><b>Что делаЕТ?</b> (что сделает? что делают?) — нет ь → пишем <b>-тся</b>: он учи<b>тся</b>.</p><p><b>Что делаТЬ?</b> (что сделать?) — есть ь → пишем <b>-ться</b>: надо учи<b>ться</b>.</p><p>Есть ь в вопросе — есть ь и в слове.</p>`;

/* разделительный ь: [верно, ошибка1, ошибка2] */
const SOFT=[['соловьи','соловии','соловеи'],['воробьи','воробии','воробеи'],['воробьёв','воробёв','воробиёв'],['соловьёв','соловёв','соловиёв'],['птичьи','птичии','птичи'],
 ['муравьи','муравии','муравеи'],['ручьи','ручии','ручеи'],['листья','листя','листия'],['перья','перя','перия'],['деревья','деревя','деревия'],['друзья','друзя','друзия'],
 ['крылья','крылия','крыля'],['платье','платие','плате'],['варенье','варение','варене'],['вьюга','вюга','виюга'],['семья','семя','семия'],['лисьи','лисии','лиси'],
 ['колосья','колося','колосия'],['обезьяна','обезяна','обезияна'],['воробьиный','воробиный','воробииный']].map(([w,a,b],i)=>({id:'s'+i,w,bad:[a,b]}));
const WHY_SOFT={ok:'После согласного перед е, ё, ю, я, и слышу [й] — пишу ь',no:['Между согласным и гласной пишу и']};
const RULE_SOFT=`<p><b>Разделительный ь</b> пишется после согласного перед <b>е, ё, ю, я, и</b>, когда слышим звук <b>[й]</b>.</p><p>солов<b>ь</b>и [салав'й'и], вороб<b>ь</b>ёв, птич<b>ь</b>и, лист<b>ь</b>я.</p><p>Проверь себя: скажи медленно — слышишь [й]? Значит, нужен ь.</p>`;

/* слова из диктанта: места, где ошибаются: [слово с _, верно, неверно, почему] */
const WS={ok:'Словарное слово — его надо запомнить',no:['Проверю ударением']};
const DW=[
 {w:'аккуратно',sp:[['а_уратно','кк','к',WS],['акк_ратно','у','о',WS]]},
 {w:'муравей',sp:[['м_равей','у','о',WS],['мур_вей','а','о',WS]]},
 {w:'покатилось',sp:[['пок_тилось','а','о',{ok:'Проверка: ка́тит — под ударением а',no:['Слышу о — пишу о']}]]},
 {w:'загляделся',sp:[['загл_делся','я','е',{ok:'Проверка: гля́дя, взгля́д — под ударением я',no:['Слышу е — пишу е']}],['загляделс_','я','а',{ok:'Он что сделал? — загляделся: в конце -ся',no:['Пишу, как слышу']}]]},
 {w:'беседа',sp:[['б_седа','е','и',WS],['бес_да','е','и',WS]]},
 {w:'печаль',sp:[['п_чаль','е','и',WS],['печал_','ь','—',{ok:'На конце мягкий л — пишу ь',no:['ь не нужен, л твёрдый']}]]},
 {w:'путешественник',sp:[['пут_шественник','е','и',{ok:'Путь + шествие: путе-шествие',no:['Пишу, как слышу: пути-']}],['путеше_твенник','с','сс',{ok:'Путешествие — одна с',no:['Слово длинное — значит, две с']}],['путешестве_ик','нн','н',{ok:'Суффикс -енн-: путешеств-енн-ик',no:['Как в слове «ученик» — одна н']}]]},
 {w:'соловьи',sp:[['солов_и','ь','—',WHY_SOFT]]},{w:'воробьёв',sp:[['вороб_ёв','ь','—',WHY_SOFT]]},{w:'птичьи',sp:[['птич_и','ь','—',WHY_SOFT]]}
].map((x,i)=>Object.assign(x,{id:'d'+i}));
const RULE_DW=`<p>Это слова, в которых были ошибки в диктанте.</p><p><b>аккуратно</b> — две к; <b>муравей</b>, <b>беседа</b> — словарные; <b>покатилось</b> — проверка ка́тит; <b>загляделся</b> — проверка гля́дя; <b>печаль</b> — ь на конце; <b>путешественник</b> — путе-, одна с, две н.</p>`;

const SM=[{k:'choose',n:'Выбери',i:'👆',d:'Вопрос, потом окончание'},{k:'type',n:'Напечатай окончание',i:'⌨️',d:'Вопрос, потом окончание сама'},
   {k:'word',n:'Напиши слово',i:'✏️',d:'Всё слово с клавиатуры'},{k:'err',n:'Найди ошибку',i:'🔍',d:'Верно ли написано?'}];
const TOPICS=[
 {id:'tsa',name:'-тся и -ться',c:'#7A4FE0',desc:'Учится или учиться? Задай вопрос!',rule:RULE_TSA,items:TSA,modes:[
   {k:'choose',n:'Выбери',i:'👆',d:'Вопрос, потом окончание'},{k:'type',n:'Напечатай окончание',i:'⌨️',d:'Вопрос, потом -тся или -ться сама'},
   {k:'word',n:'Напиши слово',i:'✏️',d:'Всё слово с клавиатуры'},{k:'err',n:'Найди ошибку',i:'🔍',d:'Верно ли написано?'},{k:'dict',n:'Диктант',i:'🎧',d:'Слушай и пиши',voice:1}]},
 {id:'adj',name:'Окончания: какой? какая?',c:'#1C7ED6',desc:'Стройный тополь, сладкая морковь',rule:RULE_ADJ,items:ADJ,modes:SM},
 {id:'noun',name:'Окончания: лиса, лисы, лисе',c:'#2B8A3E',desc:'Задай вопрос — найди окончание',rule:RULE_NOUN,items:NOUN,modes:SM},
 {id:'soft',name:'Разделительный ь',c:'#E2557A',desc:'Соловьи, воробьёв, птичьи',rule:RULE_SOFT,items:SOFT,modes:[
   {k:'gap',n:'Нужен ли ь?',i:'👆',d:'ь, и или ничего'},{k:'pick',n:'Как правильно?',i:'🔍',d:'Выбери верное слово'},{k:'write',n:'Запомни и напиши',i:'✏️',d:'Слово спрячется — напиши его'},{k:'dict',n:'Диктант',i:'🎧',d:'Слушай и пиши',voice:1}]},
 {id:'dw',name:'Слова из диктанта',c:'#D9480F',desc:'аккуратно, муравей, беседа, путешественник…',rule:RULE_DW,items:DW,modes:[
   {k:'letter',n:'Вставь букву',i:'👆',d:'И объясни почему'},{k:'pick',n:'Как правильно?',i:'🔍',d:'Выбери верное слово'},{k:'write',n:'Запомни и напиши',i:'✏️',d:'Слово спрячется — напиши его'},{k:'dict',n:'Диктант',i:'🎧',d:'Слушай и пиши',voice:1}]}
];

const KEY='rabota-oshibki-v1';
const store={get(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch(e){return {}}},set(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}};
const S=Object.assign({stars:0,done:{},sfx:true},store.get());const save=()=>store.set(S);
const lvlAt=n=>5*n*(n+3);const level=st=>{let n=0;while(lvlAt(n+1)<=st)n++;return n};
const $=s=>document.querySelector(s);const view=()=>$('#view');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const norm=s=>String(s).trim().toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ');
let AC=null;function tone(f,t,d,type,v){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||.15,AC.currentTime+t);g.gain.exponentialRampToValueAtTime(.001,AC.currentTime+t+d);o.connect(g).connect(AC.destination);o.start(AC.currentTime+t);o.stop(AC.currentTime+t+d+.05)}catch(e){}}
const SFX={ok(){[784,1047,1319].forEach((f,i)=>tone(f,i*.11,.25))},bad(){tone(220,0,.25,'sawtooth',.12);tone(180,.18,.3,'sawtooth',.1)},tap(){tone(880,0,.06,'triangle',.12)},fin(){[523,659,784,1047].forEach((f,i)=>tone(f,i*.14,.35))}};
const play=n=>{if(S.sfx)try{SFX[n]()}catch(e){}};
let RV=null;function pickV(){try{const vs=speechSynthesis.getVoices();RV=vs.find(v=>/^ru/i.test(v.lang))||null}catch(e){}}
try{speechSynthesis.onvoiceschanged=()=>{pickV();if($('#view')&&CUR==='home')home()};pickV()}catch(e){}
const canSay=()=>{try{return 'speechSynthesis' in window&&!!RV}catch(e){return false}};
function say(t){try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='ru-RU';if(RV)u.voice=RV;u.rate=.8;speechSynthesis.speak(u)}catch(e){}}
const OKS=['Вира от радости покаталась по полу! 🐾','Венди гордо подняла хвост!','Мур-р! Правильно!','Умница! 😺'];
const BADS=['Ой! Вира легла на ответ… Попробуй ещё 🙀','Венди смотрит с подозрением 🤨','Почти! Подумай ещё.'];
let CUR='home';
function sync(){$('#starN').textContent=S.stars;const l=level(S.stars);$('#lvlN').textContent=l?'ур. '+l:'';$('#sfx').setAttribute('aria-pressed',S.sfx?'true':'false')}
function addStar(n){const b=level(S.stars);S.stars+=n||0;save();sync();return level(S.stars)>b}
$('#sfx').onclick=()=>{S.sfx=!S.sfx;save();sync()};
$('#home').onclick=()=>{try{speechSynthesis.cancel()}catch(e){}home()};
function fbx(ok,msg){const c=ok?(Math.random()<.5?vira('happy',52):wendy('happy',46)):(Math.random()<.5?vira('sad',52):wendy('sly',46));return `<div class="fb${ok?'':' bad'}">${c}<p>${msg||(ok?OKS:BADS)[Math.floor(Math.random()*(ok?OKS:BADS).length)]}</p></div>`}

function home(){CUR='home';
  view().innerHTML=`<a class="hub" href="../">← Игры</a>
  <div class="hero"><div class="cats">${vira('happy',74)}${wendy('happy',64)}</div><h1>Работа над ошибками</h1><p>Русский язык: то, в чём были ошибки в диктанте. В каждой теме — от выбора ответа до письма с клавиатуры, и всегда вопрос «почему?».</p></div>
  <div class="topics">${TOPICS.map(t=>{const d=t.modes.filter(m=>S.done[t.id+':'+m.k]).length;return `<button class="topic" data-t="${t.id}" style="--c:${t.c}"><span class="tn">${d} / ${t.modes.length}</span><span class="ten">${t.name}</span><span class="tru">${t.desc}</span></button>`}).join('')}</div>`;
  view().querySelectorAll('button.topic').forEach(x=>x.onclick=()=>{play('tap');topic(TOPICS.find(t=>t.id===x.dataset.t))});sync();window.scrollTo(0,0);
}
function topic(t){CUR='topic';
  const ms=t.modes.filter(m=>!m.voice||canSay());
  view().innerHTML=`<h2 class="ask" style="margin:0 0 10px">${t.name}</h2><div class="rbox">${t.rule}</div>
  <div class="modes" style="margin-top:16px">${ms.map((m,i)=>`<button class="mb${S.done[t.id+':'+m.k]?' ok':''}" data-m="${m.k}"><span class="mi">${m.i}</span><span><b>${i+1}. ${m.n}</b><span>${m.d}</span></span>${S.done[t.id+':'+m.k]?'<span class="ck">✓</span>':''}</button>`).join('')}</div>
  ${t.modes.some(m=>m.voice)&&!canSay()?'<p class="note" style="margin-top:10px">Диктант появится, если на устройстве есть русский голос.</p>':''}`;
  view().querySelectorAll('.mb').forEach(x=>x.onclick=()=>{play('tap');round(t,t.modes.find(m=>m.k===x.dataset.m))});window.scrollTo(0,0);
}

/* раунд: 10 заданий, ошибки повторяются в конце */
function round(t,m){CUR='round';
  const N=10;let q=shuffle(t.items).slice(0,N).map(it=>({it,again:false}));let i=0,first=0,total=q.length;
  const next=()=>{if(i>=q.length)return finish(t,m,first,total);
    const cur=q[i];let missed=false;
    const top=`<div class="rtop"><span class="kick">${m.i} ${m.n} · ${t.name}</span><span>${Math.min(i+1,q.length)} / ${q.length}</span></div><div class="pbar"><i style="width:${i/q.length*100}%"></i></div>`;
    const done=()=>{if(!missed&&!cur.again)first++;if(missed&&!cur.again)q.push({it:cur.it,again:true});i++;setTimeout(next,1300)};
    const miss=()=>{missed=true};
    TASK[t.id][m.k](cur.it,top+(cur.again?'<p class="qhint">🔁 Повторяем ошибку</p>':''),done,miss);
  };next();
}
function finish(t,m,ok,n){CUR='fin';const first=!S.done[t.id+':'+m.k];S.done[t.id+':'+m.k]=1;const up=addStar(ok);play('fin');
  const ms=t.modes.filter(x=>!x.voice||canSay());const nx=ms[ms.indexOf(m)+1];
  view().innerHTML=`<div class="card fin"><div class="cats">${vira('happy',88)}${wendy('happy',78)}</div><h2>Готово!</h2><p class="big2">С первого раза: ${ok} из ${n} · +${ok} ⭐</p>${up?`<div class="lvup">🏆 <b>Новый уровень ${level(S.stars)}!</b></div>`:''}
  <div class="acts">${nx?`<button class="btn" id="nx">${nx.i} ${nx.n} →</button>`:''}<button class="btn ghost" id="ag">Ещё раз</button><button class="btn ghost" id="bk">К теме</button></div></div>`;
  if(nx)$('#nx').onclick=()=>round(t,nx);$('#ag').onclick=()=>round(t,m);$('#bk').onclick=()=>topic(t);
}

/* ---- общие кирпичики ---- */
function card(top,html){view().innerHTML=top+`<div class="card">${html}<div id="fb"></div></div>`;window.scrollTo(0,0)}
function opts(list,ok,onOk,onBad,cls){const box=document.createElement('div');box.className='opts'+(cls?' '+cls:'');
  box.innerHTML=list.map((o,k)=>`<button class="opt" data-k="${k}">${esc(o)}</button>`).join('');
  box.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(b.disabled)return;if(list[+b.dataset.k]===ok){play('ok');b.classList.add('right');box.querySelectorAll('.opt').forEach(x=>x.disabled=true);onOk()}else{play('bad');b.classList.add('bad');b.disabled=true;onBad()}});return box}
function input(ph,check,onOk,onBad){const f=document.createElement('form');f.className='inrow';f.innerHTML=`<input class="inp" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${ph||''}" aria-label="ответ"><button class="btn">Проверить</button>`;
  const a=f.querySelector('input');setTimeout(()=>{try{a.focus({preventScroll:true})}catch(e){}},60);
  f.onsubmit=e=>{e.preventDefault();if(!a.value.trim())return;if(check(a.value)){play('ok');a.classList.add('right');a.disabled=true;f.querySelector('button').disabled=true;onOk(a.value)}else{play('bad');a.classList.add('bad');setTimeout(()=>a.classList.remove('bad'),500);a.select();onBad(a.value)}};return f}
function why(w,then){const fb=$('#fb');const o=shuffle([{t:w.ok,ok:1},...w.no.map(t=>({t,ok:0}))]);
  fb.innerHTML=fbx(true)+`<div class="why"><b>Почему?</b><div class="opts" style="grid-template-columns:1fr">${o.map((x,k)=>`<button class="opt optl" data-k="${k}">${esc(x.t)}</button>`).join('')}</div><p class="msg" id="wm"></p></div>`;
  fb.querySelectorAll('.why .opt').forEach(b=>b.onclick=()=>{if(b.disabled)return;const x=o[+b.dataset.k];if(x.ok){play('ok');b.classList.add('right');fb.querySelectorAll('.why .opt').forEach(y=>y.disabled=true);then()}else{play('bad');b.classList.add('bad');b.disabled=true;$('#wm').textContent='Нет, это не так. Подумай ещё.'}});
  try{fb.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(e){}}
const diffHTML=(a,b)=>{let s='';for(let k=0;k<b.length;k++){s+=a[k]&&norm(a[k])===norm(b[k])?esc(b[k]):`<b>${esc(b[k])}</b>`}return s};
const sentHTML=(it,mid)=>`<p class="sentx">${esc(it.s).replace('{}',mid)}</p>`;
const gapTsa=it=>`<span class="vb">${esc(it.b)}</span><span class="gp">…</span>`;
const fullTsa=it=>`<span class="vb">${esc(it.w)}</span>`;
function qStep(it,top,miss,then){ /* шаг «какой вопрос?» */
  card(top,sentHTML(it,gapTsa(it))+`<p class="qhint">${it.qh}</p>`);
  $('#fb').before(opts(shuffle(it.qs),it.q,()=>{$('#fb').innerHTML=fbx(true,`Вопрос: «${it.q}»`);setTimeout(then,700)},()=>{miss();$('#fb').innerHTML=fbx(false,it.h1)}));
}
const TASK={
 tsa:{
  choose(it,top,done,miss){qStep(it,top,miss,()=>{card(top,sentHTML(it,gapTsa(it))+`<p class="qhint">Вопрос «${it.q}». Какое окончание?</p>`);
    $('#fb').before(opts(it.es,it.e,()=>{$('.sentx').outerHTML=sentHTML(it,fullTsa(it));why(it.wy,done)},()=>{miss();$('#fb').innerHTML=fbx(false,it.h2)},'small'))})},
  type(it,top,done,miss){qStep(it,top,miss,()=>{card(top,sentHTML(it,gapTsa(it))+`<p class="qhint">Вопрос «${it.q}». Напечатай окончание</p>`);
    $('#fb').before(input('окончание',v=>norm(v).replace(/^-/,'')===norm(it.e),()=>{$('.sentx').outerHTML=sentHTML(it,fullTsa(it));why(it.wy,done)},()=>{miss();$('#fb').innerHTML=fbx(false,it.h2)}))})},
  word(it,top,done,miss){let n=0;card(top,sentHTML(it,gapTsa(it))+`<p class="qhint">Напиши выделенное слово целиком</p>`);
    $('#fb').before(input('слово',v=>norm(v)===norm(it.w),()=>{$('.sentx').outerHTML=sentHTML(it,fullTsa(it));why(it.wy,done)},v=>{miss();n++;$('#fb').innerHTML=fbx(false,n===1?it.qh+'.':`Вопрос «${it.q}». ${it.h2}`)}))},
  err(it,top,done,miss){const bad=Math.random()<.5,wr=it.es.filter(x=>x!==it.e),shown=it.b+(bad?wr[Math.floor(Math.random()*wr.length)]:it.e);
    card(top,`<p class="sentx">${esc(it.s).replace('{}',`<span class="vb">${esc(shown)}</span>`)}</p><p class="qhint">Слово написано верно?</p>`);
    $('#fb').before(opts(['Верно','Есть ошибка'],bad?'Есть ошибка':'Верно',()=>{
      if(!bad){$('#fb').innerHTML='';why(it.wy,done);return}
      $('#fb').innerHTML=fbx(true,'Да, тут ошибка! Напиши слово правильно:');$('#fb').append(input('слово',v=>norm(v)===norm(it.w),()=>{$('.sentx').outerHTML=sentHTML(it,fullTsa(it));why(it.wy,done)},()=>{miss();$('#fb').querySelector('p').textContent=`Вопрос «${it.q}». ${it.h2}`}))},
      ()=>{miss();$('#fb').innerHTML=fbx(false,`Задай вопрос: «${it.q}». Подходит окончание?`)},'small'))},
  dict(it,top,done,miss){const text=it.s.replace('{}',it.w);let n=0;
    card(top,`<button class="say" id="sy" aria-label="Послушать ещё раз">🔊</button><p class="qhint">Послушай предложение. Напиши глагол на -тся или -ться.</p>`);
    $('#sy').onclick=()=>say(text);setTimeout(()=>say(text),300);
    $('#fb').before(input('слово',v=>norm(v)===norm(it.w),()=>{$('.qhint').outerHTML=sentHTML(it,fullTsa(it));why(it.wy,done)},()=>{miss();n++;$('#fb').innerHTML=fbx(false,n===1?'Задай вопрос к этому слову: есть ли в вопросе ь?':`Это слово «${esc(it.b)}…», вопрос «${it.q}».`)}))}
 },
 soft:{
  gap(it,top,done,miss){const k=it.w.indexOf('ь');const g=it.w.slice(0,k)+'<span class="gp" style="color:var(--trap)">_</span>'+it.w.slice(k+1);
    card(top,`<p class="big">${g}</p><p class="qhint">Что пропущено?</p>`);
    $('#fb').before(opts(shuffle(['ь','и','ничего']),'ь',()=>{$('.big').textContent=it.w;why(WHY_SOFT,done)},()=>{miss();$('#fb').innerHTML=fbx(false,'Скажи слово медленно. Слышишь [й] перед гласной?')},'small'))},
  pick(it,top,done,miss){card(top,`<p class="qhint">Как написать правильно?</p>`);
    $('#fb').before(opts(shuffle([it.w,...it.bad]),it.w,()=>why(WHY_SOFT,done),()=>{miss();$('#fb').innerHTML=fbx(false,'Где слышится [й] — там нужен ь.')}))},
  write(it,top,done,miss){lookWrite(it.w,top,done,miss,WHY_SOFT)},
  dict(it,top,done,miss){sayWrite(it.w,top,done,miss,WHY_SOFT)}
 },
 dw:{
  letter(it,top,done,miss){const sp=it.sp[Math.floor(Math.random()*it.sp.length)];const [g,ok,bad,w]=sp;
    card(top,`<p class="big">${esc(g).replace('_','<span style="color:var(--trap)">_</span>')}</p><p class="qhint">Какая буква пропущена?</p>`);
    $('#fb').before(opts(shuffle([ok,bad]),ok,()=>{$('.big').textContent=it.w;why(w,done)},()=>{miss();$('#fb').innerHTML=fbx(false,w===WS?'Это словарное слово. Вспомни, как оно выглядит.':'Подумай, как проверить.')},'small'))},
  pick(it,top,done,miss){const wr=shuffle(it.sp.map(([g,ok,bad])=>g.replace('_',bad==='—'?'':bad))).slice(0,2);
    if(wr.length<2)wr.push(it.w.length>6?it.w.slice(0,-1):it.w+'ь');
    card(top,`<p class="qhint">Как написать правильно?</p>`);
    $('#fb').before(opts(shuffle([it.w,...wr]),it.w,()=>why(it.sp[0][3],done),()=>{miss();$('#fb').innerHTML=fbx(false,'Посмотри внимательно на каждую букву.')}))},
  write(it,top,done,miss){lookWrite(it.w,top,done,miss,it.sp[0][3])},
  dict(it,top,done,miss){sayWrite(it.w,top,done,miss,it.sp[0][3])}
 }
};
function lookWrite(w,top,done,miss,wy){
  card(top,`<p class="big" id="lw">${esc(w)}</p><p class="qhint">Посмотри на слово и запомни. Потом оно спрячется.</p><button class="btn" id="hd">Запомнила — спрятать</button>`);
  $('#hd').onclick=()=>{$('#lw').textContent='• • •';$('#hd').remove();$('.qhint').textContent='Напиши слово по памяти';let n=0;
    $('#fb').before(input('слово',v=>norm(v)===norm(w),()=>{$('#lw').textContent=w;why(wy,done)},v=>{miss();n++;$('#fb').innerHTML=fbx(false,'Красные буквы — с ошибкой:')+`<p class="diff">${diffHTML(norm(v),w)}</p>`}))};
}
function sayWrite(w,top,done,miss,wy){
  card(top,`<button class="say" id="sy" aria-label="Послушать ещё раз">🔊</button><p class="qhint">Послушай слово и напиши его</p>`);
  $('#sy').onclick=()=>say(w);setTimeout(()=>say(w),300);let n=0;
  $('#fb').before(input('слово',v=>norm(v)===norm(w),()=>{$('.qhint').outerHTML=`<p class="big">${esc(w)}</p>`;why(wy,done)},v=>{miss();n++;$('#fb').innerHTML=fbx(false,n===1?'Послушай ещё раз и проверь каждую букву.':'Правильно так:')+(n>1?`<p class="diff">${diffHTML(norm(v),w)}</p>`:'')}))
}
TASK.adj=TASK.tsa;TASK.noun=TASK.tsa;
window.__TEST__={TOPICS,TSA,SOFT,DW,ADJ,NOUN};
sync();home();
