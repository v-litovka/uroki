// @ts-nocheck — перенос «Города Задач» из legacy-src/zadachi (shared.js + content.js) почти без правок:
// это проверенная логика задач (шаблоны, числа, схемы, решения). Типизированный вход — modes.ts.
/* eslint-disable */
import { shuffle } from '../../../../shared/utils/random';

/* ===== общая часть: рисование схем (отрезков) как в учебнике ===== */
/* desc = {rows:[{name:'Г.',segs:[{v:5,dash:0}],note:''}], up:[{r,a,b,t}], down:[{r,a,b,t}], right:'?'}
   a..b — номера отрезков в строке (включительно) */
function plural(n,a,b,c){const m=n%10,h=n%100;return m===1&&h!==11?a:(m>=2&&m<=4&&(h<12||h>14)?b:c)}
function nf(n,f){return n+' '+plural(n,f[0],f[1],f[2])}
function raza(k){return plural(k,'раз','раза','раз')}
function drawScheme(d,opt){
  opt=opt||{};
  const X0=d.rows.some(r=>r.name)?34:8,MAXW=opt.w||230,MIN=24;
  const maxV=Math.max(...d.rows.map(r=>r.segs.reduce((s,g)=>s+g.v,0)));
  const k=MAXW/maxV;
  const rows=d.rows.map((r,ri)=>{let x=X0;const xs=[x];r.segs.forEach(g=>{x+=Math.max(MIN,g.v*k);xs.push(x)});return {r,xs,ri};});
  let y=0;const parts=[];
  const lbl=(x,yy,t)=>{const q=/\?/.test(t);return `<text x="${x}" y="${yy}" text-anchor="middle" class="${q?'sq':'sl'}">${t}</text>`};
  const brace=(x1,x2,yy,dir,t)=>{
    if(t===''||t==null)return '';
    const s=dir; /* -1 вверх, 1 вниз */
    const y0=yy+s*5,yb=yy+s*11,yp=yy+s*16,m=(x1+x2)/2;
    let p;
    if(x2-x1<26)p=`M${x1} ${y0}V${yb}H${x2}V${y0}`;
    else p=`M${x1} ${y0}Q${x1} ${yb} ${x1+6} ${yb}H${m-6}Q${m} ${yb} ${m} ${yp}Q${m} ${yb} ${m+6} ${yb}H${x2-6}Q${x2} ${yb} ${x2} ${y0}`;
    return `<path d="${p}" class="br${/\?/.test(t)?' bq':''}"/>`+lbl(m,s<0?yy-21:yy+33,t);
  };
  const lineY=[];
  rows.forEach(R=>{
    const hasUp=(d.up||[]).some(b=>b.r===R.ri),hasDown=(d.down||[]).some(b=>b.r===R.ri);
    y+=hasUp?36:18;const ly=y;lineY.push(ly);
    if(R.r.name)parts.push(`<text x="2" y="${ly+5}" class="nm">${R.r.name}</text>`);
    R.r.segs.forEach((g,i)=>{parts.push(`<line x1="${R.xs[i]}" y1="${ly}" x2="${R.xs[i+1]}" y2="${ly}" class="sg${g.dash?' ds':''}"/>`)});
    R.xs.forEach((x,i)=>{const dash=(i>0&&R.r.segs[i-1].dash)&&(i===R.xs.length-1);parts.push(`<circle cx="${x}" cy="${ly}" r="3.6" class="${dash?'dt ho':'dt'}"/>`)});
    (d.up||[]).filter(b=>b.r===R.ri).forEach(b=>parts.push(brace(R.xs[b.a]+1,R.xs[b.b+1]-1,ly,-1,b.t)));
    (d.down||[]).filter(b=>b.r===R.ri).forEach(b=>parts.push(brace(R.xs[b.a]+1,R.xs[b.b+1]-1,ly,1,b.t)));
    if(R.r.note)parts.push(`<text x="${R.xs[R.xs.length-1]+10}" y="${ly+5}" class="sq" text-anchor="start">${R.r.note}</text>`);
    y+=hasDown?38:14;
  });
  let maxX=Math.max(...rows.map(R=>R.xs[R.xs.length-1]+(R.r.note?70:0)));
  if(d.right){
    const xr=Math.max(...rows.map(R=>R.xs[R.xs.length-1]))+12,y1=lineY[0]-6,y2=lineY[lineY.length-1]+6,m=(y1+y2)/2;
    parts.push(`<path d="M${xr} ${y1}Q${xr+6} ${y1} ${xr+6} ${y1+6}V${m-6}Q${xr+6} ${m} ${xr+12} ${m}Q${xr+6} ${m} ${xr+6} ${m+6}V${y2-6}Q${xr+6} ${y2} ${xr} ${y2}" class="br bq"/>`);
    parts.push(`<text x="${xr+17}" y="${m+6}" class="sq" text-anchor="start">${d.right}</text>`);
    maxX=Math.max(maxX,xr+40);
  }
  const H=y+2,W=maxX+8;
  return `<svg class="scheme" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="схема">${parts.join('')}</svg>`;
}
const SCHEME_CSS=`.scheme{display:block;max-width:100%;height:auto;margin:0 auto;overflow:visible}
.scheme .sg{stroke:#2B3A9E;stroke-width:4;stroke-linecap:round}
.scheme .ds{stroke-dasharray:6 5;stroke-width:3}
.scheme .dt{fill:#2B3A9E}.scheme .dt.ho{fill:#fff;stroke:#2B3A9E;stroke-width:2}
.scheme .br{fill:none;stroke:#26224F;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.scheme .br.bq{stroke:#E8452C}
.scheme text{font-family:'Nunito',system-ui,sans-serif;font-weight:900;font-size:17px;fill:#26224F}
.scheme .sq{fill:#E8452C;font-size:19px}
.scheme .nm{font-size:15px;fill:#5B5785}`;

