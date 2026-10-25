// @ts-nocheck — «Город Задач 4»: логика старой игры (public/legacy/4klass/zadachi/index.html) до движка, почти без правок.
// Задания, правила, шаги (mainSpecs), решённый вид (solved), урок (lessonHTML). Наружу — G (см. content/common/city-legacy.ts).
/* eslint-disable */
const S = { lv: {} };

const KEY='gorod-zadach4-v1';
const STAR='<svg class="star" viewBox="0 0 24 24"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6L2.5 9.3l6.6-.8z" fill="#FFD23F" stroke="#26224F" stroke-width="2" stroke-linejoin="round"/></svg>';
const CHECK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>';
const CLOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/></svg>';
const BOOK='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M3 5c3-1 6-1 9 1v14c-3-2-6-2-9-1zM21 5c-3-1-6-1-9 1v14c3-2 6-2 9-1z"/></svg>';
const LESSON_LOCK=15,PRIZE=100;
const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(p=>p[1]);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');

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


const CHEAT_CSS0=`.cheat{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:12px}
.cheat .cg{grid-column:1/-1;margin:10px 0 0;font-family:'Pangolin',cursive;font-weight:400;font-size:24px}
.cheat .algo{grid-column:1/-1;border:3px solid #26224F;border-radius:18px;background:#FFF1C2;padding:12px 16px}
.cheat .algo>b{font-family:'Pangolin',cursive;font-weight:400;font-size:24px}.cheat .algo ol{margin:6px 0 0;padding-left:22px;display:grid;gap:4px;font-size:16px}
.cc{border:3px solid #26224F;border-radius:18px;background:#FFFDF8;padding:12px 14px;display:grid;gap:6px;align-content:start;min-width:0;box-shadow:3px 3px 0 #26224F}
.cc.wide{grid-column:1/-1}
.cc .ct{font-family:'Pangolin',cursive;font-weight:400;font-size:22px;line-height:1.1}
.cc .cw{font-size:14px;color:#5B5785;font-weight:800}
.cc .cex{margin:0;font-size:15px}
.cc .ca{margin:0;font-weight:900;font-size:20px;color:#1F9D57;text-align:center}
.cc .cr{margin:0;font-size:14px;font-weight:800;background:#F1ECFF;border-radius:10px;padding:6px 10px}
.kt{border-collapse:collapse;margin:4px auto;font-size:15px;background:#fff;max-width:100%}
.kt th,.kt td{border:3px solid #26224F;padding:6px 10px;text-align:center;vertical-align:top}
.kt th{background:#F1ECFF;font-weight:800;font-size:13px;line-height:1.2;max-width:9em}
.kt th span{display:block;font-family:'Pangolin',cursive;font-size:24px;font-weight:400;color:#7A4FE0}
.kt td{font-size:26px;font-weight:900;height:52px;min-width:3.4em}
.kt .q{color:#E8452C}
.kf{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px}
.kf div{display:grid;gap:2px;border:2px dashed #5B5785;border-radius:12px;padding:8px 10px;background:#F7F4FF}
.kf b{font-size:20px}.kf span{font-size:14px}
.kw{border-collapse:collapse;width:100%;font-size:15px}
.kw th,.kw td{border-bottom:2px solid #D4D0EC;padding:6px 8px;text-align:left}
.kw td:last-child{font-size:30px;text-align:center;width:4.5em}.kw td.sm{font-size:15px}`;

/* ===== схема движения как в учебнике: отрезок, флажок, стрелки со скоростями, скобка с расстоянием ===== */
function drawMotion(d){
  const W=320,y=58,x1=18,x2=302,xm=(x1+x2)/2;
  const q=t=>/\?/.test(t)?'sq':'sl';
  const arrow=(xa,xb,yy)=>{const dir=xb>xa?1:-1;return `<line x1="${xa}" y1="${yy}" x2="${xb-dir*6}" y2="${yy}" class="ar"/><path d="M${xb} ${yy}l${-dir*10} -5v10z" class="ah"/>`;};
  const p=[];
  p.push(`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="sg"/>`);
  [x1,x1+(xm-x1)/2,xm,xm+(x2-xm)/2,x2].forEach(x=>p.push(`<circle cx="${x}" cy="${y}" r="3.6" class="dt"/>`));
  p.push(`<line x1="${xm}" y1="${y}" x2="${xm}" y2="${y-40}" class="pole"/><path d="M${xm} ${y-40}h22l-6 7 6 7h-22z" class="flag"/>`);
  if(d.kind==='meet'){
    p.push(arrow(x1+4,x1+96,y-18),arrow(x2-4,x2-96,y-18));
    p.push(`<text x="${x1+4}" y="${y-26}" class="${q(d.v1)}" text-anchor="start">${d.v1}</text><text x="${x2-4}" y="${y-26}" class="${q(d.v2)}" text-anchor="end">${d.v2}</text>`);
  }else{
    p.push(arrow(xm-6,xm-96,y-18),arrow(xm+30,xm+120,y-18));
    p.push(`<text x="${xm-10}" y="${y-26}" class="${q(d.v1)}" text-anchor="end">${d.v1}</text><text x="${xm+34}" y="${y-26}" class="${q(d.v2)}" text-anchor="start">${d.v2}</text>`);
  }
  if(d.s){
    const yb=y+6,ybb=y+13,yp=y+19;
    p.push(`<path d="M${x1} ${yb}Q${x1} ${ybb} ${x1+8} ${ybb}H${xm-8}Q${xm} ${ybb} ${xm} ${yp}Q${xm} ${ybb} ${xm+8} ${ybb}H${x2-8}Q${x2} ${ybb} ${x2} ${yb}" class="br${/\?/.test(d.s)?' bq':''}"/>`);
    p.push(`<text x="${xm}" y="${y+40}" text-anchor="middle" class="${q(d.s)}">${d.s}</text>`);
  }
  return `<svg class="scheme" viewBox="0 0 ${W} ${y+48}" width="${W}" height="${y+48}" role="img" aria-label="схема движения">${p.join('')}</svg>`;
}
const MOTION_CSS=`.scheme .ar{stroke:#2D6CDF;stroke-width:2.5}.scheme .ah{fill:#2D6CDF}.scheme .pole{stroke:#26224F;stroke-width:2}.scheme .flag{fill:#E8452C}`;

