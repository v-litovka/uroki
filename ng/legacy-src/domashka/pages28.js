/* ===== Тетрадь, стр. 28 — Урок 26. Порядок действий в выражениях без скобок ===== */
const RULE_NOBR=`<p>В выражениях <b>без скобок</b> сначала выполняют <b>умножение или деление</b> (по порядку слева направо),</p>
<p>а потом <b>сложение или вычитание</b> (слева направо).</p>
<p class="smp"><span class="ex">16 − 2 · 5</span>: ① умножение, ② вычитание</p>
<p class="smp"><span class="ex">8 · 2 + 9 · 4</span>: ① первое умножение, ② второе умножение, ③ сложение</p>`;
const RULE_UNITS=RULE_NOBR+`<p><b>Единицы:</b> 1 дм = 10 см, 1 м = 10 дм = 100 см, 1 ч = 60 мин.</p>
<p>Чтобы вычесть из дециметров сантиметры, сначала переведи всё в сантиметры.</p>`;
const RULE_DIFF=`<p><b>Уменьшаемое − вычитаемое = разность.</b></p><p>Сначала найди значения выражений в клетках, потом вычитай.</p>`;
const RULE_TREE2=RULE_TREE+`<p>«<b>По 9</b>» в каждом букете — значит, одинаковые числа берём несколько раз: это <b>умножение</b>.</p>`;
const RULE_TIMES=`<p><b>«В 2 раза меньше»</b> — читай задачу внимательно: <i>ширина</i> в 2 раза меньше <i>длины</i>. Значит, длина в 2 раза <b>больше</b> ширины!</p>
<p>На схеме длина — это 2 таких же отрезка, как ширина.</p>`+RULE_PER;

/* пример с именованными числами: что первым, вычислить, перевести, ответить */
function unitItem(o){
  const L=(t)=>`<div class="bl">${t}</div>`;
  const head=L(o.expr+' = <b class="qq">?</b>');
  const l1='① '+o.a1+' = '+o.r1+' '+o.u1,l2='② '+o.a2+' = '+o.r2+' '+o.u2;
  const sFirst={k:'pick',q:'Какое действие выполняем первым?',opts:o.firsts,ok:o.firstOk,hints:['Скобок нет. Что делаем сначала — сложение и вычитание или умножение и деление?','Найди знак «·» или «:» — это действие первое.']};
  const s1={k:'num',q:'① '+o.a1+' = <b class="qq">?</b> '+o.u1,ok:o.r1,hints:calcHints(...o.c1),act:{a:o.c1[0],o:o.c1[1],b:o.c1[2]}};
  const sc={k:'num',q:o.convQ,ok:o.conv,hints:o.convH};
  const s2={k:'num',q:'② '+o.a2+' = <b class="qq">?</b> '+o.u2,ok:o.r2,hints:calcHints(...o.c2),act:{a:o.c2[0],o:o.c2[1],b:o.c2[2]}};
  const sf={k:'nums',q:`Запиши ответ: ${o.r2} ${o.u2} = ? ${o.f[0].u} ? ${o.f[1].u}`,fields:o.f,hints:o.fH};
  const seq=o.convAfter?[[sFirst,'① '+o.a1+' = <b class="qq">?</b>'],[s1,l1],[s2,l2],[sc,o.convDone],[sf,null]]:[[sFirst,'① '+o.a1+' = <b class="qq">?</b>'],[s1,l1],[sc,o.convDone],[s2,l2],[sf,null]];
  const lines=[];const steps=[];
  seq.forEach(([st,line])=>{if(line){if(lines.length&&/qq/.test(lines[lines.length-1]))lines.pop();lines.push(line)}
    st.board=head+lines.map(L).join('')+(st===sf?L(o.expr+' = '+o.f[0].ok+' '+o.f[0].u+' '+o.f[1].ok+' '+o.f[1].u):'');steps.push(st)});
  const pen=t=>`<div class="pen">${t}</div>`;
  return {start:head,steps,record:o.expr+' = '+o.f[0].ok+' '+o.f[0].u+' '+o.f[1].ok+' '+o.f[1].u+pen(l1)+(o.convAfter?pen(l2)+pen(o.convDone):pen(o.convDone)+pen(l2))};
}
/* столбик таблицы «уменьшаемое − вычитаемое» */
function diffItem(m,s){
  const val=x=>typeof x==='number'?x:orderOf(x).pop().r;
  const mv=val(m),sv=val(s);const sH=x=>typeof x==='number'?String(x):exprHTML(x);
  const tbl=(a,b,c)=>`<table class="tblc"><tr><th>Уменьшаемое</th><td>${typeof m==='number'?m:exprHTML(m)}${a!=null&&typeof m!=='number'?' = '+a:''}</td></tr><tr><th>Вычитаемое</th><td>${sH(s)}${b!=null&&typeof s!=='number'?' = '+b:''}</td></tr><tr><th>Разность</th><td>${c!=null?c:'<b class="qq">?</b>'}</td></tr></table>`;
  const steps=[];
  if(typeof m!=='number'){const a=orderOf(m)[0];steps.push(Object.assign(calcStep(a.a,a.o,a.b,'Уменьшаемое:'),{board:`<div class="bl">${tbl(mv)}</div>`}))}
  if(typeof s!=='number'){const b=orderOf(s)[0];steps.push(Object.assign(calcStep(b.a,b.o,b.b,'Вычитаемое:'),{board:`<div class="bl">${tbl(mv,sv)}</div>`}))}
  steps.push(Object.assign(calcStep(mv,'−',sv,'Разность:'),{hints:['Разность = уменьшаемое − вычитаемое.'].concat(calcHints(mv,'−',sv)),board:`<div class="bl">${tbl(mv,sv,mv-sv)}</div>`}));
  return {start:`<div class="bl">${tbl()}</div>`,steps,record:'',col:[typeof m==='number'?String(m):exprHTML(m)+`<div class="pen">= ${mv}</div>`,(typeof s==='number'?String(s):exprHTML(s)+`<div class="pen">= ${sv}</div>`),String(mv-sv)+`<div class="pen">${mv} − ${sv}</div>`]};
}