/* ===== готовые схемы по типам задач ===== */
const SCH={
  /* целое из частей: ищем целое */
  sum:(a,b,qWhole,qa,qb)=>({rows:[{segs:[{v:a},{v:b}]}],up:[{r:0,a:0,b:1,t:qWhole}],down:[{r:0,a:0,b:0,t:qa},{r:0,a:1,b:1,t:qb}]}),
  /* сравнение двух: второй больше на d */
  more:(n1,n2,a,d,ta,td,tq)=>({rows:[{name:n1,segs:[{v:a}]},{name:n2,segs:[{v:a},{v:d}]}],up:[{r:0,a:0,b:0,t:ta},{r:1,a:1,b:1,t:td}],down:[{r:1,a:0,b:1,t:tq}]}),
  /* второй меньше на d */
  less:(n1,n2,a,d,ta,td,tq)=>({rows:[{name:n1,segs:[{v:a}]},{name:n2,segs:[{v:a-d},{v:d,dash:1}]}],up:[{r:0,a:0,b:0,t:ta},{r:1,a:1,b:1,t:td}],down:[{r:1,a:0,b:0,t:tq}]}),
  /* второй больше в k раз */
  times:(n1,n2,a,k,ta,tq)=>({rows:[{name:n1,segs:[{v:a}]},{name:n2,segs:Array.from({length:k},()=>({v:a}))}],up:[{r:0,a:0,b:0,t:ta}],down:[{r:1,a:0,b:k-1,t:tq}]}),
  /* второй меньше в k раз */
  part:(n1,n2,b,k,tb,tq)=>({rows:[{name:n1,segs:Array.from({length:k},()=>({v:b/k}))},{name:n2,segs:[{v:b/k}]}],up:[{r:0,a:0,b:k-1,t:tb}],down:[{r:1,a:0,b:0,t:tq}]}),
  /* на сколько больше: ? на разнице */
  diff:(n1,n2,big,small,tb,ts)=>({rows:[{name:n1,segs:[{v:small},{v:big-small}]},{name:n2,segs:[{v:small}]}],up:[{r:0,a:0,b:1,t:tb},{r:1,a:0,b:0,t:ts}],down:[{r:0,a:1,b:1,t:'?'}]}),
  /* во сколько раз: большее делим на кусочки по меньшему */
  ratio:(n1,n2,big,small,k,tb,ts)=>({rows:[{name:n1,segs:Array.from({length:k},()=>({v:small})),note:'? раз'},{name:n2,segs:[{v:small}]}],up:[{r:0,a:0,b:k-1,t:tb},{r:1,a:0,b:0,t:ts}],down:[]}),
  /* две строки + «вместе» справа */
  both:(base,right)=>Object.assign({},base,{right})
};

const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const MI='−',MUL='·',DIV=':';
const ev=(x,op,y)=>op==='+'?x+y:op===MI?x-y:op===MUL?x*y:x/y;
const ex=(x,op,y)=>`${x} ${op} ${y}`;
const okOp=(x,op,y)=>op==='+'?true:op===MI?x>y:op===MUL?(x<=10||y<=10):(y>1&&x%y===0);
/* варианты решения: верное + ловушки (только те, что можно посчитать) */
function exprOpts(x,y,op,traps){
  const list=[ex(x,op,y)];
  traps.forEach(t=>{const [a,o,b]=t==='swap'?[y,MI,x]:[x,t,y];if(list.length<3&&okOp(a,o,b)&&!list.includes(ex(a,o,b)))list.push(ex(a,o,b));});
  if(list.length<2)list.push(ex(x,'+',y)===list[0]?ex(Math.max(x,y),MI,Math.min(x,y)):ex(x,'+',y));
  return shuffle(list);
}
const ini=n=>n[0]+'.';
/* существительные: 1, 2–4, 5+ */
const W={
  toy:['игрушечная мышка','игрушечные мышки','игрушечных мышек'],dia:['алмаз','алмаза','алмазов'],rose:['роза','розы','роз'],tul:['тюльпан','тюльпана','тюльпанов'],
  book:['книга','книги','книг'],rob:['робукс','робукса','робуксов'],kg:['килограмм','килограмма','килограммов'],pie:['пирожок','пирожка','пирожков'],
  clip:['заколка','заколки','заколок'],fly:['муха','мухи','мух'],boy:['мальчик','мальчика','мальчиков'],girl:['девочка','девочки','девочек'],
  cup:['чашка','чашки','чашек'],glass:['стакан','стакана','стаканов'],l:['литр','литра','литров'],house:['домик','домика','домиков'],
  nb:['тетрадь','тетради','тетрадей'],cm:['сантиметр','сантиметра','сантиметров'],photo:['фотография','фотографии','фотографий'],
  day:['день','дня','дней'],step:['ступенька','ступеньки','ступенек'],car:['машинка','машинки','машинок'],year:['год','года','лет'],
  cake:['пирожное','пирожных','пирожных'],pen:['фломастер','фломастера','фломастеров'],chest:['сундук','сундука','сундуков'],
  block:['блок','блока','блоков'],zombie:['зомби','зомби','зомби'],apple:['яблоко','яблока','яблок'],sticker:['наклейка','наклейки','наклеек'],
  bead:['бусинка','бусинки','бусинок'],clipA:['заколку','заколки','заколок'],flyA:['муху','мухи','мух'],photoA:['фотографию','фотографии','фотографий'],bookA:['книгу','книги','книг'],level:['уровень','уровня','уровней'],cookie:['печенье','печенья','печений']
};
const n_=(n,w)=>nf(n,W[w]);