/* ===== шпаргалка 4 класса ===== */
const CHEAT=[
  {g:'Движение: скорость, время, расстояние'},
  {t:'Найти расстояние',w:'расстояние = скорость · время',ex:'Велосипедист ехал 3 ч со скоростью 15 км/ч. Какое расстояние он проехал?',a:'15 · 3 = 45 (км)',r:'Скорость — сколько проходят за 1 час (минуту, секунду)'},
  {t:'Найти скорость',w:'скорость = расстояние : время',ex:'За 4 ч поезд прошёл 320 км. С какой скоростью шёл поезд?',a:'320 : 4 = 80 (км/ч)',r:'Расстояние делим на время'},
  {t:'Найти время',w:'время = расстояние : скорость',ex:'Улитка ползёт со скоростью 5 м/мин. За сколько минут она проползёт 35 м?',a:'35 : 5 = 7 (мин)',r:'Расстояние делим на скорость'},
  {g:'Два участника движения'},
  {t:'Навстречу друг другу',w:'скорость сближения = скорость 1 + скорость 2',ex:'Расстояние 20 км. Туристы вышли навстречу друг другу: 6 км/ч и 4 км/ч. Через какое время встретятся?',m:{kind:'meet',v1:'6 км/ч',v2:'4 км/ч',s:'20 км'},a:'1) 6 + 4 = 10 (км/ч)<br>2) 20 : 10 = 2 (ч)',r:'Каждый час расстояние между ними уменьшается на скорость сближения'},
  {t:'В противоположных направлениях',w:'скорость удаления = скорость 1 + скорость 2',ex:'Два катера отошли от причала в разные стороны: 30 км/ч и 40 км/ч. Когда между ними будет 140 км?',m:{kind:'away',v1:'30 км/ч',v2:'40 км/ч',s:'140 км'},a:'1) 30 + 40 = 70 (км/ч)<br>2) 140 : 70 = 2 (ч)',r:'Каждый час расстояние между ними увеличивается на скорость удаления'},
  {t:'Найти скорость второго',w:'сначала общая скорость, потом минус известная',ex:'Через 2 ч между ними 100 км. Скорость трактора 30 км/ч. Скорость погрузчика?',m:{kind:'away',v1:'? км/ч',v2:'30 км/ч',s:'100 км'},a:'1) 100 : 2 = 50 (км/ч)<br>2) 50 − 30 = 20 (км/ч)',r:'Общая скорость = расстояние : время'},
  {g:'Покупки и работа'},
  {t:'Цена · Количество = Стоимость',w:'цена — сколько стоит одна вещь',ex:'Купили 4 тетради по 3 р. Сколько заплатили?',a:'3 · 4 = 12 (р.)',r:'Цена = стоимость : количество. Количество = стоимость : цена'},
  {t:'Сначала узнай, сколько на одного',w:'«одинаковые», «такие же», «с той же скоростью»',ex:'За 3 одинаковых стула заплатили 240 р. Сколько стоят 6 таких стульев?',s:{rows:[{segs:[{v:1},{v:1},{v:1}]},{segs:[{v:1},{v:1},{v:1},{v:1},{v:1},{v:1}]}],up:[{r:0,a:0,b:2,t:'240'}],down:[{r:1,a:0,b:5,t:'?'}]},a:'1) 240 : 3 = 80 (р.)<br>2) 80 · 6 = 480 (р.)',r:'1) Цена одного: стоимость делим на количество. 2) Умножаем на новое количество'},
  {g:'Доли'},
  {t:'Найти часть числа',w:'¼ от 20 — разделить на 4',ex:'В классе 28 учеников, ¼ часть — отличники. Сколько отличников?',s:{rows:[{segs:[{v:1},{v:1},{v:1},{v:1}]}],up:[{r:0,a:0,b:3,t:'28'}],down:[{r:0,a:0,b:0,t:'?'}]},a:'28 : 4 = 7',r:'Число делим на количество частей (число под чертой)'},
  {t:'Найти число по его части',w:'⅛ часть равна 8 — умножить на 8',ex:'⅛ часть массы равна 8 кг. Найди всю массу.',s:{rows:[{segs:Array.from({length:8},()=>({v:1}))}],up:[{r:0,a:0,b:0,t:'8'}],down:[{r:0,a:0,b:7,t:'?'}]},a:'8 · 8 = 64 (кг)',r:'Часть умножаем на количество частей'}
,
  {g:'Площадь, периметр, время, числа'},
  {t:'Площадь и периметр',w:'S = a · b, P = (a + b) · 2',ex:'Длина 9 см, ширина 4 см.',a:'S = 9 · 4 = 36 (см²)<br>P = (9 + 4) · 2 = 26 (см)',r:'Сторона = S : другая сторона. Квадрат: P = a · 4, S = a · a'},
  {t:'Сложение времени',w:'60 мин = 1 ч',ex:'Отошла в 10 ч 45 мин, ехала 32 мин. Когда прибыла?',a:'45 + 32 = 77 мин = 1 ч 17 мин<br>→ 11 ч 17 мин',r:'Если минут 60 и больше — отдай 60 мин в часы'},
  {t:'Сколько всего сотен?',w:'закрой две последние цифры',ex:'Сколько всего сотен в числе 4 827?',a:'48 сотен',r:'Всего десятков — закрой одну цифру, всего тысяч — три'}
];
function cheatHTML(){
  return `<div class="cheat">
  <div class="algo"><b>Как решать задачу</b><ol>
    <li>Прочитай задачу <b>два раза</b>. Что <b>известно</b>? Что надо <b>найти</b>?</li>
    <li>Найди «волшебные слова»: <b>навстречу</b>, <b>в противоположных направлениях</b>, <b>по … в каждом</b>, <b>одинаковые</b>, <b>часть</b>.</li>
    <li>Нарисуй схему или таблицу. «?» — то, что ищем.</li>
    <li>Подумай: что надо узнать <b>сначала</b>, чтобы ответить на вопрос?</li>
    <li>Реши по действиям, напиши <b>ответ</b> с единицами (км, ч, р.).</li>
  </ol></div>
  ${CHEAT.map(c=>c.g?`<h3 class="cg">${c.g}</h3>`:`<div class="cc"><b class="ct">${c.t}</b><span class="cw">${c.w}</span><p class="cex">${c.ex}</p>${c.m?drawMotion(c.m):c.s?drawScheme(c.s):''}<p class="ca">${c.a}</p><p class="cr">${c.r}</p></div>`).join('')}
  <h3 class="cg">Уравнения: как найти неизвестное</h3>
  <div class="cc wide"><table class="kw"><tr><th>Что неизвестно</th><th>Как найти</th></tr>
    <tr><td>слагаемое: <b>x + 25 = 40</b></td><td class="sm">сумма − другое слагаемое</td></tr>
    <tr><td>уменьшаемое: <b>x − 25 = 40</b></td><td class="sm">разность + вычитаемое</td></tr>
    <tr><td>вычитаемое: <b>65 − x = 40</b></td><td class="sm">уменьшаемое − разность</td></tr>
    <tr><td>множитель: <b>x · 90 = 720</b></td><td class="sm">произведение : другой множитель</td></tr>
    <tr><td>делимое: <b>x : 80 = 6</b></td><td class="sm">частное · делитель</td></tr>
    <tr><td>делитель: <b>960 : x = 32</b></td><td class="sm">делимое : частное</td></tr></table></div>
  <h3 class="cg">Единицы величин</h3>
  <div class="cc wide"><table class="kw">
    <tr><th>Длина</th><th>Масса</th><th>Площадь</th><th>Время</th></tr>
    <tr><td>1 км = 1000 м<br>1 м = 10 дм = 100 см<br>1 дм = 10 см<br>1 см = 10 мм</td><td>1 т = 10 ц = 1000 кг<br>1 ц = 100 кг<br>1 кг = 1000 г</td><td>1 м² = 100 дм²<br>1 дм² = 100 см²<br>1 а = 100 м²<br>1 га = 100 а</td><td>1 сут. = 24 ч<br>1 ч = 60 мин<br>1 мин = 60 с</td></tr></table></div>
  </div>`;
}

const CHEAT_CSS=CHEAT_CSS0+MOTION_CSS+".kw th{white-space:nowrap}.kw td{vertical-align:top}.kw td:last-child{font-size:15px;width:auto;text-align:left}.kt{width:100%;table-layout:fixed}.kt th span{font-size:17px;overflow-wrap:anywhere;hyphens:auto}.kt th{font-size:12px;padding:6px 4px}";

/* =================== ЗАДАЧИ 4 КЛАСС ===================
   По учебнику «Математика, 4 класс, часть 1» (Муравьёва, Урбан): движение (навстречу, в противоположных
   направлениях), цена — количество — стоимость, приведение к единице, доли, уравнения, единицы величин.
   Числа каждый раз новые. */
var EXTRA={};
const rnd=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pickA=a=>a[Math.floor(Math.random()*a.length)];
const MI='−',MUL='·',DIV=':';
const ev=(x,op,y)=>op==='+'?x+y:op===MI?x-y:op===MUL?x*y:x/y;
const ex=(x,op,y)=>`${x} ${op} ${y}`;
const okOp=(x,op,y)=>op==='+'?true:op===MI?x>y:op===MUL?true:(y>1&&x%y===0);
function exprOpts(x,y,op,traps,pre){
  pre=pre||'';const list=[ex(x,op,y)];
  traps.forEach(t=>{const [a,o,b]=t==='swap'?[y,MI,x]:[x,t,y];if(list.length<3&&okOp(a,o,b)&&!list.includes(ex(a,o,b)))list.push(ex(a,o,b));});
  if(list.length<2)list.push(ex(x,'+',y)===list[0]?ex(x,MUL,y):ex(x,'+',y));
  return shuffle(list).map(s=>pre+s);
}
const W={
  km:['километр','километра','километров'],m:['метр','метра','метров'],h:['час','часа','часов'],min:['минута','минуты','минут'],minA:['минуту','минуты','минут'],
  s:['секунда','секунды','секунд'],r:['рубль','рубля','рублей'],nb:['тетрадь','тетради','тетрадей'],pen:['ручка','ручки','ручек'],penA:['ручку','ручки','ручек'],
  chair:['стул','стула','стульев'],kg:['килограмм','килограмма','килограммов'],g:['грамм','грамма','граммов'],det:['деталь','детали','деталей'],detA:['деталь','детали','деталей'],
  day:['день','дня','дней'],pupil:['ученик','ученика','учеников'],page:['страница','страницы','страниц'],pageA:['страницу','страницы','страниц'],
  block:['блок','блока','блоков'],suit:['костюм','костюма','костюмов'],pie:['пирог','пирога','пирогов'],book:['книга','книги','книг'],bookA:['книгу','книги','книг']
};
const n_=(n,w)=>nf(n,W[w]);