const T4_OK={op:'+',l:{op:'·',l:'5',r:'9'},r:{op:'·',l:'4',r:'7'}};
const T4_B1={op:'+',l:{op:'+',l:'5',r:'9'},r:{op:'+',l:'4',r:'7'}};
const T4_B2={op:'−',l:{op:'·',l:'5',r:'9'},r:{op:'·',l:'4',r:'7'}};
const T4_B3={op:'·',l:{op:'+',l:'5',r:'4'},r:{op:'+',l:'9',r:'7'}};
const t4=(a,b,c)=>drawTree({op:'+',l:{op:'·',l:'5',r:'9',v:a},r:{op:'·',l:'4',r:'7',v:b},v:c});

const S5_OK=SCH.times('Ш.','Д.',4,2,'4 см','?');
const S5_B1=SCH.part('Ш.','Д.',4,2,'4 см','?');
const S5_B2=SCH.more('Ш.','Д.',4,2,'4 см','2 см','?');

PAGES.wb[28]={lesson:'Урок 26. Порядок действий в выражениях без скобок',rule:RULE_NOBR,ex:[
 {n:1,title:'Определи порядок действий',text:'Определи порядок выполнения действий.<div class="smp">Считать не надо — только поставь номера действий.</div>',rule:RULE_NOBR,items:[
   orderItem('72 − 4 · 9'),orderItem('56 : 8 + 9 · 6'),orderItem('42 : 6 + 29'),orderItem('80 + 49 : 7 − 24')]},
 {n:2,title:'Порядок действий и значения выражений',text:'Определи порядок выполнения действий и найди значения выражений.',rule:RULE_UNITS,items:[
   valueItem('82 − 72 : 8',{}),valueItem('4 · 2 · 8',{}),valueItem('100 − 81 : 9',{}),valueItem('56 : 7 · 9',{}),
   unitItem({expr:'9 дм − 63 см : 9',firsts:['9 дм − 63 см','63 см : 9'],firstOk:1,a1:'63 см : 9',u1:'см',r1:7,c1:[63,':',9],
     convQ:'Чтобы вычесть, переведи: 9 дм = <b class="qq">?</b> см',conv:90,convH:['В 1 дм — 10 см. А в 9 дм?','9 раз по 10 см.'],convDone:'9 дм = 90 см',
     a2:'90 см − 7 см',u2:'см',r2:83,c2:[90,'−',7],f:[{ok:8,u:'дм'},{ok:3,u:'см'}],fH:['В 1 дм — 10 см. Сколько полных десятков сантиметров в 83 см?','Десятки — это дециметры, единицы — сантиметры.']}),
   unitItem({expr:'7 мин · 5 + 47 мин',firsts:['7 мин · 5','5 + 47 мин'],firstOk:0,a1:'7 мин · 5',u1:'мин',r1:35,c1:[7,'·',5],
     convAfter:1,convQ:'Сколько минут в 1 часе?',conv:60,convH:['Вспомни часы: большая стрелка проходит весь круг за 1 час.','1 ч = ? мин — вспомни таблицу единиц времени.'],convDone:'1 ч = 60 мин',
     a2:'35 мин + 47 мин',u2:'мин',r2:82,c2:[35,'+',47],f:[{ok:1,u:'ч'},{ok:22,u:'мин'}],fH:['В 1 часе 60 минут. Сколько минут останется, если 60 минут отдать в часы?','Из 82 мин отними 60 мин — это 1 час. Сколько минут осталось?']}),
   unitItem({expr:'1 м − 8 см · 6',firsts:['1 м − 8 см','8 см · 6'],firstOk:1,a1:'8 см · 6',u1:'см',r1:48,c1:[8,'·',6],
     convQ:'Чтобы вычесть, переведи: 1 м = <b class="qq">?</b> см',conv:100,convH:['1 м = 10 дм, а в каждом дециметре 10 см.','10 раз по 10 см.'],convDone:'1 м = 100 см',
     a2:'100 см − 48 см',u2:'см',r2:52,c2:[100,'−',48],f:[{ok:5,u:'дм'},{ok:2,u:'см'}],fH:['В 1 дм — 10 см. Сколько полных десятков сантиметров в 52 см?','Десятки — это дециметры, единицы — сантиметры.']}),
   unitItem({expr:'5 дм 9 см − 4 см · 8',firsts:['5 дм 9 см − 4 см','4 см · 8'],firstOk:1,a1:'4 см · 8',u1:'см',r1:32,c1:[4,'·',8],
     convQ:'Чтобы вычесть, переведи: 5 дм 9 см = <b class="qq">?</b> см',conv:59,convH:['5 дм — это сколько сантиметров? И прибавь ещё 9 см.','5 дм = 50 см. А вместе с 9 см?'],convDone:'5 дм 9 см = 59 см',
     a2:'59 см − 32 см',u2:'см',r2:27,c2:[59,'−',32],f:[{ok:2,u:'дм'},{ok:7,u:'см'}],fH:['В 1 дм — 10 см. Сколько полных десятков сантиметров в 27 см?','Десятки — это дециметры, единицы — сантиметры.']})]},
 {n:3,title:'Вычисли: уменьшаемое и вычитаемое',text:'Вычисли. Заполни строку «Разность».',rule:RULE_DIFF,items:[
   diffItem('9 · 8','56 : 7'),diffItem('6 · 8','5 · 5'),diffItem('9 · 9','42 : 7'),diffItem(73,'7 · 7'),diffItem('7 · 9','5 · 6'),diffItem('9 · 6','4 · 8')]},
 {n:4,title:'Задача про букеты',text:'У продавца было 5 букетов по 9 роз и 4 букета по 7 гладиолусов. Сколько всего цветов было у продавца?',rule:RULE_TREE2,items:[
   {start:'',steps:[
    {k:'pick',q:'Что можно узнать <b>сразу</b>, первым действием?',opts:['Сколько всего цветов','Сколько роз','Сколько букетов с розами'],ok:1,
      hints:['Про розы сказано: 5 букетов по 9 роз. Можно по этим числам что-то найти?','Чтобы узнать, сколько всего цветов, надо знать, сколько роз и сколько гладиолусов. Сначала найди одно из них.']},
    {k:'pick',q:'Выбери схему к задаче.',opts:[drawTree(T4_B1),drawTree(T4_B3),drawTree(T4_OK),drawTree(T4_B2)],ok:2,svg:1,
      hints:['«5 букетов по 9 роз» — это 9 взять 5 раз. Какой знак соединяет 5 и 9?','Розы — 5 и 9 со знаком «·», гладиолусы — 4 и 7 тоже со знаком «·». А потом розы и гладиолусы вместе — какой знак?'],
      board:`<div class="bl">${t4()}</div>`},
    {k:'pick',q:'Сколько роз? Как узнать?',opts:['5 + 9','5 · 9','9 − 5'],ok:1,hints:['5 букетов, в каждом по 9 роз. «По 9 взять 5 раз» — какое действие?','Одинаковые числа складываем много раз — это умножение.'],
      board:`<div class="bl">${t4()}</div><div class="bl">1) <span class="ex">5 · 9 = <b class="qq">?</b></span> (р.)</div>`},
    Object.assign(calcStep(5,'·',9),{board:`<div class="bl">${t4(45)}</div><div class="bl">1) <span class="ex">5 · 9 = 45</span> (р.) — розы</div>`}),
    {k:'pick',q:'Сколько гладиолусов? Как узнать?',opts:['4 · 7','4 + 7','7 − 4'],ok:0,hints:['4 букета по 7 гладиолусов. Какое действие?','Это как с розами: по 7 взять 4 раза.'],
      board:`<div class="bl">${t4(45)}</div><div class="bl">1) <span class="ex">5 · 9 = 45</span> (р.) — розы</div><div class="bl">2) <span class="ex">4 · 7 = <b class="qq">?</b></span> (гл.)</div>`},
    Object.assign(calcStep(4,'·',7),{board:`<div class="bl">${t4(45,28)}</div><div class="bl">1) <span class="ex">5 · 9 = 45</span> (р.) — розы</div><div class="bl">2) <span class="ex">4 · 7 = 28</span> (гл.) — гладиолусы</div>`}),
    {k:'pick',q:'Как узнать, сколько всего цветов?',opts:['45 − 28','45 + 28','45 · 28'],ok:1,hints:['Цветы — это розы и гладиолусы вместе. «Всего» — какое действие?','Соедини розы и гладиолусы вместе.'],
      board:`<div class="bl">${t4(45,28)}</div><div class="bl">1) <span class="ex">5 · 9 = 45</span> (р.)</div><div class="bl">2) <span class="ex">4 · 7 = 28</span> (гл.)</div><div class="bl">3) <span class="ex">45 + 28 = <b class="qq">?</b></span> (цв.)</div>`},
    Object.assign(calcStep(45,'+',28),{board:`<div class="bl">${t4(45,28,73)}</div><div class="bl">1) <span class="ex">5 · 9 = 45</span> (р.)</div><div class="bl">2) <span class="ex">4 · 7 = 28</span> (гл.)</div><div class="bl">3) <span class="ex">45 + 28 = 73</span> (цв.)</div><div class="bl">Ответ: 73 цветка.</div>`})
   ]}]},
 {n:5,title:'Периметр прямоугольника',text:'Ширина прямоугольника 4 см, что в 2 раза меньше его длины. Чему равен периметр прямоугольника?',rule:RULE_TIMES,items:[
   {start:'',steps:[
    {k:'pick',q:'Что длиннее у этого прямоугольника?',opts:['Длина','Ширина'],ok:0,hints:['Прочитай ещё раз: «ширина … в 2 раза <b>меньше</b> длины». Кто меньше — ширина или длина?','Если ширина меньше, то длина…']},
    {k:'pick',q:'Выбери схему к задаче.',opts:[drawScheme(S5_B2),drawScheme(S5_OK),drawScheme(S5_B1)],ok:1,svg:1,
      hints:['Длина <b>больше</b> ширины. На какой схеме нижний отрезок (Д.) длиннее верхнего (Ш.)?','«В 2 раза больше» — это 2 одинаковых отрезка, как ширина. А «на 2 больше» — ширина и ещё кусочек 2 см. Что у нас в задаче?'],
      board:`<div class="bl">${drawScheme(S5_OK)}</div>`},
    {k:'pick',q:'Как найти длину?',opts:['4 : 2','4 + 2','4 · 2'],ok:2,hints:['Длина — это 2 таких отрезка, как ширина. Какое действие?','По 4 см взять 2 раза.'],
      board:`<div class="bl">${drawScheme(S5_OK)}</div><div class="bl">1) <span class="ex">4 · 2 = <b class="qq">?</b></span> (см) — длина</div>`},
    Object.assign(calcStep(4,'·',2),{board:`<div class="bl">${drawScheme(S5_OK)}</div><div class="bl">1) <span class="ex">4 · 2 = 8</span> (см) — длина</div>`}),
    {k:'pick',q:'Как найти периметр прямоугольника?',opts:['8 · 4','8 + 4','(8 + 4) · 2'],ok:2,hints:['У прямоугольника 4 стороны: 2 длины и 2 ширины.','Длина и ширина вместе — половина периметра. Сколько таких половинок?'],
      board:`<div class="bl">1) <span class="ex">4 · 2 = 8</span> (см) — длина</div><div class="bl">2) <span class="ex">(8 + 4) · 2 = <b class="qq">?</b></span> (см) — периметр</div>`},
    Object.assign(calcStep(8,'+',4,'Сначала в скобках:'),{}),
    Object.assign(calcStep(12,'·',2,'Теперь'),{board:`<div class="bl">1) <span class="ex">4 · 2 = 8</span> (см) — длина</div><div class="bl">2) <span class="ex">(8 + 4) · 2 = 24</span> (см) — периметр</div><div class="bl">Ответ: периметр прямоугольника 24 см.</div>`})
   ]}]}
]};