/* ---------- генераторы чисел по типам ---------- */
const GEN={
  sum:()=>{const a=rnd(12,48),b=rnd(6,Math.min(39,95-a));return {a,b,x:a+b};},
  rest:()=>{const t=rnd(30,95),a=rnd(8,t-8);return {t,a,x:t-a};},
  was:()=>{const a=rnd(8,45),b=rnd(6,Math.min(40,95-a));return {a,b,x:a+b};},
  naB:()=>{const a=rnd(6,40),d=rnd(2,9);return {a,d,x:a+d};},
  naM:()=>{const d=rnd(2,9),a=rnd(d+5,50);return {a,d,x:a-d};},
  vB:()=>{const k=rnd(2,5),a=rnd(2,9);return {a,k,x:a*k};},
  vM:()=>{const k=rnd(2,5),x=rnd(2,9);return {b:x*k,k,x};},
  kNaP:()=>{const a=rnd(6,40),d=rnd(2,9);return {a,d,x:a+d};},
  kNaM:()=>{const d=rnd(2,9),a=rnd(d+5,50);return {a,d,x:a-d};},
  kVMul:()=>{const k=rnd(2,5),a=rnd(2,9);return {a,k,x:a*k};},
  kVDiv:()=>{const k=rnd(2,5),x=rnd(2,9);return {a:x*k,k,x};},
  diff:()=>{const s=rnd(5,40),big=rnd(s+3,Math.min(95,s+40));return {big,s,x:big-s};},
  ratio:()=>{const s=rnd(2,9),k=rnd(2,6);return {big:s*k,s,x:k};},
  ok:()=>{const k1=rnd(2,9),k=rnd(2,9);return {k1,k,okv:k1*k,x:k1*k};},
  k1:()=>{const k1=rnd(2,9),k=rnd(2,9);return {k1,k,okv:k1*k,x:k1};},
  kk:()=>{const k1=rnd(2,9),k=rnd(2,9);return {k1,k,okv:k1*k,x:k};},
  c1:()=>{const a=rnd(6,35),d=rnd(2,9);return {a,d,y:a+d,x:2*a+d};},
  c2:()=>{const k=rnd(2,5),y=rnd(2,9),a=y*k;return {a,k,y,x:a+y};},
  c3:()=>{const a=rnd(6,35),d=rnd(2,9);return {a,d,y:a+d,x:2*a+d};},
  c4:()=>{const k=rnd(2,5),a=rnd(2,9),y=a*k;return {a,k,y,x:y-a};}
};

/* ---------- тексты задач ----------
   st — улица, type — тип, t(o) — текст, A/B — имена для схемы, ans(x) — ответ словами */
