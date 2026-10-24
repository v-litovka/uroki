/* ===== Домашка: строители для страниц 38–57 ===== */
const FR=(a,b)=>`<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const QQ='<b class="qq">?</b>';
const RULE_EQ=`<p><b>Уравнение</b> — равенство с неизвестным числом (буквой).</p>
<p>Неизвестное <b>слагаемое</b> = сумма − известное слагаемое.</p><p>Неизвестное <b>уменьшаемое</b> = разность + вычитаемое.</p><p>Неизвестное <b>вычитаемое</b> = уменьшаемое − разность.</p>
<p>Неизвестный <b>множитель</b> = произведение : известный множитель.</p><p>Неизвестное <b>делимое</b> = частное · делитель.</p><p>Неизвестный <b>делитель</b> = делимое : частное.</p><p>Проверка: подставь найденное число в уравнение.</p>`;
const RULE_DIST=`<p><b>Сумму умножить на число</b> — можно умножить каждое слагаемое и сложить:</p><p class="smp">(4 + 5) · 10 = 4 · 10 + 5 · 10</p><p>И наоборот: 4 · 10 + 5 · 10 = (4 + 5) · 10.</p>`;
const RULE_DDIST=`<p><b>Сумму разделить на число</b> — можно разделить каждое слагаемое и сложить:</p><p class="smp">(12 + 8) : 2 = 12 : 2 + 8 : 2</p>`;
const RULE_MUL2=`<p><b>Двузначное · однозначное:</b> разбей на десятки и единицы, умножь каждое и сложи.</p><p class="smp">14 · 7 = (10 + 4) · 7 = 70 + 28 = 98</p>`;
const RULE_DIV2=`<p><b>Двузначное : однозначное:</b> разбей на удобные слагаемые, которые делятся на это число.</p><p class="smp">84 : 6 = (60 + 24) : 6 = 10 + 4 = 14</p>`;
const RULE_DIV22=`<p><b>Двузначное : двузначное:</b> подбирай частное. Смотри на последние цифры.</p><p class="smp">84 : 14 = 6, потому что 14 · 6 = 84</p>`;
const RULE_REM=`<p><b>Деление с остатком:</b> найди самое большое число, которое делится без остатка, и посмотри, сколько осталось.</p><p><b>Остаток всегда меньше делителя.</b></p><p class="smp">37 : 5 = 7 (ост. 2), проверка: 5 · 7 + 2 = 37</p>`;
const RULE_TIME=`<p><b>Короткая стрелка</b> — часы, <b>длинная</b> — минуты.</p><p>1 ч = 60 мин. Один полный оборот минутной стрелки — 1 час.</p><p>Днём часы считают после 12: 1 ч дня — это 13 ч.</p>`;
const RULE_FRAC=`<p><b>Доля</b> — одна из равных частей целого.</p><p>${FR(1,4)} — целое разделили на 4 равные части и взяли одну.</p><p>Чем на большее число частей делим, тем <b>меньше</b> каждая часть.</p><p>Найти долю числа: ${FR(1,6)} от 90 → 90 : 6. Число по его доле: ${FR(1,5)} — это 2 → 2 · 5.</p>`;
const RULE_AREA=`<p><b>Площадь</b> — сколько квадратов помещается в фигуре.</p><p>1 см² — квадрат со стороной 1 см.</p><p>Площадь прямоугольника = длина · ширина (в одном ряду квадратов · количество рядов).</p>`;
const RULE_P=`<p><b>Периметр прямоугольника</b> = (длина + ширина) · 2.</p><p><b>Периметр квадрата</b> = сторона · 4.</p><p>Половина периметра = длина + ширина.</p>`;
const PEN2=t=>`<div class="pen">${t}</div>`;
const WHY_X=n=>({ok:`«В ${n} раз» — это про умножение и деление`,no:[`«В ${n} раз» — это про сложение`]});

/* подчеркни: несколько верных */
function multiItem(q,opts,ok,hints,msgs,sep){
  return {start:'',steps:[{k:'multi',raw:1,q,opts,ok,hints,msgs}],record:opts.map((o,i)=>ok.includes(i)?`<u>${o}</u>`:`<span class="no">${o}</span>`).join(sep||' &nbsp; ')};
}
/* 14 · 7 через десятки и единицы */
function mulItem(a,b){
  const d=a-a%10,e=a%10,p1=d*b,p2=e*b,r=a*b;
  const S=[];const L=x=>BL(x);
  const l0=`${a} · ${b} = `;
  S.push({k:'nums',pre:`${a} =`,q:`Разбей ${a} на десятки и единицы.`,fields:[{ok:d,u:'+'},{ok:e,u:''}],hints:['Сколько в числе десятков? Это круглое число.','Вторая часть — единицы, последняя цифра.'],board:L(l0+`(${d} + ${e}) · ${b}`)});
  S.push(Object.assign(calcStep(d,'·',b),{board:L(l0+`(${d} + ${e}) · ${b} = ${p1} + …`)}));
  S.push(Object.assign(calcStep(e,'·',b),{board:L(l0+`(${d} + ${e}) · ${b} = ${p1} + ${p2}`)}));
  S.push(Object.assign(calcStep(p1,'+',p2),{board:L(l0+`(${d} + ${e}) · ${b} = ${p1} + ${p2} = <b>${r}</b>`)}));
  return {start:L(l0+QQ),steps:S,record:`${a} · ${b} = (${d} + ${e}) · ${b} = ${p1} + ${p2} = <b>${r}</b>`};
}
/* 84 : 6 через удобные слагаемые */
function divItem(a,b,check){
  const t=10*b*Math.floor(a/(10*b)),u=a-t,q1=t/b,q2=u/b,r=a/b;const L=x=>BL(x);const l0=`${a} : ${b} = `;
  const S=[{k:'num',q:`Разбей ${a} на удобные слагаемые. Первое — круглое число, которое делится на ${b}. Какое самое большое?`,ok:t,hints:[`Круглые числа, которые делятся на ${b}: ${b*10}, ${b*20}… Какое из них не больше ${a}?`,`Проверь: ${a} минус это число — тоже должно делиться на ${b}.`],board:L(l0+`(${t} + …) : ${b}`)},
    {k:'num',q:`${a} − ${t} = ${QQ} — второе слагаемое`,ok:u,hints:calcHints(a,'−',t),board:L(l0+`(${t} + ${u}) : ${b}`)}];
  S.push(Object.assign(calcStep(t,':',b),{board:L(l0+`(${t} + ${u}) : ${b} = ${q1} + …`)}));
  S.push(Object.assign(calcStep(u,':',b),{board:L(l0+`(${t} + ${u}) : ${b} = ${q1} + ${q2}`)}));
  S.push(Object.assign(calcStep(q1,'+',q2),{board:L(l0+`(${t} + ${u}) : ${b} = ${q1} + ${q2} = <b>${r}</b>`)}));
  const rec=`${a} : ${b} = (${t} + ${u}) : ${b} = ${q1} + ${q2} = <b>${r}</b>`;
  if(check){S.push(Object.assign(calcStep(r,'·',b,'Проверка:'),{board:L(rec)+L(`Проверка: ${r} · ${b} = ${a}`)}));return {start:L(l0+QQ),steps:S,record:rec+PEN2(`Проверка: ${r} · ${b} = ${a}`)}}
  return {start:L(l0+QQ),steps:S,record:rec};
}
/* двузначное : двузначное подбором */
function div2Item(a,b){
  const r=a/b;
  return {start:BL(`${a} : ${b} = ${QQ}`),steps:[{k:'num',q:`${a} : ${b} = ${QQ}`,ok:r,hints:[`Подбери: на какое число надо умножить ${b}, чтобы получилось ${a}?`,`Посмотри на последние цифры: ${b%10} · ? должно оканчиваться на ${a%10}.`],act:{a,o:':',b},board:BL(`${a} : ${b} = <b>${r}</b>`)},
    Object.assign(calcStep(b,'·',r,'Проверь умножением:'),{board:BL(`${a} : ${b} = <b>${r}</b>`)+BL(`Проверка: ${b} · ${r} = ${a} ✓`)})],record:`${a} : ${b} = <b>${r}</b>`+PEN2(`${b} · ${r} = ${a}`)};
}
/* деление с остатком */
function remItem(a,b,check){
  const q=Math.floor(a/b),r=a%b;const res=`${a} : ${b} = <b>${q}</b> (ост. <b>${r}</b>)`;
  const S=[{k:'nums',pre:`${a} : ${b} =`,q:'Раздели с остатком: частное и остаток.',fields:[{ok:q,u:'(ост.'},{ok:r,u:')'}],
    hints:[`Найди самое большое число, не больше ${a}, которое делится на ${b} без остатка.`,`Остаток должен быть меньше ${b}. Сколько не хватило до ${a}?`],board:BL(res)}];
  if(check)S.push({k:'num',q:`Проверка: ${b} · ${q} + ${r} = ${QQ}`,ok:a,hints:[`Сначала ${b} · ${q}, потом прибавь остаток.`,'Должно получиться делимое.'],board:BL(res)+BL(`Проверка: ${b} · ${q} + ${r} = ${a} ✓`)});
  return {start:BL(`${a} : ${b} = ${QQ} (ост. ${QQ})`),steps:S,record:res+(check?PEN2(`${b} · ${q} + ${r} = ${a}`):'')};
}
/* по образцу: a·m + b·m = (a + b)·m ; a:m + b:m = (a + b):m */
function sampleItem(expr){
  const t=expr.split(' ');let a,b,m,o=t[1],first=false;
  if(t[0]===t[4]){first=true;m=+t[0];a=+t[2];b=+t[6]}else{m=+t[2];a=+t[0];b=+t[4]}
  const ok=first?`${m} · (${a} + ${b})`:`(${a} + ${b}) ${o} ${m}`;
  const w1=first?`${m} · ${a} + ${b}`:`${a} + ${b} ${o} ${m}`,w2=first?`(${m} + ${a}) · ${b}`:`(${a} ${o} ${b}) + ${m}`;
  const opts=shuffle([ok,w1,w2]);const s=a+b,r=apply(s,o,m);
  const L=x=>BL(x);
  const S=[{k:'pick',q:'Какое число повторяется в обоих слагаемых?',opts:shuffle([String(m),String(a),String(b)]).filter((x,i,A)=>A.indexOf(x)===i),okv:String(m),hints:['Посмотри на оба слагаемых: какое число есть и там, и там?',`Знак «${o}» с этим числом есть в обеих частях.`],board:L(`${exprHTML(expr)} = …`)},
    {k:'pick',q:'Как записать по образцу?',opts,okv:ok,hints:['Посмотри на образец: одинаковое число выносим за скобки.','В скобках — сумма двух других чисел.'],why:{ok:'Одинаковое число — за скобки',no:['Скобки можно не ставить']},board:L(`${exprHTML(expr)} = ${exprHTML(ok)}`)}];
  S.forEach(x=>{x.ok=x.opts.indexOf(x.okv)});
  S.push(Object.assign(calcStep(a,'+',b,'Сначала в скобках:'),{board:L(`${exprHTML(expr)} = ${exprHTML(ok)} = …`)}));
  S.push(Object.assign(first?calcStep(m,'·',s):calcStep(s,o,m),{board:L(`${exprHTML(expr)} = ${exprHTML(ok)} = <b>${r}</b>`)}));
  return {start:L(`${exprHTML(expr)} = ${QQ}`),steps:S,record:`${exprHTML(expr)} = ${exprHTML(ok)} = <b>${r}</b>`};
}
/* сравнение с единицами: шаги-переводы */
function cmpU(Ls,Rs,steps,sign,why){
  const sg={'<':'&lt;','>':'&gt;','=':'='}[sign];const lines=[];
  const head=s=>BL(`<span class="cmp">${Ls} <span class="sbox${s?' on':''}">${s||'?'}</span> ${Rs}</span>`);
  const S=steps.map(st=>{const x={k:'num',q:st.q,ok:st.ok,hints:st.hints||['Вспомни: 1 м = 10 дм = 100 см, 1 дм = 10 см, 1 ч = 60 мин.','Посчитай по шагам.']};lines.push(st.line);x.board=head()+lines.map(BL).join('');return x});
  S.push({k:'pick',q:'Какой знак поставить?',opts:['&lt;','&gt;','='],ok:['<','>','='].indexOf(sign),signs:1,hints:['Сравни числа, которые получились, — в одинаковых единицах.','Острый «клювик» смотрит на меньшее.'],why,board:head(sg)+lines.map(BL).join('')});
  return {start:head(),steps:S,record:`${Ls} <span class="tk">${sg}</span> ${Rs}`+lines.map(PEN2).join('')};
}
/* уравнение */
const EQF=[
 [/^(\d+) − x = (\d+)$/,(a,c)=>({comp:1,names:['уменьшаемое','вычитаемое','разность'],ok:`x = ${a} − ${c}`,no:`x = ${a} + ${c}`,x:a-c,chk:x=>`${a} − ${x}`,res:c,rule:'Вычитаемое = уменьшаемое − разность',bad:'Вычитаемое = уменьшаемое + разность'})],
 [/^x − (\d+) = (\d+)$/,(b,c)=>({comp:0,names:['уменьшаемое','вычитаемое','разность'],ok:`x = ${c} + ${b}`,no:`x = ${c} − ${b}`,x:c+b,chk:x=>`${x} − ${b}`,res:c,rule:'Уменьшаемое = разность + вычитаемое',bad:'Уменьшаемое = разность − вычитаемое'})],
 [/^(\d+) \+ x = (\d+)$/,(a,c)=>({comp:1,names:['первое слагаемое','второе слагаемое','сумма'],ok:`x = ${c} − ${a}`,no:`x = ${c} + ${a}`,x:c-a,chk:x=>`${a} + ${x}`,res:c,rule:'Слагаемое = сумма − другое слагаемое',bad:'Слагаемое = сумма + другое слагаемое'})],
 [/^x \+ (\d+) = (\d+)$/,(a,c)=>({comp:0,names:['первое слагаемое','второе слагаемое','сумма'],ok:`x = ${c} − ${a}`,no:`x = ${c} + ${a}`,x:c-a,chk:x=>`${x} + ${a}`,res:c,rule:'Слагаемое = сумма − другое слагаемое',bad:'Слагаемое = сумма + другое слагаемое'})],
 [/^x · (\d+) = (\d+)$/,(b,c)=>({comp:0,names:['первый множитель','второй множитель','произведение'],ok:`x = ${c} : ${b}`,no:`x = ${c} · ${b}`,x:c/b,chk:x=>`${x} · ${b}`,res:c,rule:'Множитель = произведение : другой множитель',bad:'Множитель = произведение · другой множитель'})],
 [/^x : (\d+) = (\d+)$/,(b,c)=>({comp:0,names:['делимое','делитель','частное'],ok:`x = ${c} · ${b}`,no:`x = ${c} : ${b}`,x:c*b,chk:x=>`${x} : ${b}`,res:c,rule:'Делимое = частное · делитель',bad:'Делимое = частное : делитель'})],
 [/^(\d+) : x = (\d+)$/,(a,c)=>({comp:1,names:['делимое','делитель','частное'],ok:`x = ${a} : ${c}`,no:`x = ${a} · ${c}`,x:a/c,chk:x=>`${a} : ${x}`,res:c,rule:'Делитель = делимое : частное',bad:'Делитель = делимое · частное'})]];
const X=s=>s.replace(/x/g,'<i class="var">x</i>');
function eqItem(eq0){
  const S=[];const lines=[];let eq=eq0;
  const m0=eq0.match(/^(.*) = (\d+) ([:·+−]) (\d+)$/);
  if(m0){const [,l,p,o,q]=m0;const v=apply(+p,o,+q);eq=`${l} = ${v}`;
    S.push(Object.assign(calcStep(+p,o,+q,'Сначала посчитай правую часть:'),{board:BL(X(eq0))+BL(X(eq))}));lines.push(X(eq))}
  let f=null;for(const [re,fn] of EQF){const m=eq.match(re);if(m){f=fn(+m[1],+m[2]);break}}
  if(!f)throw new Error('eq '+eq0);
  const head=BL(X(eq0));const bd=()=>head+lines.map(BL).join('');
  S.push({k:'pick',q:`Что неизвестно в уравнении ${X(eq)}?`,opts:f.names,ok:f.comp,hints:['Как называются числа в этом действии?','Буква x стоит на месте какого числа?'],board:bd()});
  S.push({k:'pick',q:'Как найти x?',opts:shuffle([f.ok,f.no]),okv:f.ok,hints:[`Вспомни правило: как найти ${f.names[f.comp]}?`,'Загляни в «Правило».'],why:{ok:f.rule,no:[f.bad]}});
  lines.push(X(f.ok));S[S.length-1].board=bd();S[S.length-1].ok=S[S.length-1].opts.indexOf(f.ok);
  const mm=f.ok.match(/x = (\d+) (.) (\d+)/);const cs=calcStep(+mm[1],mm[2],+mm[3]);lines.push(X(`x = ${f.x}`));cs.board=bd();S.push(cs);
  const ch=f.chk(f.x);const mc=ch.match(/(\d+) (.) (\d+)/);const ck=calcStep(+mc[1],mc[2],+mc[3],'Проверка:');lines.push(`${ch} = ${f.res}`);lines.push(`${f.res} = ${f.res} ✓`);ck.board=bd();S.push(ck);
  return {start:head,steps:S,record:X(eq0)+'<br>'+lines.join('<br>')};
}
/* краткая запись + действия */
function recTask(o){
  const R=o.rows,E=R.filter(r=>r.q).length;
  const view=(k,n)=>{let e=0;return R.map(r=>{let v;if(r.q){v=e<k?r.v:QQ;e++}else v=r.v0;if(r.at!=null&&n>=r.at)v=r.vAt;return BL(`${r.l} — ${v}`)}).join('')};
  const pre=[];let e=0;R.forEach(r=>{if(r.q){e++;pre.push({k:'num',q:r.q,ok:r.ok,hints:r.hints||['Найди это число в условии задачи.','Прочитай задачу ещё раз медленно.'],board:view(e,0)})}});
  const t=taskItem({top:n=>view(E,n),pre:o.pre||[],acts:o.acts,answer:o.answer});
  t.start=view(0,0);t.steps=pre.concat(t.steps);return t;
}
/* таблица К1/К/ОК с произвольными неизвестными */
function kTask(o){
  const G=[['','',''],['','','']];
  const tb=()=>BL(`<table class="tblc ktab"><tr><th></th><th>К1<br><small>${o.h[0]}</small></th><th>К<br><small>${o.h[1]}</small></th><th>ОК<br><small>${o.h[2]}</small></th></tr>${o.names.map((nm,i)=>`<tr><th>${nm}</th>${G[i].map(c=>`<td>${c===''?'':c==='?'?QQ:'<b>'+c+'</b>'}</td>`).join('')}</tr>`).join('')}</table>`);
  const pre=o.fill.map(f=>{G[f.r][f.c]=f.ok;return {k:'num',q:f.q,ok:f.ok,hints:f.hints||['Найди это число в условии.','Прочитай задачу ещё раз.'],board:tb()}});
  o.unk.forEach(u=>G[u.r][u.c]='?');
  pre.push({k:'pick',q:`Строка «${o.names[1]}»: К1 — сколько в одном?`,opts:['Столько же, как в первой строке','Другое число'],ok:0,hints:['Они одинаковые?','В одинаковых — поровну.'],why:{ok:'Они одинаковые',no:['Их меньше']},board:tb()});
  const t=taskItem({top:n=>{o.unk.forEach(u=>G[u.r][u.c]=n>=u.at?u.v:'?');return tb()},pre:o.extra||[],acts:o.acts,answer:o.answer});
  for(const r of G)r.fill('');t.start=tb();t.steps=pre.concat(t.steps);return t;
}
/* часы */
function clockSVG(h,m){
  const cx=60,cy=60;const ha=((h%12)+m/60)*30*Math.PI/180,ma=m*6*Math.PI/180;
  const ticks=Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return `<line x1="${cx+44*Math.sin(a)}" y1="${cy-44*Math.cos(a)}" x2="${cx+50*Math.sin(a)}" y2="${cy-50*Math.cos(a)}" stroke="#26224F" stroke-width="${i%3?2:3.5}"/>`}).join('');
  return `<svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="часы"><circle cx="60" cy="60" r="56" fill="#fff" stroke="#26224F" stroke-width="4"/>${ticks}<line x1="60" y1="60" x2="${cx+26*Math.sin(ha)}" y2="${cy-26*Math.cos(ha)}" stroke="#26224F" stroke-width="6" stroke-linecap="round"/><line x1="60" y1="60" x2="${cx+42*Math.sin(ma)}" y2="${cy-42*Math.cos(ma)}" stroke="#E8452C" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="60" r="4" fill="#26224F"/></svg>`;
}
function clockItem(o){ /* {lbl,h,m,day,add:[h,m]|null,addQ} */
  const pic=BL(`<div class="pics"><figure>${clockSVG(o.h,o.m)}<figcaption>${o.lbl}</figcaption></figure></div>`);
  const S=[{k:'nums',q:'Что показывают часы? Короткая стрелка — часы, длинная (красная) — минуты.',fields:[{ok:o.h,u:'ч'},{ok:o.m,u:'мин'}],hints:['Короткая стрелка показывает часы: на какое число она указывает (или после какого прошла)?','Длинная стрелка — минуты: каждое число на циферблате — это 5 минут.'],board:pic+BL(`${o.lbl}: ${o.h} ч ${o.m} мин`)}];
  let H=o.h;
  if(o.day&&o.h<12){H=o.h+12;S.push({k:'nums',q:'А в дневное время это сколько?',fields:[{ok:H,u:'ч'},{ok:o.m,u:'мин'}],hints:['Днём часы считают после 12.','Прибавь 12 к часам.'],board:pic+BL(`${o.lbl}: ${H} ч ${o.m} мин`)})}
  let rec=`${o.lbl} ${H} ч ${o.m} мин`;
  if(o.add){const tot=H*60+o.m+o.add[0]*60+o.add[1],h2=Math.floor(tot/60),m2=tot%60;
    S.push({k:'nums',q:o.addQ,fields:[{ok:h2,u:'ч'},{ok:m2,u:'мин'}],hints:['Прибавь отдельно часы и отдельно минуты.','Если минут стало 60 или больше — это ещё 1 час.'],board:S[S.length-1].board+BL(`→ ${h2} ч ${m2} мин`)});rec+=` → ${h2} ч ${m2} мин`}
  return {start:pic,steps:S,record:rec};
}
/* доли: прямоугольник из n полосок, круг из n секторов */
function stripSVG(n,sh){const w=150,h=60,d=w/n;return `<svg viewBox="0 0 ${w+4} ${h+4}" width="${w+4}" height="${h+4}" role="img" aria-label="фигура">${Array.from({length:n},(_,i)=>`<rect x="${2+i*d}" y="2" width="${d}" height="${h}" fill="${i<(sh==null?1:sh)?'#6B6880':'#fff'}" stroke="#26224F" stroke-width="2"/>`).join('')}</svg>`}
function pieSVG(n,sh){const R=40,c=44;sh=sh==null?1:sh;return `<svg viewBox="0 0 88 88" width="88" height="88" role="img" aria-label="круг">${Array.from({length:n},(_,i)=>{const a1=i/n*2*Math.PI-Math.PI/2,a2=(i+1)/n*2*Math.PI-Math.PI/2;return `<path d="M${c} ${c}L${c+R*Math.cos(a1)} ${c+R*Math.sin(a1)}A${R} ${R} 0 ${n<=1?1:0} 1 ${c+R*Math.cos(a2)} ${c+R*Math.sin(a2)}Z" fill="${i<sh?'#6B6880':'#fff'}" stroke="#26224F" stroke-width="2"/>`}).join('')}</svg>`}
function fracItem(lbl,svg,n){
  const pic=BL(`<div class="pics"><figure>${svg}<figcaption>${lbl}</figcaption></figure></div>`);
  return {start:pic,steps:[{k:'num',q:'На сколько равных частей разделено целое?',ok:n,hints:['Посчитай все части — и закрашенные, и белые.','Считай по одной слева направо.'],board:pic+BL(`${lbl} разделено на ${n} частей`)},
    {k:'num',q:`Сколько частей закрашено?`,ok:1,hints:['Посмотри на тёмные части.','Посчитай тёмные.'],board:pic+BL(`${lbl} закрашена ${FR(1,n)} часть`)}],record:`${lbl} ${FR(1,n)}`};
}
function fracCmp(a,b,sa,sb){
  const sg=a<b?'>':a>b?'<':'=';const sh={'<':'&lt;','>':'&gt;','=':'='}[sg];
  const head=s=>BL(`<div class="fcmp"><span class="fp">${sa}${FR(1,a)}</span><span class="sbox${s?' on':''}">${s||'?'}</span><span class="fp">${sb}${FR(1,b)}</span></div>`);
  return {start:head(),steps:[{k:'pick',q:'Какой знак поставить? Посмотри на закрашенные части.',opts:['&lt;','&gt;','='],ok:['<','>','='].indexOf(sg),signs:1,hints:['Где закрашенный кусочек больше?','Чем на большее число частей делим, тем меньше каждая часть.'],why:{ok:`На ${Math.max(a,b)} ${plural(Math.max(a,b),'часть','части','частей')} — кусочки мельче`,no:[`${Math.max(a,b)} больше, значит, доля больше`]},board:head(sh)}],record:`${FR(1,a)} <span class="tk">${sh}</span> ${FR(1,b)}`};
}
/* фигура из клеток (каждая клетка — 1 см²) */
function cellsSVG(cells,opt){
  opt=opt||{};const s=opt.s||22;const xs=cells.map(c=>c[0]),ys=cells.map(c=>c[1]);const W=Math.max(...xs)+1,H=Math.max(...ys)+1;
  const big=opt.big;
  return `<svg viewBox="-2 -2 ${W*s+4} ${H*s+4}" width="${W*s+4}" height="${H*s+4}" role="img" aria-label="фигура">${cells.map(c=>`<rect x="${c[0]*s}" y="${c[1]*s}" width="${s}" height="${s}" fill="${opt.fill||'#E7F1FF'}" stroke="${opt.inner===false?'#E7F1FF':'#7C86C8'}" stroke-width="1"/>`).join('')}${(big||[]).map(c=>`<rect x="${c[0]*s}" y="${c[1]*s}" width="${2*s}" height="${2*s}" fill="none" stroke="#26224F" stroke-width="3"/>`).join('')}</svg>`;
}
const rectCells=(w,h,x0,y0)=>{const r=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)r.push([x+(x0||0),y+(y0||0)]);return r};
function areaRect(lbl,w,h){
  const pic=BL(`<div class="pics"><figure>${cellsSVG(rectCells(w,h))}<figcaption>${lbl}</figcaption></figure></div>`);
  return {start:pic,steps:[{k:'num',q:`${lbl}: сколько квадратов в одном ряду?`,ok:w,hints:['Посчитай клетки в верхнем ряду.','Считай по одной.'],board:pic+BL(`в ряду: ${w}`)},
    {k:'num',q:'Сколько рядов?',ok:h,hints:['Посчитай ряды сверху вниз.','Сколько полосок?'],board:pic+BL(`в ряду: ${w}, рядов: ${h}`)},
    {k:'pick',q:'Как найти площадь?',opts:shuffle([`${w} · ${h}`,`${w} + ${h}`,`(${w} + ${h}) · 2`]),okv:`${w} · ${h}`,hints:['В каждом ряду одинаково квадратов.',`По ${w} взять ${h} раз.`],why:{ok:'Квадратов в ряду · рядов',no:['Это периметр']},board:pic+BL(`S = ${w} · ${h}`)},
    Object.assign(calcStep(w,'·',h),{board:pic+BL(`S = ${w} · ${h} = ${w*h} (см²)`)})].map(x=>{if(x.okv)x.ok=x.opts.indexOf(x.okv);return x}),record:`S ${lbl} = ${w} · ${h} = ${w*h} (см²)`};
}
/* периметр прямоугольника: шаги */
function perSteps(a,b,u){
  u=u||'(см)';
  return [{q:'Как найти периметр прямоугольника?',opts:[`(${a} + ${b}) · 2`,`${a} · ${b}`,`${a} + ${b}`],ok:0,hints:['Периметр — длина всех сторон: 2 длины и 2 ширины.','(длина + ширина) · 2'],why:{ok:'2 длины и 2 ширины',no:['1 длина и 1 ширина']},calc:[a,'+',b],u},
    {q:'Теперь умножаем на 2',opts:[`${a+b} · 2`,`${a+b} + 2`,`${a+b} : 2`],ok:0,hints:['Длина и ширина — каждая по 2 раза.',`${a+b} взять 2 раза.`],why:{ok:'Каждая сторона по 2 раза',no:['Делим пополам']},calc:[a+b,'·',2],u,lbl:'периметр'}];
}