/* ---------- 1. таблица из трёх величин: A · B = C ---------- */
/* role: какое число что означает; unk: какую клетку ищем (0,1,2) */
const TRI=[
  /* движение одного */
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['км/ч','ч','км'],unk:2,g:()=>({a:rnd(8,12),b:rnd(1,3)}),t:o=>`Луна бежала рядом с велосипедом ${n_(o.b,'h')} со скоростью ${o.a} км/ч. Какое расстояние она пробежала?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['км/ч','ч','км'],unk:2,g:()=>({a:rnd(6,9)*10,b:rnd(2,6)}),t:o=>`В Роблоксе поезд ехал ${n_(o.b,'h')} со скоростью ${o.a} км/ч. Какое расстояние он проехал?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['м/мин','мин','м'],unk:2,g:()=>({a:rnd(4,9),b:rnd(3,9)}),t:o=>`Луна учуяла запах еды и крадётся на кухню со скоростью ${o.a} м/мин. Какое расстояние она проползёт за ${n_(o.b,'minA')}?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['км/ч','ч','км'],unk:0,g:()=>({a:rnd(6,9)*10,b:rnd(2,6)}),t:o=>`За ${n_(o.b,'h')} поезд в Роблоксе проехал ${n_(o.a*o.b,'km')}. С какой скоростью он ехал?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['км/ч','ч','км'],unk:0,g:()=>({a:rnd(5,8),b:rnd(2,3)}),t:o=>`За ${n_(o.b,'h')} прогулки Луна набегала ${n_(o.a*o.b,'km')}, носясь по парку. С какой скоростью она бегала?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['м/с','с','м'],unk:0,g:()=>({a:rnd(3,6),b:rnd(3,6)}),t:o=>`Позвонил курьер с едой! Луна неслась к двери ${n_(o.b,'s')} и пробежала ${n_(o.a*o.b,'m')}. С какой скоростью бежала Луна?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['м/мин','мин','м'],unk:1,g:()=>({a:rnd(3,9),b:rnd(4,9)}),t:o=>`Зомби в Майнкрафте идёт со скоростью ${o.a} м/мин. За сколько минут он дойдёт до дома Стива, если до него ${n_(o.a*o.b,'m')}?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['км/ч','ч','км'],unk:1,g:()=>({a:rnd(20,35)*10,b:rnd(2,5)}),t:o=>`В Роблоксе в игре Brookhaven вертолёт летит со скоростью ${o.a} км/ч. За сколько часов он пролетит ${n_(o.a*o.b,'km')}?`},
  {st:'mv',kind:'mv',H:['Скорость','Время','Расстояние'],U:['м/с','с','м'],unk:1,g:()=>({a:rnd(4,8),b:rnd(3,8)}),t:o=>`Луна бежит за мячиком со скоростью ${o.a} м/с. За сколько секунд она добежит до мячика, если до него ${n_(o.a*o.b,'m')}?`},
  /* цена — количество — стоимость */
  {st:'price',kind:'pr',H:['Цена','Количество','Стоимость'],U:['р.','шт.','р.'],unk:2,g:()=>({a:rnd(2,9),b:rnd(3,9)}),t:o=>`Купили ${o.b} ${plural(o.b,'слайм','слайма','слаймов')} по ${o.a} р. Сколько заплатили за покупку?`},
  {st:'price',kind:'pr',H:['Цена','Количество','Стоимость'],U:['R$','шт.','R$'],unk:2,g:()=>({a:rnd(12,40),b:rnd(2,5)}),t:o=>`В Роблоксе купили ${o.b} ${plural(o.b,'скин','скина','скинов')} по ${o.a} робуксов. Сколько робуксов потратили?`},
  {st:'price',kind:'pr',H:['Цена','Количество','Стоимость'],U:['р.','шт.','р.'],unk:0,g:()=>({a:rnd(3,9),b:rnd(3,9)}),t:o=>`За ${o.b} ${plural(o.b,'одинаковый попит','одинаковых попита','одинаковых попитов')} заплатили ${n_(o.a*o.b,'r')}. Сколько стоит один попит?`},
  {st:'price',kind:'pr',H:['Цена','Количество','Стоимость'],U:['р.','шт.','р.'],unk:0,g:()=>({a:rnd(4,9),b:rnd(2,6)}),t:o=>`${o.b} ${plural(o.b,'одинаковый пакет','одинаковых пакета','одинаковых пакетов')} корма без курицы для Луны стоят ${n_(o.a*o.b,'r')}. Сколько стоит один пакет?`},
  {st:'price',kind:'pr',H:['Цена','Количество','Стоимость'],U:['р.','шт.','р.'],unk:1,g:()=>({a:rnd(3,9),b:rnd(3,9)}),t:o=>`Брелок с Лабубу стоит ${n_(o.a,'r')}. Сколько брелоков можно купить на ${n_(o.a*o.b,'r')}?`},
  {st:'price',kind:'pr',H:['Цена','Количество','Стоимость'],U:['р.','шт.','р.'],unk:1,g:()=>({a:rnd(2,6),b:rnd(3,9)}),t:o=>`Наклейка с Майнкрафтом стоит ${n_(o.a,'r')}. Сколько наклеек купили, если заплатили ${n_(o.a*o.b,'r')}?`},
  /* работа */
  {st:'price',kind:'wk',H:['За 1 день','Время','Всего'],U:['м','дн.','м'],unk:0,g:()=>({a:rnd(3,9)*10,b:rnd(2,6)}),t:o=>`В Роблоксе команда за ${n_(o.b,'day')} построила ${o.a*o.b} м дороги, поровну каждый день. Сколько метров строили за один день?`},
  {st:'price',kind:'wk',H:['За 1 час','Время','Всего'],U:['шт.','ч','шт.'],unk:2,g:()=>({a:rnd(6,15),b:rnd(3,8)}),t:o=>`Мастерская делает ${o.a} ${plural(o.a,'слайм','слайма','слаймов')} в час. Сколько слаймов сделают за ${n_(o.b,'h')}?`},
  {st:'price',kind:'wk',H:['За 1 час','Время','Всего'],U:['бл.','ч','бл.'],unk:1,g:()=>({a:rnd(12,30),b:rnd(2,6)}),t:o=>`Стив ставит ${n_(o.a,'block')} в час. За сколько часов он поставит ${n_(o.a*o.b,'block')}?`}
];
const TRI_RULE={
  mv:{title:'Скорость, время, расстояние',text:'<b>Скорость</b> — сколько проходят за 1 единицу времени (за 1 ч, 1 мин, 1 с). <b>Расстояние = скорость · время</b>. <b>Скорость = расстояние : время</b>. <b>Время = расстояние : скорость</b>.'},
  pr:{title:'Цена, количество, стоимость',text:'<b>Цена</b> — сколько стоит одна вещь. <b>Стоимость = цена · количество</b>. <b>Цена = стоимость : количество</b>. <b>Количество = стоимость : цена</b>.'},
  wk:{title:'Работа: за 1 час, время, всего',text:'Сколько сделано <b>за 1 час (день)</b> — как цена или скорость. <b>Всего = за 1 час · время</b>. <b>За 1 час = всего : время</b>. <b>Время = всего : за 1 час</b>.'}
};

/* ---------- 2. движение двоих ---------- */
const DUO=[
  {st:'meet',type:'meT',A:'туристы',u:['м/мин','мин','м'],g:()=>({v1:rnd(6,9)*10,v2:rnd(5,8)*10,t:rnd(3,8)}),t:o=>`Расстояние между двумя подъездами — ${n_(o.s,'m')}. Хозяйка с Луной и соседка с собакой одновременно вышли навстречу друг другу со скоростями ${o.v1} м/мин и ${o.v2} м/мин. Через сколько минут они встретятся?`},
  {st:'meet',type:'meT',u:['км/ч','ч','км'],g:()=>({v1:rnd(7,9)*10,v2:rnd(6,9)*10,t:rnd(2,6)}),t:o=>`В Роблоксе расстояние между городами — ${n_(o.s,'km')}. Навстречу друг другу одновременно выехали две машины со скоростями ${o.v1} км/ч и ${o.v2} км/ч. Через сколько часов машины встретятся?`},
  {st:'meet',type:'meS',u:['м/с','с','м'],g:()=>({v1:rnd(2,5),v2:rnd(2,5),t:rnd(4,9)}),t:o=>`Луна и соседский пёс увидели друг друга и одновременно побежали навстречу со скоростями ${o.v1} м/с и ${o.v2} м/с. Они встретились через ${n_(o.t,'s')}. Какое расстояние было между собаками?`},
  {st:'meet',type:'meS',u:['км/ч','ч','км'],g:()=>({v1:rnd(8,9)*10,v2:rnd(6,9)*10,t:rnd(2,5)}),t:o=>`В Роблоксе из двух городов навстречу друг другу одновременно выехали два поезда со скоростями ${o.v1} км/ч и ${o.v2} км/ч. Через ${n_(o.t,'h')} они встретились. Найди расстояние между городами.`},
  {st:'meet',type:'meV',u:['км/ч','ч','км'],g:()=>({v1:rnd(12,18),v2:rnd(12,18),t:rnd(2,4)}),t:o=>`Два блогера выехали на велосипедах навстречу друг другу, чтобы снять общий тикток. Расстояние между их посёлками — ${n_(o.s,'km')}, встретились они через ${n_(o.t,'h')}. Скорость второго — ${o.v2} км/ч. Найди скорость первого.`},
  {st:'meet',type:'meV',u:['м/с','с','м'],g:()=>({v1:rnd(3,7),v2:rnd(3,7),t:rnd(5,9)}),t:o=>`Луна и щенок выбежали навстречу друг другу, расстояние между ними было ${n_(o.s,'m')}. Они встретились через ${n_(o.t,'s')}. Скорость щенка — ${o.v2} м/с. Найди скорость Луны.`},
  {st:'away',type:'awT',u:['км/ч','ч','км'],g:()=>({v1:rnd(3,5)*10,v2:rnd(3,6)*10,t:rnd(2,5)}),t:o=>`В Роблоксе два катера одновременно отошли от причала в противоположных направлениях. Скорость первого — ${o.v1} км/ч, второго — ${o.v2} км/ч. Через сколько часов между ними будет ${n_(o.s,'km')}?`},
  {st:'away',type:'awT',u:['км/ч','ч','км'],g:()=>({v1:rnd(13,17),v2:rnd(13,19),t:rnd(2,4)}),t:o=>`Два лыжника одновременно вышли из одного посёлка в противоположных направлениях со скоростями ${o.v1} км/ч и ${o.v2} км/ч. Через сколько часов расстояние между ними станет ${n_(o.s,'km')}?`},
  {st:'away',type:'awS',u:['м/мин','мин','м'],g:()=>({v1:rnd(6,9)*10,v2:rnd(6,10)*10,t:rnd(3,8)}),t:o=>`Стив и Алекс одновременно вышли из одной шахты в противоположных направлениях со скоростями ${o.v1} м/мин и ${o.v2} м/мин. Какое расстояние будет между ними через ${n_(o.t,'minA')}?`},
  {st:'away',type:'awS',u:['см/мин','мин','см'],g:()=>({v1:rnd(3,6),v2:rnd(3,6),t:rnd(5,9)}),t:o=>`Две улитки одновременно поползли от ромашки в противоположных направлениях со скоростями ${o.v1} см/мин и ${o.v2} см/мин. Какое расстояние будет между ними через ${o.t} мин?`},
  {st:'away',type:'awV',u:['км/ч','ч','км'],g:()=>({v1:rnd(2,4)*10,v2:rnd(3,4)*10,t:rnd(2,4)}),t:o=>`В Роблоксе на ферме погрузчик и трактор одновременно выехали из амбара в противоположных направлениях. Через ${n_(o.t,'h')} расстояние между ними стало ${n_(o.s,'km')}. Скорость трактора — ${o.v2} км/ч. Найди скорость погрузчика.`},
  {st:'away',type:'awV',u:['м/мин','мин','м'],g:()=>({v1:rnd(5,9)*10,v2:rnd(5,9)*10,t:rnd(3,6)}),t:o=>`Луна и соседский пёс подрались за косточку и разбежались в противоположные стороны. Через ${o.t} мин расстояние между ними стало ${n_(o.s,'m')}. Пёс бежал со скоростью ${o.v2} м/мин. Найди скорость Луны.`}
];
const DUO_RULE={
  meet:{title:'Движение навстречу',text:'Двое идут <b>навстречу</b> — расстояние между ними каждый час <b>уменьшается</b> на <b>скорость сближения</b> = скорость первого + скорость второго. <b>Время встречи = расстояние : скорость сближения</b>. <b>Расстояние = скорость сближения · время</b>. Скорость одного: сначала <b>расстояние : время</b> (скорость сближения), потом <b>минус скорость другого</b>.'},
  away:{title:'Движение в противоположных направлениях',text:'Двое уходят <b>в разные стороны</b> — расстояние каждый час <b>увеличивается</b> на <b>скорость удаления</b> = скорость первого + скорость второго. <b>Время = расстояние : скорость удаления</b>. <b>Расстояние = скорость удаления · время</b>. Скорость одного: сначала <b>расстояние : время</b>, потом <b>минус скорость другого</b>.'}
};

/* ---------- 3. сначала узнай, сколько на одного ---------- */
const UNIT=[
  {st:'unit',type:'u1',g:()=>{const n1=rnd(2,5),p=rnd(3,9)*10;let n2=rnd(2,9);if(n2===n1)n2=n1+1;return {n1,p,n2};},t:o=>`За ${o.n1} одинаковых ${plural(o.n1,'брелок','брелока','брелоков')} с Лабубу заплатили ${n_(o.n1*o.p,'r')}. Сколько стоят ${o.n2} таких ${plural(o.n2,'брелока','брелока','брелоков')}?`,ans:x=>n_(x,'r'),q1:'Сколько стоит один брелок?',q2:o=>`Сколько стоят ${o.n2} ${plural(o.n2,'брелока','брелока','брелоков')}?`},
  {st:'unit',type:'u1',g:()=>{const n1=rnd(2,5),p=rnd(2,6)*10;let n2=rnd(2,9);if(n2===n1)n2=n1+1;return {n1,p,n2};},t:o=>`На ${o.n1} ${plural(o.n1,'одинаковое печенье','одинаковых печенья','одинаковых печений')} для Луны пошло ${n_(o.n1*o.p,'g')} творога. Сколько граммов творога нужно на ${o.n2} ${plural(o.n2,'такое печенье','таких печенья','таких печений')}?`,ans:x=>n_(x,'g'),q1:'Сколько творога на одно печенье?',q2:o=>`Сколько творога на ${o.n2} ${plural(o.n2,'печенье','печенья','печений')}?`},
  {st:'unit',type:'u1',g:()=>{const n1=rnd(2,5),p=rnd(6,9)*10;let n2=rnd(2,9);if(n2===n1)n2=n1+1;return {n1,p,n2};},t:o=>`За ${n_(o.n1,'h')} машина проехала ${n_(o.n1*o.p,'km')}. Сколько километров она проедет за ${n_(o.n2,'h')}, двигаясь с той же скоростью?`,ans:x=>n_(x,'km'),q1:'Сколько км за 1 час (скорость)?',q2:o=>`Сколько км за ${n_(o.n2,'h')}?`},
  {st:'unit',type:'u1',g:()=>{const n1=rnd(2,5),p=rnd(3,9);let n2=rnd(2,9);if(n2===n1)n2=n1+1;return {n1,p,n2};},t:o=>`В ${o.n1} одинаковых сундуках у Стива ${o.n1*o.p} ${plural(o.n1*o.p,'алмаз','алмаза','алмазов')}. Сколько алмазов в ${o.n2} таких сундуках?`,ans:x=>x+' '+plural(x,'алмаз','алмаза','алмазов'),q1:'Сколько алмазов в одном сундуке?',q2:o=>`Сколько алмазов в ${o.n2} сундуках?`},
  {st:'unit',type:'u2',g:()=>{const n1=rnd(2,8),p=rnd(1,2);let n2=rnd(2,9);if(n2===n1)n2=n1+1;return {n1,p,n2};},t:o=>`Голой собаке зимой холодно! Из ${o.n1*o.p} ${plural(o.n1*o.p,'метра','метров','метров')} флиса сшили ${o.n1} ${plural(o.n1,'курточку','курточки','курточек')} для Луны. Сколько таких курточек можно сшить из ${o.n2*o.p} ${plural(o.n2*o.p,'метра','метров','метров')}?`,ans:x=>x+' '+plural(x,'курточка','курточки','курточек'),q1:'Сколько метров флиса на одну курточку?',q2:o=>'Сколько курточек можно сшить?'},
  {st:'unit',type:'u2',g:()=>{const n1=rnd(2,6),p=rnd(4,9)*10;let n2=rnd(2,9);if(n2===n1)n2=n1+1;return {n1,p,n2};},t:o=>`За ${o.n1} ${plural(o.n1,'одинаковый набор','одинаковых набора','одинаковых наборов')} слаймов заплатили ${n_(o.n1*o.p,'r')}. Сколько таких наборов можно купить на ${n_(o.n2*o.p,'r')}?`,ans:x=>x+' '+plural(x,'набор','набора','наборов'),q1:'Сколько стоит один набор?',q2:o=>'Сколько наборов можно купить?'}
];
/* ---------- 4. доли ---------- */
const FR=n=>`<span class="fr"><sup>1</sup>⁄<sub>${n}</sub></span>`;
const PART=[
  {st:'part',type:'dP',g:()=>{const n=pickA([2,3,4,5]),k=rnd(4,9);return {n,k,A:n*k};},t:o=>`В классе ${n_(o.A,'pupil')}. ${FR(o.n)} часть учеников играет в Роблокс каждый день. Сколько это учеников?`,ans:x=>n_(x,'pupil')},
  {st:'part',type:'dP',g:()=>{const n=pickA([2,4,5,8]),k=rnd(3,9);return {n,k,A:n*k};},t:o=>`Луна выпросила у гостей ${o.A} ${plural(o.A,'кусочек','кусочка','кусочков')} сыра и съела ${FR(o.n)} часть сразу. Сколько кусочков она съела сразу?`,ans:x=>x+' '+plural(x,'кусочек','кусочка','кусочков')},
  {st:'part',type:'dP',g:()=>{const n=pickA([3,4,6,8]),k=rnd(2,9)*10;return {n,k,A:n*k};},t:o=>`Длина забора в Майнкрафте — ${n_(o.A,'m')}. Стив покрасил ${FR(o.n)} часть забора. Сколько метров покрасил Стив?`,ans:x=>n_(x,'m')},
  {st:'part',type:'dW',g:()=>{const n=pickA([2,3,4,5,8]),k=rnd(3,9);return {n,k,A:n*k};},t:o=>`${FR(o.n)} часть массы равна ${o.k} кг. Найди всю массу.`,ans:x=>x+' кг'},
  {st:'part',type:'dW',g:()=>{const n=pickA([3,4,5,6]),k=rnd(6,15);return {n,k,A:n*k};},t:o=>`Милана посмотрела ${o.k} видео в тиктоке, это ${FR(o.n)} часть плейлиста. Сколько видео в плейлисте?`,ans:x=>x+' видео'},
  {st:'part',type:'dW',g:()=>{const n=pickA([2,3,4,5]),k=rnd(2,9)*10;return {n,k,A:n*k};},t:o=>`Стив прошёл ${n_(o.k,'m')}, это ${FR(o.n)} часть пути до деревни. Какова длина всего пути?`,ans:x=>n_(x,'m')}
];
/* ---------- 5. уравнения ---------- */
const EQ_NAME={sl:'неизвестное слагаемое',um:'неизвестное уменьшаемое',vy:'неизвестное вычитаемое',mn:'неизвестный множитель',de:'неизвестное делимое',dl:'неизвестный делитель'};
const EQ_RULE={sl:'Чтобы найти <b>неизвестное слагаемое</b>, надо из <b>суммы</b> вычесть <b>известное слагаемое</b>.',um:'Чтобы найти <b>неизвестное уменьшаемое</b>, надо к <b>разности</b> прибавить <b>вычитаемое</b>.',
 vy:'Чтобы найти <b>неизвестное вычитаемое</b>, надо из <b>уменьшаемого</b> вычесть <b>разность</b>.',mn:'Чтобы найти <b>неизвестный множитель</b>, надо <b>произведение</b> разделить на <b>известный множитель</b>.',
 de:'Чтобы найти <b>неизвестное делимое</b>, надо <b>частное</b> умножить на <b>делитель</b>.',dl:'Чтобы найти <b>неизвестный делитель</b>, надо <b>делимое</b> разделить на <b>частное</b>.'};
const EQS=[
  {k:'sl',g:()=>{const x=rnd(120,890),a=rnd(110,900);return {eq:`x + ${a} = ${x+a}`,x,sol:[x+a,MI,a,['+']]};}},
  {k:'sl',g:()=>{const x=rnd(120,890),a=rnd(110,900);return {eq:`${a} + x = ${x+a}`,x,sol:[x+a,MI,a,['+']]};}},
  {k:'um',g:()=>{const r=rnd(120,700),a=rnd(110,280);return {eq:`x − ${a} = ${r}`,x:r+a,sol:[r,'+',a,[MI]]};}},
  {k:'vy',g:()=>{const x=rnd(110,400),r=rnd(120,500);return {eq:`${x+r} − x = ${r}`,x,sol:[x+r,MI,r,['+']]};}},
  {k:'mn',g:()=>{const x=rnd(2,9),a=rnd(2,9)*10;return {eq:`x · ${a} = ${x*a}`,x,sol:[x*a,DIV,a,[MUL,MI]]};}},
  {k:'mn',g:()=>{const x=rnd(2,9)*10,a=rnd(2,9);return {eq:`${a} · x = ${x*a}`,x,sol:[x*a,DIV,a,[MUL,MI]]};}},
  {k:'de',g:()=>{const q=rnd(2,9),a=rnd(2,9)*10;return {eq:`x : ${a} = ${q}`,x:q*a,sol:[q,MUL,a,[DIV,'+']]};}},
  {k:'dl',g:()=>{const x=rnd(2,9)*10,q=rnd(2,9);return {eq:`${x*q} : x = ${q}`,x,sol:[x*q,DIV,q,[MUL,MI]]};}}
];
/* ---------- 6. единицы величин ---------- */
const CONV=[['м','дм',10],['м','см',100],['дм','см',10],['км','м',1000],['см','мм',10],['т','кг',1000],['т','ц',10],['ц','кг',100],['кг','г',1000],
 ['м²','дм²',100],['дм²','см²',100],['га','а',100],['а','м²',100],['ч','мин',60],['мин','с',60],['сут.','ч',24]];
const FACT_OPTS=[10,100,1000,60,24];

const STREETS=[
  {id:'mv',name:'Скорость, время, расстояние',sign:'v · t',c:'#2D6CDF',desc:'Таблица: что дано, что найти. Расстояние = скорость · время.'},
  {id:'meet',name:'Навстречу друг другу',sign:'→ ←',c:'#13A3A0',desc:'Скорость сближения. Время встречи.'},
  {id:'away',name:'В противоположных направлениях',sign:'← →',c:'#7A4FE0',desc:'Скорость удаления. Расстояние между ними.'},
  {id:'price',name:'Цена и работа',sign:'Таблица',c:'#3D8B3A',desc:'Цена · количество = стоимость. За 1 час · время = всего.'},
  {id:'unit',name:'Сначала на одного',sign:'1, 2',c:'#FF8A1C',desc:'За 3 стула 240 р. — сколько за 6?'},
  {id:'part',name:'Доли',sign:'¼',c:'#B4489F',desc:'Часть числа и число по его части.'},
  {id:'eq',name:'Уравнения',sign:'x',c:'#E8452C',desc:'Как найти неизвестное слагаемое, множитель, делимое…'},
  {id:'conv',name:'Единицы величин',sign:'м · кг · ч',c:'#8A6A12',desc:'м², га, ц, т, сутки — переводим.'}
];
const RULES=Object.assign({},
  {mv:TRI_RULE.mv,pr:TRI_RULE.pr,wk:TRI_RULE.wk,meT:DUO_RULE.meet,meS:DUO_RULE.meet,meV:DUO_RULE.meet,awT:DUO_RULE.away,awS:DUO_RULE.away,awV:DUO_RULE.away,
   u1:{title:'Сначала узнай, сколько на одного',text:'Если вещи <b>одинаковые</b> (или скорость <b>та же</b>): <b>1)</b> узнай, сколько приходится на <b>один</b> — общее делим на количество; <b>2)</b> умножь на новое количество.'},
   u2:{title:'Сначала узнай, сколько на одного',text:'<b>1)</b> Узнай, сколько приходится на <b>один</b> — общее делим на количество. <b>2)</b> Узнай, <b>сколько раз</b> это помещается в новом общем — делим.'},
   dP:{title:'Часть числа',text:'Чтобы найти <b>часть числа</b>, надо число <b>разделить</b> на количество равных частей (число под чертой): <sup>1</sup>⁄<sub>4</sub> от 20 = 20 : 4 = 5.'},
   dW:{title:'Число по его части',text:'Чтобы найти <b>число по его части</b>, надо часть <b>умножить</b> на количество частей (число под чертой): <sup>1</sup>⁄<sub>8</sub> часть — 8 кг, всё — 8 · 8 = 64 кг.'},
   conv:{title:'Единицы величин',text:'1 км = 1000 м, 1 м = 10 дм = 100 см, 1 см = 10 мм. 1 т = 10 ц = 1000 кг, 1 ц = 100 кг, 1 кг = 1000 г. 1 м² = 100 дм², 1 дм² = 100 см², 1 га = 100 а, 1 а = 100 м². 1 сут. = 24 ч, 1 ч = 60 мин, 1 мин = 60 с. <b>Из крупных в мелкие — умножаем.</b>'}},
  Object.fromEntries(Object.keys(EQ_NAME).map(k=>['eq_'+k,{title:'Уравнение: '+EQ_NAME[k],text:EQ_RULE[k]}]))
);

/* ---------- сборка ---------- */
const UNITCASE={'дм':'дециметрах','см':'сантиметрах','мм':'миллиметрах','м':'метрах','кг':'килограммах','ц':'центнерах','г':'граммах','дм²':'квадратных дециметрах','см²':'квадратных сантиметрах','а':'арах','м²':'квадратных метрах','мин':'минутах','с':'секундах','ч':'часах'};

const ITEMS=[];const GEN={};
TRI.forEach((tp,i)=>ITEMS.push(Object.assign({},tp,{type:tp.kind,street:tp.st,id:tp.st+':'+i})));
DUO.forEach((tp,i)=>ITEMS.push(Object.assign({},tp,{street:tp.st,id:tp.st+':d'+i})));
UNIT.forEach((tp,i)=>ITEMS.push(Object.assign({},tp,{street:tp.st,id:'unit:'+i})));
PART.forEach((tp,i)=>ITEMS.push(Object.assign({},tp,{street:tp.st,id:'part:'+i})));
EQS.forEach((tp,i)=>ITEMS.push({street:'eq',type:'eq_'+tp.k,k:tp.k,g:tp.g,id:'eq:'+i,t:o=>`Реши уравнение: <b class="big">${o.eq}</b>`,ans:x=>'x = '+x}));
CONV.forEach(([f,to,k],i)=>ITEMS.push({street:'conv',type:'conv',f,to,k,id:'conv:'+i,g:()=>({v:rnd(2,9)}),t:o=>`Вырази в ${UNITCASE[to]||to}: <b class="big">${o.v} ${f} = ? ${to}</b>`,ans:x=>x+' '+to}));
function makeInst(it){
  if(EXTRA[it.type]){const o=it.g();o.text=it.t(o);return o;}
  let o;do{o=it.g();}while(['mv','pr','wk'].includes(it.type)&&o.a===o.b);
  if(/^(me|aw)/.test(it.type))o.s=(o.v1+o.v2)*o.t;
  o.text=it.t(o);return o;
}
/* таблица из трёх величин */
function triVals(o){return [o.a,o.b,o.a*o.b]}
function triTable(it,o,known,q){
  const v=triVals(o);
  const cell=i=>known[i]?`<b>${v[i]}</b>`:(i===it.unk&&q?'<b class="q">?</b>':'');
  return `<table class="kt"><thead><tr>${it.H.map((h,i)=>`<th><span>${h}</span>${it.U[i]}</th>`).join('')}</tr></thead><tbody><tr>${[0,1,2].map(i=>`<td>${cell(i)}</td>`).join('')}</tr></tbody></table>`;
}
function triSol(it,o){const v=triVals(o);return it.unk===2?[v[0],MUL,v[1],['+']]:it.unk===0?[v[2],DIV,v[1],[MUL,MI]]:[v[2],DIV,v[0],[MUL,MI]];}
function triF(it){const H=it.H.map(h=>h.toLowerCase());return it.unk===2?`${H[2]} = ${H[0]} · ${H[1]}`:it.unk===0?`${H[0]} = ${H[2]} : ${H[1]}`:`${H[1]} = ${H[2]} : ${H[0]}`;}
/* схемы движения */
function duoScheme(it,o,kind,qv1){
  const u=it.u;const unkS=/S$/.test(it.type),unkV=/V$/.test(it.type);
  return drawMotion({kind,v1:unkV?'? '+u[0]:o.v1+' '+u[0],v2:o.v2+' '+u[0],s:unkS?'?':o.s+' '+u[2]});
}
function schemesFor(it,o){
  if(/^(me|aw)/.test(it.type)){const k=it.type.startsWith('me')?'meet':'away';return [duoScheme(it,o,k),duoScheme(it,o,k==='meet'?'away':'meet')];}
  if(it.type==='u1'){const seg=n=>Array.from({length:n},()=>({v:1}));
    return [drawScheme({rows:[{segs:seg(o.n1)},{segs:seg(o.n2)}],up:[{r:0,a:0,b:o.n1-1,t:String(o.n1*o.p)}],down:[{r:1,a:0,b:o.n2-1,t:'?'}]}),
            drawScheme({rows:[{segs:seg(o.n1)},{segs:seg(o.n2)}],up:[{r:0,a:0,b:o.n1-1,t:'?'}],down:[{r:1,a:0,b:o.n2-1,t:String(o.n1*o.p)}]})];}
  if(it.type==='dP'||it.type==='dW'){const seg=Array.from({length:o.n},()=>({v:1}));
    const P=it.type==='dP'?{rows:[{segs:seg}],up:[{r:0,a:0,b:o.n-1,t:String(o.A)}],down:[{r:0,a:0,b:0,t:'?'}]}:{rows:[{segs:seg}],up:[{r:0,a:0,b:0,t:String(o.k)}],down:[{r:0,a:0,b:o.n-1,t:'?'}]};
    const Q=it.type==='dP'?{rows:[{segs:seg}],up:[{r:0,a:0,b:0,t:String(o.A)}],down:[{r:0,a:0,b:o.n-1,t:'?'}]}:{rows:[{segs:seg}],up:[{r:0,a:0,b:o.n-1,t:String(o.k)}],down:[{r:0,a:0,b:0,t:'?'}]};
    return [drawScheme(P),drawScheme(Q)];}
  return [];
}
function solFor(it,o){
  switch(it.type){
    case 'mv':case 'pr':case 'wk':return [triSol(it,o)];
    case 'meT':case 'awT':return [[o.v1,'+',o.v2,[MI,MUL]],[o.s,DIV,o.v1+o.v2,[MUL,MI]]];
    case 'meS':case 'awS':return [[o.v1,'+',o.v2,[MI,MUL]],[o.v1+o.v2,MUL,o.t,['+',DIV]]];
    case 'meV':case 'awV':return [[o.s,DIV,o.t,[MUL,MI]],[o.v1+o.v2,MI,o.v2,['+']]];
    case 'u1':return [[o.n1*o.p,DIV,o.n1,[MUL,MI]],[o.p,MUL,o.n2,['+',DIV]]];
    case 'u2':return [[o.n1*o.p,DIV,o.n1,[MUL,MI]],[o.n2*o.p,DIV,o.p,[MUL,MI]]];
    case 'dP':return [[o.A,DIV,o.n,[MUL,MI]]];
    case 'dW':return [[o.k,MUL,o.n,[DIV,'+']]];
    case 'conv':return [[o.v,MUL,it.k,['+',DIV]]];
  }
  if(it.type.startsWith('eq_'))return [o.sol];
}
const ansOf=(it,o)=>{const s=solFor(it,o);const [x,op,y]=s[s.length-1];return ev(x,op,y);};
const STEP_Q={meT:['Скорость сближения','Время встречи'],meS:['Скорость сближения','Расстояние между ними'],meV:['Скорость сближения','Скорость первого'],
  awT:['Скорость удаления','Через сколько времени'],awS:['Скорость удаления','Расстояние между ними'],awV:['Скорость удаления','Скорость первого']};
function mainSpecs(it){
  if(EXTRA[it.type])return EXTRA[it.type].specs(it,it.inst);
  const o=it.inst,specs=[],sols=solFor(it,o);
  if(['mv','pr','wk'].includes(it.type)){
    const v=triVals(o),known={},roles=it.H.map(h=>h.toLowerCase());
    [0,1,2].filter(i=>i!==it.unk).forEach(i=>{
      specs.push({ask:`Число <b class="big">${v[i]}</b> — это что?`,show:triTable(it,o,Object.assign({},known)),opts:roles.slice(),ans:roles[i],long:1});
      known[i]=1;});
    const [x,op,y,tr]=sols[0];
    specs.push({ask:'Как найти «?»',show:triTable(it,o,known,1),opts:exprOpts(x,y,op,tr,'? = '),ans:'? = '+ex(x,op,y)});
    specs.push({ask:'Вычисли',show:triTable(it,o,known,1)+`<p class="why">${triF(it)}</p><p class="eq">? = ${ex(x,op,y)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x,op,y))});
    return specs;
  }
  if(it.type.startsWith('eq_')){
    const [x,op,y,tr]=o.sol;
    const names=Object.keys(EQ_NAME);
    specs.push({ask:'Что неизвестно в уравнении?',show:'',opts:shuffle([EQ_NAME[it.k],...shuffle(names.filter(k=>k!==it.k)).slice(0,2).map(k=>EQ_NAME[k])]),ans:EQ_NAME[it.k],long:1});
    specs.push({ask:'Как найти x?',show:`<p class="why">${EQ_RULE[it.k]}</p>`,opts:exprOpts(x,y,op,tr,'x = '),ans:'x = '+ex(x,op,y)});
    specs.push({ask:'Вычисли',show:`<p class="eq">x = ${ex(x,op,y)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x,op,y))});
    return specs;
  }
  if(it.type==='conv'){
    const fo=shuffle([it.k,...shuffle(FACT_OPTS.filter(f=>f!==it.k)).slice(0,2)]).map(f=>`1 ${it.f} = ${f} ${it.to}`);
    specs.push({ask:`Сколько ${it.to} в 1 ${it.f}?`,show:'',opts:fo,ans:`1 ${it.f} = ${it.k} ${it.to}`});
    specs.push({ask:'Вычисли',show:`<p class="eq">${o.v} ${it.f} = ${o.v} · ${it.k} = <span class="blank"></span> ${it.to}</p><p class="why">из крупных единиц в мелкие — умножаем</p>`,num:true,ans:String(o.v*it.k)});
    return specs;
  }
  const sch=schemesFor(it,o);
  if(sch.length){const cards=sch.map((h,j)=>({v:'s'+j,html:h}));specs.push({ask:/^(me|aw)/.test(it.type)?'Выбери схему: как они движутся?':'Выбери схему к задаче',cards:shuffle(cards),ans:'s0'});}
  const right=sch.length?`<div class="mini">${sch[0]}</div>`:'';
  if(sols.length===1){
    const [x,op,y,tr]=sols[0];
    specs.push({ask:'Каким действием решаем?',show:right,opts:exprOpts(x,y,op,tr),ans:ex(x,op,y)});
    specs.push({ask:'Вычисли',show:right+`<p class="eq">${ex(x,op,y)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x,op,y))});
  }else{
    const [x1,o1,y1,t1]=sols[0],[x2,o2,y2,t2]=sols[1];
    const q=STEP_Q[it.type]||[it.q1,it.q2(o)];
    specs.push({ask:`1) ${q[0]}`,show:right,opts:exprOpts(x1,y1,o1,t1),ans:ex(x1,o1,y1)});
    specs.push({ask:'Вычисли первое действие',show:right+`<p class="eq">1) ${ex(x1,o1,y1)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x1,o1,y1))});
    specs.push({ask:`2) ${q[1]}`,show:right+`<p class="eq">1) ${ex(x1,o1,y1)} = ${ev(x1,o1,y1)}</p>`,opts:exprOpts(x2,y2,o2,t2),ans:ex(x2,o2,y2)});
    specs.push({ask:'Вычисли второе действие',show:right+`<p class="eq">1) ${ex(x1,o1,y1)} = ${ev(x1,o1,y1)}<br>2) ${ex(x2,o2,y2)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x2,o2,y2))});
  }
  return specs;
}
function unitOf(it){
  if(['mv','pr','wk'].includes(it.type))return it.U[it.unk];
  if(/^(me|aw)/.test(it.type))return /T$/.test(it.type)?it.u[1]:/S$/.test(it.type)?it.u[2]:it.u[0];
  if(it.u)return it.u;return '';
}
function solved(it,o){
  o=o||it.inst;if(EXTRA[it.type])return EXTRA[it.type].solved(it,o);const sols=solFor(it,o);
  const lines=sols.map(([x,op,y],i)=>`${sols.length>1?(i+1)+') ':''}${ex(x,op,y)} = <b>${ev(x,op,y)}</b>`).join('<br>');
  let pic='';
  if(['mv','pr','wk'].includes(it.type))pic=triTable(it,o,{0:1,1:1,2:1});
  else{const sc=schemesFor(it,o);if(sc.length)pic=`<div class="mini">${sc[0]}</div>`;}
  const a=ansOf(it,o);
  const ansTxt=it.ans?it.ans(a):(a+' '+unitOf(it)).trim();
  return `<p class="task sm">${o.text}</p>${pic}<p class="eq">${it.type.startsWith('eq_')?'x = ':''}${lines}</p><p class="why">Ответ: <b>${ansTxt}</b></p>`;
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

/* ===== дополнительные улицы: многозначные числа, площадь и периметр, время ===== */
const fmt=n=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ');
STREETS.push(
  {id:'num',name:'Многозначные числа',sign:'1 000 000',c:'#2E7D9A',desc:'Классы и разряды. Сколько всего сотен? Запиши цифрами.'},
  {id:'area',name:'Площадь и периметр',sign:'S · P',c:'#5E7C16',desc:'S = a · b, P = (a + b) · 2. Сторона по площади.'},
  {id:'time',name:'Время',sign:'ч · мин',c:'#C2185B',desc:'Когда закончится? Сколько длилось? Через ровный час.'}
);
Object.assign(RULES,{
  nAll:{title:'Сколько всего сотен (тысяч)',text:'Чтобы узнать, сколько <b>всего сотен</b> в числе, закрой <b>две последние цифры</b>: в числе 4 827 всего <b>48</b> сотен. <b>Всего десятков</b> — закрой одну последнюю цифру. <b>Всего тысяч</b> — закрой три последние цифры: в числе 45 300 всего <b>45</b> тысяч.'},
  nWr:{title:'Запись многозначных чисел',text:'Число делят на <b>классы</b> по три цифры справа: класс единиц и класс тысяч. В каждом классе — <b>3 разряда</b>: сотни, десятки, единицы. Если какого-то разряда нет, ставим <b>0</b>: 3 тысячи 5 единиц = 3 <b>00</b>5.'},
  ar:{title:'Площадь и периметр прямоугольника',text:'<b>Периметр</b> — длина всех сторон: P = (a + b) · 2. <b>Площадь</b> — сколько квадратиков внутри: S = a · b (в см², дм², м²). Найти сторону: <b>b = S : a</b>. У квадрата все стороны равны: P = a · 4, S = a · a, сторона = P : 4.'},
  tm:{title:'Действия со временем',text:'В 1 ч = <b>60 мин</b>. Складываем отдельно часы и минуты. Если минут получилось <b>60 и больше</b>, отдаём 60 мин в часы: 77 мин = 1 ч 17 мин. Сколько длилось: сначала посчитай минуты <b>до ровного часа</b>, потом прибавь остальное.'}
});
/* ---- многозначные числа ---- */
const NUMT=[
  {k:'s',t:o=>`Сколько всего <b>сотен</b> в числе <b class="big">${fmt(o.N)}</b>?`,g:()=>({N:rnd(1200,98999)}),cut:2,name:['сотня','сотни','сотен']},
  {k:'t',t:o=>`Сколько всего <b>тысяч</b> в числе <b class="big">${fmt(o.N)}</b>?`,g:()=>({N:rnd(12000,989999)}),cut:3,name:['тысяча','тысячи','тысяч']},
  {k:'d',t:o=>`Сколько всего <b>десятков</b> в числе <b class="big">${fmt(o.N)}</b>?`,g:()=>({N:rnd(1200,9999)}),cut:1,name:['десяток','десятка','десятков']}
];
NUMT.forEach((tp,i)=>ITEMS.push({street:'num',type:'nAll',id:'num:a'+i,g:tp.g,t:tp.t,cut:tp.cut,nm:tp.name}));
const WRT=[
  ()=>{const a=rnd(2,9),b=rnd(1,9);return {words:`${a} тысячи ${b} ${plural(b,'единица','единицы','единиц')}`.replace(/(\d) тысячи/,(m,d)=>d+' '+plural(+d,'тысяча','тысячи','тысяч')),N:a*1000+b};},
  ()=>{const a=rnd(11,99),b=rnd(2,9)*10;return {words:`${a} ${plural(a,'тысяча','тысячи','тысяч')} ${b}`,N:a*1000+b};},
  ()=>{const a=rnd(2,9),b=rnd(1,9)*100;return {words:`${a} ${plural(a,'тысяча','тысячи','тысяч')} ${b}`,N:a*1000+b};},
  ()=>{const a=rnd(101,909),b=rnd(1,9);return {words:`${a} ${plural(a,'тысяча','тысячи','тысяч')} ${b}`,N:a*1000+b};},
  ()=>{const a=rnd(20,90),b=rnd(1,9)*100+rnd(1,9);return {words:`${a} ${plural(a,'тысяча','тысячи','тысяч')} ${b}`,N:a*1000+b};}
];
WRT.forEach((g,i)=>ITEMS.push({street:'num',type:'nWr',id:'num:w'+i,g,t:o=>`Запиши цифрами: <b class="big">${o.words}</b>`}));
EXTRA.nAll={specs:(it,o)=>[
  {ask:'Как узнать?',show:'',opts:shuffle([`закрыть ${['','одну последнюю цифру','две последние цифры','три последние цифры'][it.cut]}`,...[1,2,3].filter(c=>c!==it.cut).slice(0,2).map(c=>`закрыть ${['','одну последнюю цифру','две последние цифры','три последние цифры'][c]}`)]),ans:`закрыть ${['','одну последнюю цифру','две последние цифры','три последние цифры'][it.cut]}`,long:1},
  {ask:`Сколько всего ${it.nm[2]}?`,show:`<p class="eq">${fmt(o.N).replace(/\s/g,'').slice(0,-it.cut)}<span style="color:var(--ghost)">${String(o.N).slice(-it.cut)}</span></p>`,num:true,ans:String(Math.floor(o.N/10**it.cut))}],
  solved:(it,o)=>`<p class="task sm">${o.text}</p><p class="eq">${String(o.N).slice(0,-it.cut)}<span style="color:var(--ghost)">${String(o.N).slice(-it.cut)}</span></p><p class="why">Ответ: <b>${nf(Math.floor(o.N/10**it.cut),it.nm)}</b></p>`};
EXTRA.nWr={specs:(it,o)=>[
  {ask:'Сколько цифр будет в этом числе?',show:'',opts:shuffle([String(o.N).length,String(o.N).length-1,String(o.N).length+1].map(String)),ans:String(String(o.N).length),letters:1},
  {ask:'Запиши число цифрами',show:`<p class="why">пустые разряды — нули</p>`,num:true,ans:String(o.N)}],
  solved:(it,o)=>`<p class="task sm">${o.text}</p><p class="eq"><b>${fmt(o.N)}</b></p><p class="why">класс тысяч: ${Math.floor(o.N/1000)} · класс единиц: ${String(o.N%1000).padStart(3,'0')}</p><p class="why">Ответ: <b>${fmt(o.N)}</b></p>`};
/* ---- площадь и периметр ---- */
function rectSVG(a,b,la,lb,inside){
  const W=240,H=Math.max(70,Math.min(150,Math.round(200*b/a)));
  return `<svg class="scheme" viewBox="0 0 300 ${H+50}" width="300" height="${H+50}"><rect x="40" y="14" width="${W-20}" height="${H}" fill="#E7F1FF" stroke="#2B3A9E" stroke-width="4"/>
  <text x="${30+W/2}" y="${H+42}" text-anchor="middle" class="${/\?/.test(la)?'sq':'sl'}">${la}</text><text x="${W+28}" y="${14+H/2+6}" text-anchor="start" class="${/\?/.test(lb)?'sq':'sl'}">${lb}</text>
  ${inside?`<text x="${30+W/2}" y="${14+H/2+6}" text-anchor="middle" class="${/\?/.test(inside)?'sq':'sl'}">${inside}</text>`:''}</svg>`;
}
const AREA=[
  {k:'S',g:()=>({a:rnd(5,12),b:rnd(2,4)}),t:o=>`Длина прямоугольного коврика Луны — ${o.a} дм, ширина — ${o.b} дм. Найди <b>площадь</b> коврика.`,F:'S = a · b',sol:o=>[o.a,MUL,o.b,['+']],u:'дм²',pic:o=>rectSVG(o.a,o.b,o.a+' дм',o.b+' дм','S = ?')},
  {k:'P',g:()=>({a:rnd(5,12),b:rnd(2,4)}),t:o=>`Длина прямоугольника — ${o.a} см, ширина — ${o.b} см. Найди <b>периметр</b> прямоугольника.`,F:'P = (a + b) · 2',two:1,sol:o=>[[o.a,'+',o.b,[MUL]],[o.a+o.b,MUL,2,['+']]],u:'см',pic:o=>rectSVG(o.a,o.b,o.a+' см',o.b+' см','P = ?')},
  {k:'Sb',g:()=>({a:rnd(8,16),b:rnd(3,9)}),t:o=>`Площадь прямоугольной лежанки для Луны — ${o.a*o.b} дм². Длина — ${o.a} дм. Найди ширину лежанки.`,F:'b = S : a',sol:o=>[o.a*o.b,DIV,o.a,[MUL,MI]],u:'дм',pic:o=>rectSVG(o.a,o.b,o.a+' дм','? дм','S = '+o.a*o.b+' дм²')},
  {k:'qP',g:()=>({a:rnd(4,12)}),t:o=>`Периметр квадрата — ${o.a*4} см. Найди длину его стороны.`,F:'сторона = P : 4',sol:o=>[o.a*4,DIV,4,[MUL,MI]],u:'см',pic:o=>rectSVG(1,1,'? см','? см','P = '+o.a*4+' см')},
  {k:'qS',g:()=>({a:rnd(3,9)}),t:o=>`Сторона квадрата — ${o.a} дм. Найди площадь квадрата.`,F:'S = a · a',sol:o=>[o.a,MUL,o.a,['+']],u:'дм²',pic:o=>rectSVG(1,1,o.a+' дм',o.a+' дм','S = ?')},
  {k:'S3',g:()=>({a:rnd(6,9),b:rnd(3,5),k:3}),t:o=>`Площадь прямоугольника в 3 раза больше площади квадрата со стороной ${o.b} дм. Найди площадь прямоугольника.`,F:'S = a · a, потом · 3',two:1,sol:o=>[[o.b,MUL,o.b,['+']],[o.b*o.b,MUL,3,['+']]],u:'дм²',pic:o=>rectSVG(1,1,o.b+' дм',o.b+' дм','S = ?')}
];
const AREA_F=['S = a · b','P = (a + b) · 2','b = S : a','сторона = P : 4','S = a · a','S = a · a, потом · 3'];
AREA.forEach((tp,i)=>ITEMS.push(Object.assign({street:'area',type:'ar',id:'area:'+i},tp)));
EXTRA.ar={specs:(it,o)=>{
  const sp=[{ask:'Какая формула нужна?',show:`<div class="mini">${it.pic(o)}</div>`,opts:shuffle([it.F,...shuffle(AREA_F.filter(f=>f!==it.F&&!(it.F.startsWith(f)||f.startsWith(it.F)))).slice(0,2)]),ans:it.F,long:1}];
  const S=it.sol(o);const steps=it.two?S:[S];
  steps.forEach(([x,op,y,tr],k)=>{
    sp.push({ask:steps.length>1?`${k+1}) Каким действием?`:'Каким действием?',show:`<div class="mini">${it.pic(o)}</div><p class="why">${it.F}</p>`,opts:exprOpts(x,y,op,tr),ans:ex(x,op,y)});
    sp.push({ask:'Вычисли',show:`<p class="eq">${ex(x,op,y)} = <span class="blank"></span></p>`,num:true,ans:String(ev(x,op,y))});});
  return sp;},
  solved:(it,o)=>{const S=it.sol(o);const steps=it.two?S:[S];const last=steps[steps.length-1];
    return `<p class="task sm">${o.text}</p><div class="mini">${it.pic(o)}</div><p class="why">${it.F}</p><p class="eq">${steps.map(([x,op,y],k)=>`${steps.length>1?(k+1)+') ':''}${ex(x,op,y)} = <b>${ev(x,op,y)}</b>`).join('<br>')}</p><p class="why">Ответ: <b>${ev(last[0],last[1],last[2])} ${it.u}</b></p>`;}};
/* ---- время ---- */
const hm=(h,m)=>`${h} ч ${String(m).padStart(2,'0')} мин`;
const TIME=[
  {k:'add',g:()=>{const h=rnd(8,16),m=rnd(35,55),d=rnd(61-m,50);return {h,m,d};},t:o=>`Электричка отошла от станции в ${hm(o.h,o.m)} и была в пути ${o.d} мин. В котором часу она прибыла на следующую станцию?`},
  {k:'add',g:()=>{const h=rnd(7,9),m=rnd(30,50),d=rnd(61-m,55);return {h,m,d};},t:o=>`Бабушка начала готовить драники в ${hm(o.h,o.m)} и готовила ${o.d} мин. В котором часу она закончила?`},
  {k:'add',g:()=>{const h=rnd(15,19),m=rnd(40,58),d=rnd(61-m,45);return {h,m,d};},t:o=>`Луна наелась и уснула на диване в ${hm(o.h,o.m)}, проспала ${o.d} мин и проснулась просить ещё. В котором часу она проснулась?`},
  {k:'dur',g:()=>{const h=rnd(10,17),m=rnd(35,55),e=rnd(5,25);return {h,m,e};},t:o=>`Стрим в тиктоке начался в ${hm(o.h,o.m)}, а закончился в ${hm(o.h+1,o.e)}. Сколько минут длился стрим?`},
  {k:'dur',g:()=>{const h=rnd(14,18),m=rnd(30,50),e=rnd(5,30);return {h,m,e};},t:o=>`Стив начал строить замок в ${hm(o.h,o.m)}, а закончил в ${hm(o.h+1,o.e)}. Сколько минут он строил?`},
  {k:'sub',g:()=>{const h=rnd(10,15),m=rnd(5,20),d=rnd(25,50);return {h,m,d};},t:o=>`Мультфильм закончился в ${hm(o.h,o.m)}, а начался ${o.d} мин назад. В котором часу начался мультфильм?`}
];
TIME.forEach((tp,i)=>ITEMS.push(Object.assign({street:'time',type:'tm',id:'time:'+i},tp)));
EXTRA.tm={specs:(it,o)=>{
  if(it.k==='add'){const s=o.m+o.d,H=o.h+Math.floor(s/60),M=s%60;
    const sp=[{ask:'1) Сложи минуты',show:'',num:true,ans:String(s)}];
    if(s>=60)sp.push({ask:`${s} мин — это сколько?`,show:'<p class="why">в 1 ч = 60 мин</p>',opts:shuffle([`1 ч ${M} мин`,`${Math.floor(s/10)} ч ${s%10} мин`,`1 ч ${s-50} мин`]),ans:`1 ч ${M} мин`});
    sp.push({ask:'2) Когда?',show:'',opts:shuffle([hm(H,M),`${o.h} ч ${s} мин`,hm(H+1,M)]),ans:hm(H,M),long:1});return sp;}
  if(it.k==='dur'){const a=60-o.m;return [{ask:`1) Сколько минут от ${hm(o.h,o.m)} до ${o.h+1} ч 00 мин?`,show:'<p class="why">в 1 ч = 60 мин</p>',num:true,ans:String(a)},
    {ask:'2) Сколько минут всего?',show:`<p class="eq">${a} + ${o.e} = <span class="blank"></span></p>`,num:true,ans:String(a+o.e)}];}
  const tot=o.h*60+o.m-o.d,H=Math.floor(tot/60),M=tot%60;
  return [{ask:`1) Сколько минут прошло после ${o.h} ч 00 мин?`,show:'',num:true,ans:String(o.m)},
    {ask:`2) Сколько минут мультфильм шёл до ${o.h} ч 00 мин?`,show:`<p class="eq">${o.d} − ${o.m} = <span class="blank"></span></p>`,num:true,ans:String(o.d-o.m)},
    {ask:'3) Во сколько начался?',show:`<p class="why">${o.h} ч 00 мин − ${o.d-o.m} мин</p>`,opts:shuffle([hm(H,M),hm(o.h,o.d-o.m),hm(H,o.m+o.d)]).filter((v,i,a)=>a.indexOf(v)===i),ans:hm(H,M),long:1}];},
  solved:(it,o)=>{
    let line,ans;
    if(it.k==='add'){const s=o.m+o.d,H=o.h+Math.floor(s/60),M=s%60;line=`${o.m} + ${o.d} = ${s} мин${s>=60?` = 1 ч ${M} мин`:''}`;ans=hm(H,M);}
    else if(it.k==='dur'){const a=60-o.m;line=`${a} + ${o.e} = ${a+o.e} мин`;ans=(a+o.e)+' мин';}
    else{const tot=o.h*60+o.m-o.d;line=`${hm(o.h,o.m)} − ${o.d} мин`;ans=hm(Math.floor(tot/60),tot%60);}
    return `<p class="task sm">${o.text}</p><p class="eq">${line}</p><p class="why">Ответ: <b>${ans}</b></p>`;}};



export const G = { STREETS, RULES, ITEMS, mainSpecs, solved, lessonHTML, ruleFor, makeInst, S };