const TPL=[
  /* Часть и целое */
  {st:'part',type:'sum',A:'',B:'',t:o=>`У Венди ${n_(o.a,'toy')}, а у Виры — ${o.b}. Сколько игрушечных мышек у кошек вместе?`,ans:x=>n_(x,'toy')},
  {st:'part',type:'sum',A:'',B:'',t:o=>`Стив добыл ${n_(o.a,'dia')}, а потом ещё ${o.b}. Сколько алмазов добыл Стив?`,ans:x=>n_(x,'dia')},
  {st:'part',type:'sum',A:'',B:'',t:o=>`В вазе ${n_(o.a,'rose')} и ${n_(o.b,'tul')}. Сколько всего цветов в вазе?`,ans:x=>x+' '+plural(x,'цветок','цветка','цветов')},
  {st:'part',type:'rest',A:'',B:'',t:o=>`В библиотеке было ${n_(o.t,'book')}. Выдали ${n_(o.a,'bookA')}. Сколько книг осталось?`,ans:x=>n_(x,'book')},
  {st:'part',type:'rest',A:'',B:'',t:o=>`У Сони в Роблоксе было ${n_(o.t,'rob')}. Она потратила ${o.a} на скин. Сколько робуксов осталось?`,ans:x=>n_(x,'rob')},
  {st:'part',type:'rest',A:'',B:'',t:o=>`Вира и Венди вместе съели ${o.t} ${plural(o.t,'кусочек','кусочка','кусочков')} корма. Венди съела ${o.a}. Сколько кусочков съела Вира?`,ans:x=>x+' '+plural(x,'кусочек','кусочка','кусочков')},
  {st:'part',type:'was',A:'',B:'',t:o=>`Когда продали ${n_(o.a,'kg')} лука, осталось ${n_(o.b,'kg')}. Сколько килограммов лука было?`,ans:x=>n_(x,'kg')},
  {st:'part',type:'was',A:'',B:'',g:()=>{const L=[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,25,26,27,28,29,30];const a=L[rnd(0,L.length-1)],b=rnd(6,40);return {a,b,x:a+b};},t:o=>`Когда из автобуса вышло ${o.a} пассажиров, в нём осталось ${o.b}. Сколько пассажиров было в автобусе?`,ans:x=>x+' '+plural(x,'пассажир','пассажира','пассажиров')},
  /* на больше / на меньше */
  {st:'na',type:'naB',A:'Галя',B:'Оля',t:o=>`Галя купила ${n_(o.a,'clipA')}, а Оля — на ${o.d} больше. Сколько заколок купила Оля?`,ans:x=>n_(x,'clip')},
  {st:'na',type:'naB',A:'Венди',B:'Вира',t:o=>`Венди поймала ${n_(o.a,'flyA')}, а Вира — на ${o.d} больше. Сколько мух поймала Вира?`,ans:x=>n_(x,'fly')},
  {st:'na',type:'naB',A:'Стив',B:'Алекс',t:o=>`Стив построил ${n_(o.a,'house')}, а Алекс — на ${o.d} больше. Сколько домиков построил Алекс?`,ans:x=>n_(x,'house')},
  {st:'na',type:'naM',A:'Мальчики',B:'Девочки',t:o=>`В кружке робототехники ${n_(o.a,'boy')}, а девочек — на ${o.d} меньше. Сколько девочек в кружке?`,ans:x=>n_(x,'girl')},
  {st:'na',type:'naM',A:'Нюша',B:'Крош',t:o=>`Нюша испекла ${n_(o.a,'pie')}, а Крош — на ${o.d} меньше. Сколько пирожков испёк Крош?`,ans:x=>n_(x,'pie')},
  {st:'na',type:'naM',A:'Вира',B:'Венди',t:o=>`У Виры ${n_(o.a,'sticker')} с рыбками, а у Венди — на ${o.d} меньше. Сколько наклеек у Венди?`,ans:x=>n_(x,'sticker')},
  /* в раз больше / меньше */
  {st:'v',type:'vB',A:'Чашки',B:'Стаканы',t:o=>`На полке ${n_(o.a,'cup')}, а стаканов — в ${o.k} ${raza(o.k)} больше. Сколько стаканов на полке?`,ans:x=>n_(x,'glass')},
  {st:'v',type:'vB',A:'Кувшин',B:'Ведро',t:o=>`В кувшине ${n_(o.a,'l')} воды, а в ведре — в ${o.k} ${raza(o.k)} больше. Сколько литров воды в ведре?`,ans:x=>n_(x,'l')},
  {st:'v',type:'vB',A:'Стив',B:'Алекс',t:o=>`Стив победил ${o.a} зомби, а Алекс — в ${o.k} ${raza(o.k)} больше. Скольких зомби победил Алекс?`,ans:x=>x+' зомби'},
  {st:'v',type:'vM',A:'Клетка',B:'Линейка',t:o=>`Купили ${n_(o.b,'nb')} в клетку, а в линейку — в ${o.k} ${raza(o.k)} меньше. Сколько тетрадей в линейку купили?`,ans:x=>n_(x,'nb')},
  {st:'v',type:'vM',A:'1-й',B:'2-й',t:o=>`Длина первого отрезка — ${n_(o.b,'cm')}, а второго — в ${o.k} ${raza(o.k)} меньше. Найди длину второго отрезка.`,ans:x=>n_(x,'cm')},
  {st:'v',type:'vM',A:'Венди',B:'Вира',t:o=>`Венди пробежала по дивану ${o.b} ${plural(o.b,'круг','круга','кругов')}, а ленивая Вира — в ${o.k} ${raza(o.k)} меньше. Сколько кругов пробежала Вира?`,ans:x=>x+' '+plural(x,'круг','круга','кругов')},
  /* хитрые: «это на … меньше, чем …» */
  {st:'kosv',type:'kNaP',A:'Наташа',B:'Милана',q:'У кого фотографий больше?',t:o=>`Наташа сделала ${n_(o.a,'photoA')}. Это на ${o.d} меньше, чем сделала Милана. Сколько фотографий сделала Милана?`,ans:x=>n_(x,'photo')},
  {st:'kosv',type:'kNaP',A:'Вира',B:'Венди',q:'Кто поймал больше мух?',t:o=>`Вира поймала ${n_(o.a,'flyA')}. Это на ${o.d} меньше, чем поймала Венди. Сколько мух поймала Венди?`,ans:x=>n_(x,'fly')},
  {st:'kosv',type:'kNaM',A:'Михалина',B:'Брат',q:'У кого рисунков больше?',t:o=>`Михалина сделала ${o.a} ${plural(o.a,'рисунок','рисунка','рисунков')}, что на ${o.d} больше, чем сделал её брат. Сколько рисунков сделал брат?`,ans:x=>x+' '+plural(x,'рисунок','рисунка','рисунков')},
  {st:'kosv',type:'kNaM',A:'Стив',B:'Алекс',q:'У кого алмазов больше?',t:o=>`У Стива ${n_(o.a,'dia')}. Это на ${o.d} больше, чем у Алекса. Сколько алмазов у Алекса?`,ans:x=>n_(x,'dia')},
  {st:'kosv',type:'kVMul',A:'1-я',B:'2-я',q:'На какой стройке работали дольше?',t:o=>`Строители работали на первой стройке ${n_(o.a,'day')}. Это в ${o.k} ${raza(o.k)} меньше, чем на второй стройке. Сколько дней работали на второй стройке?`,ans:x=>n_(x,'day')},
  {st:'kosv',type:'kVMul',A:'Данута',B:'Соня',q:'У кого бусинок больше?',t:o=>`В бусах у Дануты ${n_(o.a,'bead')}. Это в ${o.k} ${raza(o.k)} меньше, чем в бусах у Сони. Сколько бусинок у Сони?`,ans:x=>n_(x,'bead')},
  {st:'kosv',type:'kVDiv',A:'Гречка',B:'Рис',q:'Чего больше — гречки или риса?',t:o=>`Было ${n_(o.a,'kg')} гречки. Это в ${o.k} ${raza(o.k)} больше, чем риса. Сколько килограммов риса было?`,ans:x=>n_(x,'kg')},
  {st:'kosv',type:'kVDiv',A:'Венди',B:'Вира',q:'Кто прошёл больше уровней?',t:o=>`Венди прошла в игре ${n_(o.a,'level')}. Это в ${o.k} ${raza(o.k)} больше, чем прошла Вира. Сколько уровней прошла Вира?`,ans:x=>n_(x,'level')},
  /* на сколько? во сколько раз? */
  {st:'cmp',type:'diff',A:'Федя',B:'Максим',t:o=>`У Феди ${n_(o.big,'car')}, а у Максима — ${o.s}. На сколько больше машинок у Феди, чем у Максима?`,ans:x=>`на ${x}`},
  {st:'cmp',type:'diff',A:'Шёлк',B:'Органза',t:o=>`Осталось ${o.big} м шёлка и ${o.s} м органзы. На сколько метров органзы осталось меньше, чем шёлка?`,ans:x=>`на ${x} м`},
  {st:'cmp',type:'diff',A:'Нюша',B:'Крош',t:o=>`Нюша съела ${n_(o.big,'apple')}, а Крош — ${o.s}. На сколько больше яблок съела Нюша?`,ans:x=>`на ${x}`},
  {st:'cmp',type:'ratio',A:'Папа',B:'Сын',g:()=>{const s=rnd(6,9),k=rnd(5,6);return {big:s*k,s,x:k};},t:o=>`Папе ${n_(o.big,'year')}, а сыну — ${n_(o.s,'year')}. Во сколько раз папа старше сына?`,ans:x=>`в ${x} ${raza(x)}`},
  {st:'cmp',type:'ratio',A:'Персики',B:'Абрикосы',g:()=>{const s=rnd(3,8),k=rnd(2,4);return {big:s*k,s,x:k};},t:o=>`Ящик с персиками весит ${o.big} кг, а ящик с абрикосами — ${o.s} кг. Во сколько раз ящик с персиками тяжелее?`,ans:x=>`в ${x} ${raza(x)}`},
  {st:'cmp',type:'ratio',A:'Вира',B:'Венди',t:o=>`Вира съела за день ${o.big} ${plural(o.big,'кусочек','кусочка','кусочков')} корма, а Венди — ${o.s}. Во сколько раз больше съела Вира, чем Венди?`,ans:x=>`в ${x} ${raza(x)}`},
  /* К1 · К = ОК */
  {st:'k1',type:'ok',H:['пирожных в 1 коробке','коробок','всего пирожных'],t:o=>`В ${o.k} коробках лежат пирожные, по ${o.k1} в каждой. Сколько всего пирожных?`,ans:x=>n_(x,'cake')},
  {st:'k1',type:'ok',H:['алмазов в 1 сундуке','сундуков','всего алмазов'],t:o=>`Стив поставил ${n_(o.k,'chest')}, в каждом по ${n_(o.k1,'dia')}. Сколько всего алмазов в сундуках?`,ans:x=>n_(x,'dia')},
  {st:'k1',type:'ok',H:['литров в 1 ведре','вёдер','всего литров'],t:o=>`Воду разлили в ${o.k} ${plural(o.k,'ведро','ведра','вёдер')}, в каждом ведре по ${n_(o.k1,'l')}. Сколько литров воды было?`,ans:x=>n_(x,'l')},
  {st:'k1',type:'k1',H:['пирожных в 1 коробке','коробок','всего пирожных'],t:o=>`${o.okv} ${plural(o.okv,'пирожное','пирожных','пирожных')} разложили поровну в ${o.k} ${plural(o.k,'коробку','коробки','коробок')}. Сколько пирожных в одной коробке?`,ans:x=>n_(x,'cake')},
  {st:'k1',type:'k1',H:['литров в 1 пакете','пакетов','всего литров'],t:o=>`В ${o.k} пакетах ${n_(o.okv,'l')} сока, поровну в каждом. Сколько литров сока в одном пакете?`,ans:x=>n_(x,'l')},
  {st:'k1',type:'k1',H:['блоков в 1 башне','башен','всего блоков'],t:o=>`Стив построил ${o.k} ${plural(o.k,'одинаковую башню','одинаковые башни','одинаковых башен')}, на них ушло ${n_(o.okv,'block')}. Сколько блоков в одной башне?`,ans:x=>n_(x,'block')},
  {st:'k1',type:'kk',H:['фломастеров в 1 наборе','наборов','всего фломастеров'],t:o=>`Купили несколько наборов фломастеров, по ${n_(o.k1,'pen')} в каждом. Всего купили ${n_(o.okv,'pen')}. Сколько наборов купили?`,ans:x=>x+' '+plural(x,'набор','набора','наборов')},
  {st:'k1',type:'kk',H:['тетрадей в 1 стопке','стопок','всего тетрадей'],t:o=>`На столе лежат стопки тетрадей, по ${n_(o.k1,'nb')} в каждой. Всего ${n_(o.okv,'nb')}. Сколько стопок на столе?`,ans:x=>x+' '+plural(x,'стопка','стопки','стопок')},
  {st:'k1',type:'kk',H:['пирожков на 1 тарелке','тарелок','всего пирожков'],t:o=>`Совунья разложила ${n_(o.okv,'pie')} по ${o.k1} на тарелку. Сколько тарелок понадобилось?`,ans:x=>x+' '+plural(x,'тарелка','тарелки','тарелок')},
  /* в два действия */
  {st:'two',type:'c1',A:'Стив',B:'Алекс',t:o=>`Стив нашёл ${n_(o.a,'dia')}, а Алекс — на ${o.d} больше. Сколько алмазов они нашли вместе?`,ans:x=>n_(x,'dia'),y:'Сколько нашёл Алекс?',z:'Сколько вместе?'},
  {st:'two',type:'c1',A:'Венди',B:'Вира',t:o=>`Венди поймала ${n_(o.a,'flyA')}, а Вира — на ${o.d} больше. Сколько мух поймали кошки вместе?`,ans:x=>n_(x,'fly'),y:'Сколько поймала Вира?',z:'Сколько вместе?'},
  {st:'two',type:'c2',A:'Нюша',B:'Совунья',t:o=>`Нюша испекла ${n_(o.a,'pie')}, а Совунья — в ${o.k} ${raza(o.k)} меньше. Сколько пирожков они испекли вместе?`,ans:x=>n_(x,'pie'),y:'Сколько испекла Совунья?',z:'Сколько вместе?'},
  {st:'two',type:'c2',A:'Клетка',B:'Линейка',t:o=>`Купили ${n_(o.a,'nb')} в клетку, а в линейку — в ${o.k} ${raza(o.k)} меньше. Сколько всего тетрадей купили?`,ans:x=>n_(x,'nb'),y:'Сколько тетрадей в линейку?',z:'Сколько всего?'},
  {st:'two',type:'c3',A:'Наташа',B:'Милана',t:o=>`Наташа сделала ${n_(o.a,'photoA')}. Это на ${o.d} меньше, чем сделала Милана. Сколько фотографий сделали девочки вместе?`,ans:x=>n_(x,'photo'),y:'Сколько сделала Милана?',z:'Сколько вместе?'},
  {st:'two',type:'c4',A:'Девочки',B:'Мальчики',t:o=>`На велотреке катались ${n_(o.a,'girl')}, а мальчиков — в ${o.k} ${raza(o.k)} больше. На сколько больше мальчиков, чем девочек?`,ans:x=>`на ${x}`,y:'Сколько мальчиков?',z:'На сколько больше мальчиков?'}
];

const STREETS=[
  {id:'part',name:'Часть и целое',sign:'Целое',c:'#2D6CDF',desc:'Всего, осталось, сколько было. Один отрезок.'},
  {id:'na',name:'На … больше / меньше',sign:'+  −',c:'#13A3A0',desc:'«На 3 больше» — столько же и ещё 3.'},
  {id:'v',name:'В … раз больше / меньше',sign:'·  :',c:'#7A4FE0',desc:'«В 3 раза больше» — повторить 3 раза.'},
  {id:'kosv',name:'Хитрые задачи',sign:'Ловушка',c:'#E8452C',desc:'«Это на 7 меньше, чем у Миланы» — у Миланы больше!'},
  {id:'cmp',name:'На сколько? Во сколько раз?',sign:'Сравни',c:'#FF8A1C',desc:'На сколько — вычитаем. Во сколько раз — делим. Без схемы.'},
  {id:'k1',name:'К1 · К = ОК',sign:'Таблица',c:'#3D8B3A',desc:'В одной, количество, всего. Умножаем или делим.'},
  {id:'two',name:'В два действия',sign:'1, 2',c:'#B4489F',desc:'Сначала второе число, потом вместе.'}
];

const RULES={
  sum:{title:'Ищем целое',text:'Целое — это все части <b>вместе</b>. На схеме целое — <b>весь отрезок</b>, части — его кусочки. Ищем целое — части <b>складываем (+)</b>.'},
  rest:{title:'Ищем часть',text:'Знаем <b>целое</b> (весь отрезок) и одну часть. Другую часть находим <b>вычитанием (−)</b>: из целого вычитаем известную часть.'},
  was:{title:'Сколько было?',text:'Было = <b>ушло + осталось</b>. Слова «продали», «вышли» тут <b>не значат минус</b>! Ищем <b>целое</b> (сколько было) — части <b>складываем (+)</b>.'},
  naB:{title:'На … больше',text:'«<b>На 3 больше</b>» — это <b>столько же и ещё 3</b>. На схеме второй отрезок такой же, как первый, и ещё кусочек. Действие — <b>сложение (+)</b>.'},
  naM:{title:'На … меньше',text:'«<b>На 3 меньше</b>» — это <b>столько же, но без 3</b>. На схеме второй отрезок короче, недостающий кусочек — пунктиром. Действие — <b>вычитание (−)</b>.'},
  vB:{title:'В … раз больше',text:'«<b>В 3 раза больше</b>» — это <b>столько же, повторить 3 раза</b>. На схеме второй отрезок из 3 одинаковых кусков. Действие — <b>умножение (·)</b>.'},
  vM:{title:'В … раз меньше',text:'«<b>В 3 раза меньше</b>» — это <b>разделить на 3 равные части и взять одну</b>. На схеме первый отрезок разрезан на 3 куска, второй — как один кусок. Действие — <b>деление (:)</b>.'},
  kNaP:{title:'Хитрая задача: «на … меньше, чем»',text:'«Это на 7 <b>меньше, чем</b> у Миланы» — значит, у Миланы <b>больше</b>! Переверни: у Миланы <b>на 7 больше</b> → <b>сложение (+)</b>. Сначала всегда спроси: <b>у кого больше?</b>'},
  kNaM:{title:'Хитрая задача: «на … больше, чем»',text:'«Это на 7 <b>больше, чем</b> у брата» — значит, у брата <b>меньше</b>! Переверни: у брата <b>на 7 меньше</b> → <b>вычитание (−)</b>. Сначала всегда спроси: <b>у кого больше?</b>'},
  kVMul:{title:'Хитрая задача: «в … раз меньше, чем»',text:'«Это в 3 раза <b>меньше, чем</b> на второй стройке» — значит, на второй <b>больше</b>! Переверни: на второй <b>в 3 раза больше</b> → <b>умножение (·)</b>.'},
  kVDiv:{title:'Хитрая задача: «в … раз больше, чем»',text:'«Это в 3 раза <b>больше, чем</b> риса» — значит, риса <b>меньше</b>! Переверни: риса <b>в 3 раза меньше</b> → <b>деление (:)</b>.'},
  diff:{title:'На сколько больше (меньше)?',text:'Вопрос «<b>на сколько</b>?» — из <b>большего</b> числа вычитаем <b>меньшее (−)</b>.'},
  ratio:{title:'Во сколько раз больше (меньше)?',text:'Вопрос «<b>во сколько раз</b>?» — <b>большее делим на меньшее (:)</b>. Узнаём, сколько раз меньшее число помещается в большем.'},
  ok:{title:'К1 · К = ОК',text:'<b>К1</b> — сколько в одной (коробке, пачке, ведре). <b>К</b> — количество (сколько коробок). <b>ОК</b> — общее количество (всего). Ищем <b>ОК</b> — умножаем: <b>ОК = К1 · К</b>.'},
  k1:{title:'Ищем К1 — сколько в одной',text:'Знаем <b>ОК</b> (всего) и <b>К</b> (сколько коробок). Сколько в одной: <b>К1 = ОК : К</b>. Слово «<b>поровну</b>» — подсказка: делим.'},
  kk:{title:'Ищем К — сколько коробок',text:'Знаем <b>ОК</b> (всего) и <b>К1</b> (по сколько в одной). Сколько коробок: <b>К = ОК : К1</b>. Слова «<b>по 6 в каждой</b>» — это К1.'},
  c1:{title:'Задача в два действия',text:'Спрашивают «<b>сколько вместе</b>?», а второго числа мы не знаем. <b>1)</b> Сначала найди второе число («на … больше» — плюс). <b>2)</b> Потом сложи оба. На схеме скобка справа охватывает <b>оба</b> отрезка.'},
  c2:{title:'Задача в два действия',text:'Спрашивают «<b>сколько вместе</b>?», а второго числа мы не знаем. <b>1)</b> Сначала найди второе число («в … раз меньше» — делим). <b>2)</b> Потом сложи оба. Скобка справа — на <b>оба</b> отрезка.'},
  c3:{title:'Хитрая задача в два действия',text:'«Это на 7 меньше, чем у Миланы» — у Миланы <b>больше</b>. <b>1)</b> Найди, сколько у Миланы (+). <b>2)</b> Сложи обеих девочек. Скобка справа — на <b>оба</b> отрезка.'},
  c4:{title:'Задача в два действия',text:'<b>1)</b> Сначала найди второе число («в … раз больше» — умножаем). <b>2)</b> Вопрос «<b>на сколько больше</b>?» — из большего вычитаем меньшее.'}
};

/* ---------- сборка заданий ---------- */
const ITEMS=[];
TPL.forEach((tp,i)=>{ITEMS.push(Object.assign({},tp,{street:tp.st,id:tp.st+':'+i}));});
function makeInst(it){let o;do{o=(it.g||GEN[it.type])();}while(o.k1!==undefined&&o.k1===o.k);o.text=it.t(o);return o;}

/* верная схема и ловушки для каждого типа */
function schemesFor(it,o){
  let A=it.A?ini(it.A):'',B=it.B?ini(it.B):'';if(A&&A===B){A=it.A.slice(0,2)+'.';B=it.B.slice(0,2)+'.';}
  switch(it.type){
    case 'sum':return [SCH.sum(o.a,o.b,'?',o.a,o.b),SCH.sum(o.b,Math.max(6,o.a-o.b),o.a,o.b,'?')];
    case 'rest':return [SCH.sum(o.a,o.t-o.a,o.t,o.a,'?'),SCH.sum(o.t,o.a,'?',o.t,o.a)];
    case 'was':return [SCH.sum(o.a,o.b,'?',o.a,o.b),SCH.sum(o.b,Math.max(6,o.a-o.b),o.a,o.b,'?')];
    case 'naB':case 'kNaP':return [SCH.more(A,B,o.a,o.d,o.a,o.d,'?'),SCH.less(A,B,o.a,o.d,o.a,o.d,'?'),...(it.type==='naB'?[SCH.times(A,B,o.a,o.d,o.a,'?')]:[])];
    case 'naM':case 'kNaM':return [SCH.less(A,B,o.a,o.d,o.a,o.d,'?'),SCH.more(A,B,o.a,o.d,o.a,o.d,'?'),...(it.type==='naM'?[SCH.part(A,B,o.a,o.d,o.a,'?')]:[])];
    case 'vB':case 'kVMul':return [SCH.times(A,B,o.a,o.k,o.a,'?'),SCH.part(A,B,o.a,o.k,o.a,'?'),...(it.type==='vB'?[SCH.more(A,B,o.a,o.k,o.a,o.k,'?')]:[])];
    case 'vM':return [SCH.part(A,B,o.b,o.k,o.b,'?'),SCH.times(A,B,o.b,o.k,o.b,'?'),SCH.less(A,B,o.b,o.k,o.b,o.k,'?')];
    case 'kVDiv':return [SCH.part(A,B,o.a,o.k,o.a,'?'),SCH.times(A,B,o.a,o.k,o.a,'?')];
    case 'diff':case 'ratio':return []; /* в учебнике своей схемы нет — без схемы */
    case 'c1':case 'c3':{const m=SCH.more(A,B,o.a,o.d,o.a,o.d,'');return [SCH.both(m,'?'),SCH.more(A,B,o.a,o.d,o.a,o.d,'?'),SCH.both(SCH.less(A,B,o.a,o.d,o.a,o.d,''),'?')];}
    case 'c2':{const p=SCH.part(A,B,o.a,o.k,o.a,'');return [SCH.both(p,'?'),SCH.part(A,B,o.a,o.k,o.a,'?'),SCH.both(SCH.times(A,B,o.a,o.k,o.a,''),'?')];}
    case 'c4':{const t=SCH.times(A,B,o.a,o.k,o.a,'');t.down=[{r:1,a:1,b:o.k-1,t:'?'}];const w=SCH.times(A,B,o.a,o.k,o.a,'?');return [t,w,SCH.both(SCH.times(A,B,o.a,o.k,o.a,''),'?')];}
  }
  return [];
}
/* решение: [x, знак, y, ловушки] */
function solFor(it,o){
  switch(it.type){
    case 'sum':return [[o.a,'+',o.b,[MI]]];
    case 'rest':return [[o.t,MI,o.a,['+']]];
    case 'was':return [[o.a,'+',o.b,[MI,'swap']]];
    case 'naB':return [[o.a,'+',o.d,[MUL,MI]]];
    case 'naM':return [[o.a,MI,o.d,[DIV,'+']]];
    case 'vB':return [[o.a,MUL,o.k,['+',MI]]];
    case 'vM':return [[o.b,DIV,o.k,[MI,'+']]];
    case 'kNaP':return [[o.a,'+',o.d,[MI]]];
    case 'kNaM':return [[o.a,MI,o.d,['+']]];
    case 'kVMul':return [[o.a,MUL,o.k,[DIV,'+']]];
    case 'kVDiv':return [[o.a,DIV,o.k,[MUL]]];
    case 'diff':return [[o.big,MI,o.s,['+',DIV]]];
    case 'ratio':return [[o.big,DIV,o.s,[MI,'+']]];
    case 'ok':return [[o.k1,MUL,o.k,['+',MI,'swap']]];
    case 'k1':return [[o.okv,DIV,o.k,[MI,MUL]]];
    case 'kk':return [[o.okv,DIV,o.k1,[MI,MUL]]];
    case 'c1':case 'c3':return [[o.a,'+',o.d,[MI]],[o.a,'+',o.y,[MI,'swap']]];
    case 'c2':return [[o.a,DIV,o.k,[MI,MUL]],[o.a,'+',o.y,[MI]]];
    case 'c4':return [[o.a,MUL,o.k,['+']],[o.y,MI,o.a,['+']]];
  }
}
const KTYPES=['ok','k1','kk'];
/* таблица К1 · К = ОК */
function ktable(it,o,known){
  const v={k1:o.k1,k:o.k,ok:o.okv},unk=it.type==='ok'?'ok':it.type==='k1'?'k1':'k';
  const c=key=>known[key]?`<b>${v[key]}</b>`:(key===unk&&known.q?'<b class="q">?</b>':'');
  return `<table class="kt"><thead><tr><th><span>К1</span>${it.H[0]}</th><th><span>К</span>${it.H[1]}</th><th><span>ОК</span>${it.H[2]}</th></tr></thead><tbody><tr><td>${c('k1')}</td><td>${c('k')}</td><td>${c('ok')}</td></tr></tbody></table>`;
}
const ROLE_OPTS=['К1 — сколько в одной','К — сколько штук (количество)','ОК — сколько всего'];
function mainSpecs(it){
  const o=it.inst,sols=solFor(it,o),specs=[];
  if(KTYPES.includes(it.type)){
    const given=it.type==='ok'?[['k1',o.k1],['k',o.k]]:it.type==='k1'?[['ok',o.okv],['k',o.k]]:[['ok',o.okv],['k1',o.k1]];
    const role={k1:ROLE_OPTS[0],k:ROLE_OPTS[1],ok:ROLE_OPTS[2]};
    const known={};
    given.forEach(([key,val],gi)=>{
      const snap=Object.assign({},known);
      specs.push({ask:`Число <b class="big">${val}</b> — это что?`,show:ktable(it,o,snap),opts:ROLE_OPTS.slice(),ans:role[key],long:1});
      known[key]=1;
    });
    const kn=Object.assign({q:1},known);
    const F={ok:'ОК = К1 · К',k1:'К1 = ОК : К',kk:'К = ОК : К1'};
    const [x,op,y,tr]=sols[0];
    specs.push({ask:'Как найти «?»',show:ktable(it,o,kn),opts:exprOpts(x,y,op,tr).map(e=>'? = '+e),ans:'? = '+ex(x,op,y)});
    specs.push({ask:'Вычисли',show:ktable(it,o,kn)+`<p class="why">${F[it.type]}</p><p class="eq">? = ${ex(x,op,y)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x,op,y))});
    return specs;
  }
  if(it.q)specs.push({ask:it.q,show:'',opts:shuffle([it.A,it.B]),ans:it.type==='kNaP'||it.type==='kVMul'?it.B:it.A});
  const sch=schemesFor(it,o);
  if(sch.length){const cards=sch.map((d,j)=>({v:'s'+j,html:drawScheme(d)}));
  specs.push({ask:'Выбери схему к задаче',cards:shuffle(cards),ans:'s0'});}
  const right=sch.length?`<div class="mini">${drawScheme(sch[0])}</div>`:'';
  if(sols.length===1){
    const [x,op,y,tr]=sols[0];
    specs.push({ask:'Каким действием решаем?',show:right,opts:exprOpts(x,y,op,tr),ans:ex(x,op,y)});
    specs.push({ask:'Вычисли',show:right+`<p class="eq">${ex(x,op,y)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x,op,y))});
  }else{
    const [x1,o1,y1,t1]=sols[0],[x2,o2,y2,t2]=sols[1];
    specs.push({ask:`1) ${it.y}`,show:right,opts:exprOpts(x1,y1,o1,t1),ans:ex(x1,o1,y1)});
    specs.push({ask:'Вычисли первое действие',show:right+`<p class="eq">1) ${ex(x1,o1,y1)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x1,o1,y1))});
    specs.push({ask:`2) ${it.z}`,show:right+`<p class="eq">1) ${ex(x1,o1,y1)} = ${ev(x1,o1,y1)}</p>`,opts:exprOpts(x2,y2,o2,t2),ans:ex(x2,o2,y2)});
    specs.push({ask:'Вычисли второе действие',show:right+`<p class="eq">1) ${ex(x1,o1,y1)} = ${ev(x1,o1,y1)}<br>2) ${ex(x2,o2,y2)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x2,o2,y2))});
  }
  return specs;
}
function solved(it,o){
  o=o||it.inst;const sols=solFor(it,o);
  const lines=sols.map(([x,op,y],i)=>`${sols.length>1?(i+1)+') ':''}${ex(x,op,y)} = <b>${ev(x,op,y)}</b>`).join('<br>');
  const sc=schemesFor(it,o);const pic=KTYPES.includes(it.type)?ktable(it,o,{k1:1,k:1,ok:1}):sc.length?`<div class="mini">${drawScheme(sc[0])}</div>`:'';
  return `<p class="task sm">${o.text}</p>${pic}<p class="eq">${lines}</p><p class="why">Ответ: <b>${it.ans(o.x)}</b></p>`;
}
function taskView(it){return `<p class="task sm">${it.inst.text}</p>`}
function lessonHTML(it){
  const r=RULES[it.type];
  const same=ITEMS.filter(x=>x.type===it.type&&x.id!==it.id);
  const other=same.length?shuffle(same)[0]:it;
  const o=makeInst(other);
  return {title:r.title,text:r.text,ex:`<p class="sub">Смотри, как решается похожая задача</p><div class="ex">${solved(other,o)}</div>`};
}
function ruleFor(it){return RULES[it.type]}

/** всё нужное наружу — одним объектом с явными типами (внутри файла типизации нет) */
export const ZD = { STREETS, RULES, ITEMS, makeInst, mainSpecs, solved, drawScheme, SCH } as unknown as {
  STREETS: { id: string; name: string; sign: string; c: string; desc: string }[];
  RULES: Record<string, { title: string; text: string }>;
  ITEMS: { id: string; street: string; type: string; [k: string]: any }[];
  makeInst(it: object): { text: string; x: number; [k: string]: any };
  mainSpecs(it: object): { ask: string; show?: string; opts?: string[]; ans: string; long?: number; num?: boolean; cards?: { v: string; html: string }[] }[];
  solved(it: object, o?: object): string;
  drawScheme(d: object, opt?: object): string;
  SCH: Record<string, (...a: any[]) => object>;
};
