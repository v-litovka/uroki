// @ts-nocheck — перенос «Домашки» из legacy-src/domashka (всё, кроме app.js — старого интерфейса) почти без правок:
// страницы тетради (pages*.js), конструкторы заданий, порядок действий, подсказки, «почему?».
// Новые страницы добавлять сюда же (по фото) или отдельным файлом рядом. Наружу — типизированный DM (внизу).
/* eslint-disable */

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


/* ===== Домашка: движок ===== */
const CIRC=['','①','②','③','④','⑤','⑥','⑦','⑧'];
const OPS='+−·:';
function apply(a,o,b){return o==='+'?a+b:o==='−'?a-b:o==='·'?a*b:a/b}

/* выражение: токены и порядок действий как в школе */
function tokens(str){return (str.match(/\d+|[a-z□]|[()+−·:]/g)||[]).map((t,i)=>OPS.includes(t)?{t:'op',o:t}:t==='('||t===')'?{t}:/\d/.test(t)?{t:'n',v:+t}:{t:'v',name:t})}
function subst(str,vars){return str.replace(/[a-z]/g,m=>vars[m]!=null?String(vars[m]):m)}
function orderOf(str){
  const tk=tokens(str);let k=0;tk.forEach(x=>{if(x.t==='op')x.i=k++;if(x.t==='v')x.v=1});
  let L=tk.map(x=>Object.assign({},x));const acts=[];
  while(L.length>1){
    let s=0,e=L.length;const close=L.findIndex(x=>x.t===')');
    if(close>=0){e=close;for(let j=close;j>=0;j--)if(L[j].t==='('){s=j+1;break}}
    let p=-1;for(let j=s;j<e;j++)if(L[j].t==='op'&&(L[j].o==='·'||L[j].o===':')){p=j;break}
    if(p<0)for(let j=s;j<e;j++)if(L[j].t==='op'){p=j;break}
    if(p<0){L.splice(s-1,1);L.splice(s,1);continue}
    const a=L[p-1].v,b=L[p+1].v,o=L[p].o;
    acts.push({i:L[p].i,a,o,b,r:apply(a,o,b),par:s>0});
    L.splice(p-1,3,{t:'n',v:apply(a,o,b)});
    if(L[p-2]&&L[p-2].t==='('&&L[p]&&L[p].t===')'){L.splice(p,1);L.splice(p-2,1)}
  }
  return acts;
}
/* выражение в html: знаки действий можно пометить номерами */
function exprHTML(str,marks,opt){
  opt=opt||{};let k=0;
  return '<span class="ex">'+tokens(str).map(x=>{
    if(x.t==='op'){const i=k++;const m=marks&&marks[i];
      const inner=`<span class="ci${m?' on':''}">${m?m:''}</span><span class="o">${x.o}</span>`;
      if(!opt.tap&&!opt.circles)return `<span class="o">${x.o}</span>`;
      return opt.tap?`<button class="opb" data-i="${i}">${inner}</button>`:`<span class="opb">${inner}</span>`}
    if(x.t==='v')return x.name==='□'?'<span class="bx"></span>':`<i class="var">${x.name}</i>`;
    return x.t==='n'?`<span class="tk">${x.v}</span>`:`<span class="tk ${x.t==='('?'pl':'pr'}">${x.t}</span>`}).join('')+'</span>';
}

/* подсказки к вычислению */
function calcHints(a,o,b){
  if(o==='·'&&(a===0||b===0))return ['Если один из множителей 0, произведение равно 0.','Ноль взять несколько раз — сколько будет?'];
  if(o==='·'&&(a===1||b===1))return ['Умножить на 1 — число не меняется.','1 · число = само число.'];
  if(o===':'&&a===0)return ['0 разделить на любое число — будет 0.','Если делить нечего, сколько достанется каждому?'];
  if(o===':'&&b===1)return ['Разделить на 1 — число не меняется.','Число : 1 = само число.'];
  if(o===':'&&a===b)return ['Число, делённое на само себя, равно 1.','Сколько раз число помещается в самом себе?'];
  if((o==='+'||o==='−')&&b===0)return ['Прибавить или вычесть 0 — число не меняется.','Ничего не добавили и не убрали.'];
  if(o==='+'&&a===0)return ['0 + число = само число.','К нулю прибавили число — сколько стало?'];
  const t=Math.floor(b/10)*10,u=b%10;
  if(o==='·'&&a%10===0&&a>=10&&b<10)return [`Думай десятками: ${a} — это ${a/10} дес.`,`${a/10} дес. · ${b} = ? дес.`];
  if(o==='·'&&b%10===0&&b>=10&&a<10)return [`Думай десятками: ${b} — это ${b/10} дес.`,`${a} · ${b/10} дес. = ? дес.`];
  if(o===':'&&a%10===0&&b%10===0&&b>=10)return [`Думай десятками: ${a/10} дес. : ${b/10} дес.`,`Сколько раз ${b/10} помещается в ${a/10}?`];
  if(o===':'&&a%10===0&&b<10&&(a/10)%b===0&&a>=10)return [`Думай десятками: ${a} — это ${a/10} дес.`,`${a/10} дес. : ${b} = ? дес.`];
  if(o==='·'&&a>=10&&b<10&&a%10){const d=a-a%10;return [`Разбей ${a} на десятки и единицы: ${d} и ${a%10}.`,`Умножь отдельно ${d} · ${b} и ${a%10} · ${b}, потом сложи.`]}
  if(o==='·'&&b>=10&&a<10&&b%10){const d=b-b%10;return [`Разбей ${b} на десятки и единицы: ${d} и ${b%10}.`,`Умножь отдельно ${a} · ${d} и ${a} · ${b%10}, потом сложи.`]}
  if(o===':'&&b<10&&a>10*b){const t=10*b*Math.floor(a/(10*b));return [`Разбей ${a} на удобные слагаемые, которые делятся на ${b}: круглое и остальное.`,`Например, ${t} и ${a-t}. Раздели каждое на ${b} и сложи.`]}
  if(o===':'&&b>=10&&b%10)return [`Подбери: на какое число надо умножить ${b}, чтобы получилось ${a}?`,`Посмотри на последние цифры: ${b%10} · ? должно оканчиваться на ${a%10}.`];
  if(o==='·')return [`Вспомни таблицу умножения: ${a} · ${b} — это по ${a} взять ${b} раз.`,b>1?`Если знаешь, сколько будет ${a} · ${b-1}, прибавь к этому ещё ${a}.`:`Умножить на 1 — что получится?`];
  if(o===':')return [`Деление проверяем умножением: какое число надо умножить на ${b}, чтобы получилось ${a}?`,`Попробуй: ${b} · 5 = ${b*5}. Это больше или меньше, чем ${a}? Двигайся в нужную сторону.`];
  if(o==='+')return b>=10&&u?[`Сложи по частям: сначала десятки, потом единицы.`,`Сначала ${a} + ${t}, а потом прибавь ещё ${u}.`]:[`Сложи по частям: сначала дополни до круглого числа.`,`Сколько не хватает до круглого числа после ${a}? Прибавь это, потом остаток.`];
  return b>=10&&u?[`Вычитай по частям: сначала десятки, потом единицы.`,`Сначала ${a} − ${t}, а потом вычти ещё ${u}.`]:[`Вычитай по частям: сначала до круглого числа, потом остальное.`,`Сколько надо вычесть из ${a}, чтобы получилось круглое число? Потом вычти остаток.`];
}
function calcStep(a,o,b,lead){
  return {k:'num',q:(lead?lead+' ':'')+`${a} ${o} ${b} = <b class="qq">?</b>`,ok:apply(a,o,b),hints:calcHints(a,o,b),act:{a,o,b}};
}
/* шаги «найди значение выражения при c = …» */
function valueItem(expr,vars){
  const vn=Object.keys(vars),s=subst(expr,vars),acts=orderOf(s);
  const marks={};acts.forEach((x,n)=>marks[x.i]=n+1);
  const steps=[];
  vn.forEach(v=>steps.push({k:'num',q:`Какое число ставим вместо <i class="var">${v}</i>?`,ok:vars[v],hints:[`Посмотри в задание: там написано, чему равно <i class="var">${v}</i>.`,`Буква — это переменная. Вместо неё пишем число из условия.`],board:`<div class="bl">${exprHTML(expr)}</div><div class="bl">${exprHTML(s)}</div>`}));
  steps.push({k:'order',q:'В каком порядке выполняем действия? Нажимай на знаки по порядку.',expr:s,ok:acts.map(x=>x.i),hints:ORDER_HINTS,why:orderWhy(s,acts),board:(vn.length?`<div class="bl">${exprHTML(expr)}</div>`:'')+`<div class="bl">${exprHTML(s,marks,{circles:1})}</div>`});
  acts.forEach((x,n)=>{const st=calcStep(x.a,x.o,x.b,`<span class="cn">${CIRC[n+1]}</span>`);
    st.board=(vn.length?`<div class="bl">${exprHTML(expr)}</div>`:'')+`<div class="bl">${exprHTML(s,marks,{circles:1})}${n===acts.length-1?` <span class="tk">= ${x.r}</span>`:''}</div>`+acts.slice(0,n+1).map((y,k)=>`<div class="bl act"><span class="cn">${CIRC[k+1]}</span> <span class="ex">${y.a} ${y.o} ${y.b} = ${y.r}</span></div>`).join('');steps.push(st)});
  return {start:`<div class="bl">${exprHTML(expr)}</div>`,steps,record:`${exprHTML(s,marks,{circles:1})} <span class="tk">= ${acts[acts.length-1].r}</span>`+(acts.length>1?acts.map((y,k)=>`<div class="pen">${CIRC[k+1]} <span class="ex">${y.a} ${y.o} ${y.b} = ${y.r}</span></div>`).join(''):'')};
}
const ORDER_HINTS=['Вспомни правило: сначала действия в скобках, потом умножение и деление, потом сложение и вычитание.','Смотри слева направо. Есть скобки? Если нет — найди умножение или деление.'];

/* дерево-схема как в учебнике: кружки, стрелки, знак действия */
function drawTree(t,opt){
  opt=opt||{};const leaves=[];
  function walk(n,d){if(n.op){n.l=walk(n.l,d+1);n.r=walk(n.r,d+1);n.h=Math.max(n.l.h,n.r.h)+1;return n}
    const x={leaf:1,v:n.v!=null?n.v:n,h:0};leaves.push(x);return x}
  t=walk(JSON.parse(JSON.stringify(t)),0);
  const DX=72,DY=92,R=23,X0=36,Y0=30;
  leaves.forEach((l,i)=>{l.x=X0+i*DX;l.y=Y0});
  function pos(n){if(n.leaf)return;pos(n.l);pos(n.r);n.x=(n.l.x+n.r.x)/2;n.y=Y0+n.h*DY}
  pos(t);
  const p=[];
  function edges(n){if(n.leaf)return;edges(n.l);edges(n.r);
    [n.l,n.r].forEach(c=>{const dx=n.x-c.x,dy=n.y-c.y,L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L;
      const x1=c.x+ux*R,y1=c.y+uy*R,x2=n.x-ux*(R+3),y2=n.y-uy*(R+3);
      p.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="te"/><path d="M${x2} ${y2}l${-ux*9+uy*5} ${-uy*9-ux*5}l${-uy*10} ${ux*10}z" class="th"/>`)});
    const oy=n.y-DY*0.5;p.push(`<circle cx="${n.x}" cy="${oy}" r="14" class="to"/><text x="${n.x}" y="${oy+(n.op==='·'?9:7)}" text-anchor="middle" class="tos${n.op==='·'?' dot':''}">${n.op}</text>`)}
  edges(t);
  function nodes(n){if(!n.leaf){nodes(n.l);nodes(n.r)}const v=n.leaf?n.v:(n.v!=null?n.v:'?');
    const q=String(v)==='?';p.push(`<circle cx="${n.x}" cy="${n.y}" r="${R}" class="tn${n.leaf?'':' tr'}${q?' tq':''}"/><text x="${n.x}" y="${n.y+6}" text-anchor="middle" class="tt${q?' tqq':''}">${v}</text>`)}
  nodes(t);
  const W=X0*2+(leaves.length-1)*DX,H=Y0+t.h*DY+R+6;
  return `<svg class="tree" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="схема">${p.join('')}</svg>`;
}

/* только порядок действий, без счёта */
function orderItem(expr){
  const acts=orderOf(expr),marks={};acts.forEach((x,n)=>marks[x.i]=n+1);
  return {start:'',steps:[{k:'order',q:'Нажимай на знаки действий по порядку: какое первое, второе…',expr,ok:acts.map(x=>x.i),hints:ORDER_HINTS,why:orderWhy(expr,acts),
    board:`<div class="bl">${exprHTML(expr,marks,{circles:1})}</div>`}],record:exprHTML(expr,marks,{circles:1})};
}

/* «почему так?» для порядка действий — собирается автоматически */
const OPN={'+':'сложение','−':'вычитание','·':'умножение',':':'деление'};
const OPN1={'+':'Сложение','−':'Вычитание','·':'Умножение',':':'Деление'},OPN2={'+':'сложения','−':'вычитания','·':'умножения',':':'деления'};
function rankWhy(m,a){return {ok:`${OPN1[m]} раньше ${OPN2[a]}`,no:[`${OPN1[a]} раньше ${OPN2[m]}`]}}
function orderWhy(expr,acts){
  const tk=tokens(expr);const ops=[];let d=0;
  tk.forEach((x,j)=>{if(x.t==='(')d++;else if(x.t===')')d--;else if(x.t==='op'){
    const L=tk[j-1],Rr=tk[j+1];const side=t=>t.t==='n'?t.v:t.t==='v'?t.name:'(…)';
    ops.push({o:x.o,par:d>0,frag:`${side(L)} ${x.o} ${side(Rr)}`})}});
  const isM=o=>o==='·'||o===':';
  const f=ops[acts[0].i],q=`Почему первое — <b class="nw">${f.frag}</b>?`;
  if(f.par&&ops.some(x=>!x.par)){
    const a=ops.find(x=>x.par&&!isM(x.o));
    if(isM(f.o)&&a){const r=rankWhy(f.o,a.o);return {q,ok:'В скобках: '+r.ok.toLowerCase(),no:['В скобках: '+r.no[0].toLowerCase()]}}
    return {q,ok:'Сначала то, что в скобках',no:['Сначала то, что слева']};
  }
  const a=ops.find(x=>!isM(x.o));
  if(isM(f.o)&&a)return Object.assign({q},rankWhy(f.o,a.o));
  return {q,ok:'Сначала то, что слева',no:['Сначала то, что справа']};
}

/* ===== Домашка: страницы ===== */
const RULE_VAR=`<p>В выражениях могут быть не только числа, но и <b>буквы</b>: <span class="ex">25 + <i class="var">a</i></span>, <span class="ex">64 : <i class="var">b</i></span>, <span class="ex">42 − <i class="var">c</i></span>.</p>
<p>Букву в выражении называют <b>переменной</b>. Вместо неё можно подставлять разные числа и находить значения выражения.</p>
<p>Латинские буквы: <i class="var">a</i> — «а», <i class="var">b</i> — «бэ», <i class="var">c</i> — «цэ».</p>
<p class="smp">Образец: если <i class="var">a</i> = 20, то <span class="ex"><i class="var">a</i> + 20</span> → <span class="ex">20 + 20 = 40</span></p>`;
const RULE_ORDER=`<p>Если в выражении <b>есть скобки</b> — сначала считаем в скобках.</p>
<p>Потом <b>умножение и деление</b> по порядку слева направо.</p>
<p>В конце <b>сложение и вычитание</b> слева направо.</p>
<p class="smp">${'<span class="ex">40 : (18 − 10)</span>'} — сначала вычитание в скобках, потом деление.</p>`;
const RULE_TREE=`<p><b>Как читать схему-«дерево»</b></p>
<p>В кружках <b>сверху</b> — числа из условия. Две стрелки соединяют два числа, в маленьком розовом кружке — <b>знак действия</b>. Ниже — что получилось.</p>
<p>Самый нижний кружок — то, о чём спрашивают в задаче.</p>
<p><b>Как выбрать схему:</b> подумай, что можно узнать <b>сразу</b> из условия, а что — только потом.</p>`;
const RULE_PER=`<p><b>Периметр</b> — это длина всех сторон фигуры вместе.</p>
<p>У <b>квадрата</b> 4 одинаковые стороны: <span class="ex">P = a · 4</span>.</p>
<p>У <b>прямоугольника</b> две длины и две ширины: <span class="ex">P = (a + b) · 2</span>.</p>
<p>Вопрос «<b>на сколько больше?</b>» — из большего вычитаем меньшее.</p>`;
const RULE_CMP=`<p><b>Как сравнить, не вычисляя</b></p>
<p>Если в двух произведениях один множитель одинаковый — сравни другие множители. Где он больше, там и произведение больше.</p>
<p>Если одно и то же число делим на разные числа — чем на <b>больше</b> частей делим, тем <b>меньше</b> каждая часть.</p>`;

function signItem(left,right,ok,hints){
  return {start:`<div class="bl cmp">${exprHTML(left)} <span class="sbox">?</span> ${exprHTML(right)}</div>`,
    steps:[{k:'pick',q:'Какой знак поставить?',opts:['&lt;','&gt;','='],ok:['<','>','='].indexOf(ok),signs:1,hints,
      board:`<div class="bl cmp">${exprHTML(left)} <span class="sbox on">${ok==='<'?'&lt;':ok==='>'?'&gt;':'='}</span> ${exprHTML(right)}</div>`}],
    record:`${exprHTML(left)} <span class="tk">${ok==='<'?'&lt;':ok==='>'?'&gt;':'='}</span> ${exprHTML(right)}`};
}

/* схемы к задаче лесника */
const T_OK={op:'+',l:'63',r:{op:'·',l:'6',r:'5'}};
const T_B1={op:'·',l:{op:'+',l:'63',r:'6'},r:'5'};
const T_B2={op:'+',l:'63',r:{op:'+',l:'6',r:'5'}};
const T_B3={op:'−',l:'63',r:{op:'·',l:'6',r:'5'}};

/* фигуры к задаче про периметр */
function figs(){
  const k=13,sq=9*k,rw=7*k,rh=4*k;
  return `<svg class="figs" viewBox="0 0 ${sq+rw+125} ${sq+40}" width="${sq+rw+125}" height="${sq+40}" role="img" aria-label="квадрат и прямоугольник">
  <rect x="20" y="10" width="${sq}" height="${sq}" class="f1"/><text x="${20+sq/2}" y="${sq+32}" text-anchor="middle" class="fl">9 см</text>
  <rect x="${sq+60}" y="${10+sq-rh}" width="${rw}" height="${rh}" class="f2"/><text x="${sq+60+rw/2}" y="${sq+32}" text-anchor="middle" class="fl">7 см</text>
  <text x="${sq+60+rw+8}" y="${10+sq-rh/2+6}" class="fl">4 см</text></svg>`;
}

const PAGES={
 wb:{
  30:{lesson:'Урок 28. Выражения с переменной',rule:RULE_VAR,ex:[
   {n:1,title:'Подчеркни выражения с переменной',text:'Подчеркни выражения с переменной.',rule:RULE_VAR,items:[
     {start:'',steps:[{k:'multi',q:'Нажми на все выражения с переменной, потом нажми Проверить.',opts:['35 : a','35 : 5','37 − 8','35 + b'],ok:[0,3],
       hints:['Переменная — это буква. Посмотри на каждое выражение: где вместо числа стоит буква?','Проверь каждое выражение по очереди: в нём только числа или есть буква?']}],
      record:'<u>'+exprHTML('35 : a')+'</u>; <span class="no">'+exprHTML('35 : 5')+'; '+exprHTML('37 − 8')+';</span> <u>'+exprHTML('35 + b')+'</u>'}]},
   {n:2,title:'Сравни, не вычисляя',text:'Сравни, не вычисляя.',rule:RULE_CMP,items:[
     signItem('8 · 7','7 · 9','<',['В обоих произведениях есть множитель 7. Сравни другие множители: 8 и 9.','Что больше: 8 раз по 7 или 9 раз по 7?']),
     signItem('36 : 6','36 : 4','<',['Делим одно и то же число 36. На 6 частей или на 4 части — где каждая часть больше?','Представь 36 конфет. Их делят на 6 детей или на 4 детей. Когда каждому достанется больше?']),
     signItem('18 · a','8 · a','>',['Второй множитель одинаковый — a. Сравни первые множители: 18 и 8.','Что больше: 18 раз по a или 8 раз по a?']),
     signItem('b : 8','b : 2','<',['Делим одно и то же число b. На 8 частей или на 2 части — где каждая часть больше?','Пирог делят на 8 кусков или на 2 куска. Когда кусок больше?'])]},
   {n:3,title:'Найди значения выражений, если c = 8',text:'Найди значения выражений, если <i class="var">c</i> = 8. Запиши по образцу.<div class="smp">Образец: <span class="ex">56 : <i class="var">c</i> + 47</span> → <span class="ex">56 : 8 + 47 = 54</span></div>',rule:RULE_VAR+RULE_ORDER,items:[
     valueItem('9 · c + 2 · c',{c:8}),
     valueItem('(81 − 4 · c) : 7 + c',{c:8}),
     valueItem('100 − (65 − 58) · c',{c:8})]},
   {n:4,title:'Задача про лесника',text:'Лесник посадил 63 сосны и 6 рядов елей по 5 деревьев в одном ряду. Сколько всего деревьев посадил лесник?',rule:RULE_TREE,items:[
     {start:'',steps:[
      {k:'pick',q:'Что из этого можно узнать <b>сразу</b>, первым действием?',opts:['Сколько всего елей','Сколько всего деревьев','Сколько сосен в одном ряду'],ok:0,
        hints:['Про ели сказано: 6 рядов по 5 деревьев. Можно по этим числам что-то найти?','Чтобы узнать, сколько всего деревьев, надо знать и сосны, и ели. Сосен 63 — известно. А елей?']},
      {k:'pick',q:'Выбери схему к задаче.',opts:[drawTree(T_B1),drawTree(T_OK),drawTree(T_B2),drawTree(T_B3)],ok:1,svg:1,
        hints:['Сначала найди сколько елей: 6 рядов по 5. Это сложение или умножение?','Потом к соснам прибавляем ели — ведь спрашивают, сколько <b>всего</b>. В какой схеме сначала 6 и 5 соединены знаком «·», а потом с 63 — знаком «+»?'],
        board:`<div class="bl">${drawTree(T_OK)}</div>`},
      {k:'pick',q:'Сколько елей посадил лесник? Как узнать?',opts:['6 + 5','6 · 5','63 − 5'],ok:1,
        hints:['6 рядов, в каждом ряду по 5 елей. «По 5 взять 6 раз» — какое это действие?','Одинаковые числа складываем много раз — это умножение.'],
        board:`<div class="bl">${drawTree(T_OK)}</div><div class="bl">1) <span class="ex">6 · 5 = <b class="qq">?</b></span> (д.)</div>`},
      Object.assign(calcStep(6,'·',5),{board:`<div class="bl">${drawTree({op:'+',l:'63',r:{op:'·',l:'6',r:'5',v:30}})}</div><div class="bl">1) <span class="ex">6 · 5 = 30</span> (д.) — ели</div>`}),
      {k:'pick',q:'Как узнать, сколько всего деревьев?',opts:['63 − 30','63 + 30','63 · 30'],ok:1,
        hints:['Деревья — это сосны и ели вместе. «Всего» — какое действие?','Сосен 63, елей 30. Их надо соединить вместе.'],
        board:`<div class="bl">${drawTree({op:'+',l:'63',r:{op:'·',l:'6',r:'5',v:30}})}</div><div class="bl">1) <span class="ex">6 · 5 = 30</span> (д.) — ели</div><div class="bl">2) <span class="ex">63 + 30 = <b class="qq">?</b></span> (д.)</div>`},
      Object.assign(calcStep(63,'+',30),{board:`<div class="bl">${drawTree({op:'+',l:'63',r:{op:'·',l:'6',r:'5',v:30},v:93})}</div><div class="bl">1) <span class="ex">6 · 5 = 30</span> (д.) — ели</div><div class="bl">2) <span class="ex">63 + 30 = 93</span> (д.)</div>`}),
      {k:'num',q:'Ответ: сколько всего деревьев посадил лесник?',ok:93,hints:['Ответ — это то, что получилось в последнем действии.','Посмотри на действие 2).'],
        board:`<div class="bl">${drawTree({op:'+',l:'63',r:{op:'·',l:'6',r:'5',v:30},v:93})}</div><div class="bl">1) <span class="ex">6 · 5 = 30</span> (д.)</div><div class="bl">2) <span class="ex">63 + 30 = 93</span> (д.)</div><div class="bl">Ответ: 93 дерева.</div>`}
     ]}]},
   {n:5,title:'Периметр квадрата и прямоугольника',text:'Сторона квадрата 9 см. Длина прямоугольника 7 см, а ширина — 4 см. У какой фигуры периметр больше и на сколько?',rule:RULE_PER,items:[
     {start:`<div class="bl">${figs()}</div>`,steps:[
      {k:'pick',q:'Как найти периметр квадрата?',opts:['9 + 4','9 · 4','9 · 2'],ok:1,
        hints:['Сколько сторон у квадрата? Они одинаковые или разные?','У квадрата 4 стороны по 9 см. По 9 взять 4 раза — какое действие?'],
        board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = <b class="qq">?</b></span> (см) — квадрат</div>`},
      Object.assign(calcStep(9,'·',4),{board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = 36</span> (см) — квадрат</div>`}),
      {k:'pick',q:'Как найти периметр прямоугольника?',opts:['7 · 4','(7 + 4) · 2','7 + 4'],ok:1,
        hints:['У прямоугольника 4 стороны: 2 длины и 2 ширины.','Длина и ширина вместе — это половина периметра. Сколько таких половинок?'],
        board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = 36</span> (см) — квадрат</div><div class="bl">2) <span class="ex">(7 + 4) · 2 = <b class="qq">?</b></span> (см) — прямоугольник</div>`},
      Object.assign(calcStep(7,'+',4,'Сначала в скобках:'),{board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = 36</span> (см) — квадрат</div><div class="bl">2) <span class="ex">(7 + 4) · 2 = <b class="qq">?</b></span> (см) — прямоугольник</div>`}),
      Object.assign(calcStep(11,'·',2,'Теперь'),{board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = 36</span> (см) — квадрат</div><div class="bl">2) <span class="ex">(7 + 4) · 2 = 22</span> (см) — прямоугольник</div>`}),
      {k:'pick',q:'У какой фигуры периметр больше?',opts:['У квадрата','У прямоугольника'],ok:0,
        hints:['Сравни числа, которые получились в действиях 1) и 2).','Какое число больше — 36 или 22?']},
      {k:'pick',q:'На сколько больше? Каким действием узнаем?',opts:['36 + 22','36 − 22','36 : 22'],ok:1,
        hints:['Вопрос «на сколько больше?» — сложение, вычитание или деление?','Чтобы узнать, на сколько одно число больше другого, из большего вычитаем меньшее.'],
        board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = 36</span> (см)</div><div class="bl">2) <span class="ex">(7 + 4) · 2 = 22</span> (см)</div><div class="bl">3) <span class="ex">36 − 22 = <b class="qq">?</b></span> (см)</div>`},
      Object.assign(calcStep(36,'−',22),{board:`<div class="bl">${figs()}</div><div class="bl">1) <span class="ex">9 · 4 = 36</span> (см)</div><div class="bl">2) <span class="ex">(7 + 4) · 2 = 22</span> (см)</div><div class="bl">3) <span class="ex">36 − 22 = 14</span> (см)</div><div class="bl">Ответ: у квадрата периметр больше на 14 см.</div>`})
     ]}]}
  ]}
 },
 tb:{}
};
const BOOKS={wb:{name:'Печатная тетрадь',short:'Тетрадь'},tb:{name:'Учебник',short:'Учебник'}};

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

/* ===== Домашка: строители заданий ===== */
const BL=t=>`<div class="bl">${t}</div>`;
/* задача по действиям: pre — шаги до решения; acts — {q,opts,ok,hints,why,calc:[a,o,b],u,lbl}; top(n) — картинка/схема после n решённых действий */
function taskItem(o){
  const top=n=>typeof o.top==='function'?o.top(n):(o.top||'');
  const lines=[];const steps=[];
  const board=(extra)=>top(lines.filter(x=>x.done).length)+lines.map(x=>BL(x.t)).join('')+(extra||'');
  (o.pre||[]).forEach(st=>{st.board=st.board||board();steps.push(st)});
  o.acts.forEach((a,i)=>{
    const [x,op,y,op2,z]=a.calc,r0=apply(x,op,y),r=op2?apply(r0,op2,z):r0,nm=`${i+1})`,E=op2?`${x} ${op} ${y} ${op2} ${z}`:`${x} ${op} ${y}`;
    const pk={k:'pick',q:a.q,opts:a.opts,ok:a.ok,hints:a.hints,why:a.why};
    lines.push({t:`${nm} <span class="ex">${E} = <b class="qq">?</b></span> ${a.u||''}`});
    pk.board=board();steps.push(pk);
    const cs=op2?{k:'num',q:`${E} = <b class="qq">?</b>`,ok:r,hints:a.chint||[`Считай по очереди: сначала ${x} ${op} ${y}, потом ${op2} ${z}.`]}:calcStep(x,op,y);
    lines[lines.length-1]={t:`${nm} <span class="ex">${E} = ${r}</span> ${a.u||''}${a.lbl?' — '+a.lbl:''}`,done:1};
    cs.board=board();steps.push(cs);
  });
  if(o.answer){const an=o.answer;lines.push({t:'Ответ: '+an.text,done:0});
    steps.push({k:'num',q:an.q,ok:an.ok,hints:an.hints||['Ответ — это то, что получилось в последнем действии.','Посмотри на последнее действие на доске.'],board:board()})}
  return {start:o.start!=null?o.start:top(0),steps};
}
/* таблица К1 / К / ОК */
function kTable(h,rows){return `<table class="tblc ktab"><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${rows.map(r=>`<tr>${r.map(c=>`<td>${c===''?'':c==='?'?'<b class="qq">?</b>':c}</td>`).join('')}</tr>`).join('')}</table>`}
/* заполнение таблицы к задаче «одинаковые …» */
function tableSteps(h,v){ /* v={k1:?, n1, t1, n2} */
  const S=[];const R1=['?','',''],R2=['','',''];const tb=()=>BL(kTable(h,[R1.slice(),R2.slice()]));
  S.push({k:'num',q:`Первая строка. «${h[1]}» — какое число?`,ok:v.n1,hints:['Найди в задаче, сколько было в первый раз.','Это число стоит рядом со словом про количество.'],board:(R1[1]=v.n1,tb())});
  S.push({k:'num',q:`Первая строка. «${h[2]}» — какое число?`,ok:v.t1,hints:['Сколько всего было в первый раз?','Это самое большое число в условии.'],board:(R1[2]=v.t1,tb())});
  S.push({k:'num',q:`Вторая строка. «${h[1]}» — какое число?`,ok:v.n2,hints:['Сколько «таких же» взяли во второй раз?','Это число стоит рядом со словом «такие» или «таких».'],board:(R2[1]=v.n2,tb())});
  S.push({k:'pick',q:`Вторая строка. «${h[0]}» — сколько?`,opts:['Столько же, как в первой строке','Другое число'],ok:0,hints:['В задаче сказано «одинаковые» или «такие же».','Если вещи одинаковые, то в каждой одно и то же количество.'],
    why:{ok:'Они одинаковые',no:['Их меньше']},board:(R2[0]='?',R2[2]='?',tb())});
  return S;
}
/* цепочка действий */
function chainItem(start,ops){
  let v=start;const done=[`<b>${start}</b>`];const steps=[];
  ops.forEach(([o,b])=>{const st=calcStep(v,o,b);const r=apply(v,o,b);
    st.board=BL(done.join(' ')+` <span class="cn">${o} ${b}</span> → <b class="qq">?</b>`);
    v=r;done.push(`<span class="nw"><span class="cn">${o} ${b}</span> → <b>${r}</b></span>`);steps.push(st)});
  const rest=i=>ops.slice(i+1).map(([o,b])=>` <span class="nw"><span class="cn">${o} ${b}</span> → ?</span>`).join('');
  steps.forEach((st,i)=>{steps[i].board=BL(done.slice(0,i+2).join(' ')+rest(i))});
  return {start:BL(`<b>${start}</b> `+ops.map(([o,b])=>`<span class="nw"><span class="cn">${o} ${b}</span> → ?</span>`).join(' ')),steps,record:done.join(' ')};
}
/* весы-циферблат (как в тетради: шкала 1…12 кг) */
function dial(kg,cap){
  const a=(kg%12)/12*2*Math.PI-Math.PI/2,R=46,cx=56,cy=56;
  const ticks=Array.from({length:12},(_,i)=>{const t=(i+1)/12*2*Math.PI-Math.PI/2;return `<text x="${cx+36*Math.cos(t)}" y="${cy+36*Math.sin(t)+5}" text-anchor="middle" class="dn" style="font:800 11px var(--body);fill:#26224F">${i+1}</text>`}).join('');
  return `<figure><svg viewBox="0 0 112 112" width="130" height="130" role="img" aria-label="весы"><circle cx="${cx}" cy="${cy}" r="${R+6}" fill="#fff" stroke="#26224F" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#26224F" stroke-width="1.5"/>${ticks}<line x1="${cx}" y1="${cy}" x2="${cx+30*Math.cos(a)}" y2="${cy+30*Math.sin(a)}" stroke="#E8452C" stroke-width="4" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="4" fill="#26224F"/></svg><figcaption>${cap}</figcaption></figure>`;
}
/* треугольник по трём точкам с буквами */
function triSVG(pts,names){
  const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);
  return `<svg class="tri" viewBox="${Math.min(...xs)-24} ${Math.min(...ys)-24} ${Math.max(...xs)-Math.min(...xs)+48} ${Math.max(...ys)-Math.min(...ys)+48}" width="${Math.max(...xs)-Math.min(...xs)+48}" height="${Math.max(...ys)-Math.min(...ys)+48}" role="img" aria-label="треугольник ${names.join('')}">
  <polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="#E7F1FF" stroke="#2B3A9E" stroke-width="3"/>${pts.map((p,i)=>{const cx=xs.reduce((a,b)=>a+b)/3,cy=ys.reduce((a,b)=>a+b)/3,dx=p[0]-cx,dy=p[1]-cy,l=Math.hypot(dx,dy);return `<text x="${p[0]+dx/l*16}" y="${p[1]+dy/l*16+6}" text-anchor="middle" style="font:900 18px var(--body);fill:#26224F">${names[i]}</text>`}).join('')}</svg>`;
}
/* сравнение с текстом (единицы, без разбора выражения) */
function signRaw(left,right,ok,hints,why){
  const sg={'<':'&lt;','>':'&gt;','=':'='}[ok];
  return {start:BL(`<span class="cmp">${left} <span class="sbox">?</span> ${right}</span>`),
    steps:[{k:'pick',q:'Какой знак поставить?',opts:['&lt;','&gt;','='],ok:['<','>','='].indexOf(ok),signs:1,hints,why,board:BL(`<span class="cmp">${left} <span class="sbox on">${sg}</span> ${right}</span>`)}],
    record:`${left} ${sg} ${right}`};
}
/* составь выражение по словам и найди значение */
function composeItem(text,okExpr,wrong,hints,why){
  const v=valueItem(okExpr,{});const opts=[okExpr,...wrong];const ord=opts.map((_,i)=>i).sort((a,b)=>((a*7+3)%5)-((b*7+3)%5));
  const pk={k:'pick',q:'Какое выражение подходит?',opts:ord.map(i=>opts[i]),ok:ord.indexOf(0),hints,why,board:BL(text)+BL(exprHTML(okExpr))};
  v.steps.forEach(st=>{st.board=BL(text)+st.board});
  return {start:BL(text),steps:[pk,...v.steps],record:v.record};
}
/* найди неизвестное: сначала известная часть, потом окошко */
function boxItem(eq,known,knownExpr,rest,ans,hints,any){
  const steps=[];
  if(knownExpr){const v=valueItem(knownExpr,{});v.steps.forEach(st=>{st.q=st.k==='order'?'Сначала посчитаем то, что известно: '+exprHTML(knownExpr)+'. Порядок действий?':st.q;st.board=BL(eq)+st.board;steps.push(st)})}
  steps.push({k:'num',q:`${rest} Какое число в окошке?`,ok:ans,any,hints,board:BL(eq.replace('<span class="bx"></span>',`<b style="color:var(--good)">${any?'любое':ans}</b>`))});
  return {start:BL(eq),steps,record:eq.replace('<span class="bx"></span>',`<b>${any?'любое число':ans}</b>`)};
}
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* картинка угла: острый / прямой / тупой (без подписи) */
function angleSVG(deg){
  const vx=deg>90?80:20,vy=88,L=78,r=deg*Math.PI/180,x2=vx+L*Math.cos(r),y2=vy-L*Math.sin(r);
  const arc=deg===90?`<path d="M${vx+14} ${vy}V${vy-14}H${vx}" fill="none" stroke="#E8452C" stroke-width="2.5"/>`:`<path d="M${vx+18} ${vy}A18 18 0 0 0 ${vx+18*Math.cos(r)} ${vy-18*Math.sin(r)}" fill="none" stroke="#E8452C" stroke-width="2.5"/>`;
  return `<svg viewBox="0 0 140 100" width="120" height="86" role="img" aria-label="угол"><line x1="${vx}" y1="${vy}" x2="${vx+L}" y2="${vy}" stroke="#26224F" stroke-width="4" stroke-linecap="round"/><line x1="${vx}" y1="${vy}" x2="${x2}" y2="${y2}" stroke="#26224F" stroke-width="4" stroke-linecap="round"/>${arc}<circle cx="${vx}" cy="${vy}" r="4" fill="#26224F"/></svg>`;
}
/* выбор угла по картинке; kind: 'прямой'|'острый'|'тупой' */
function anglePick(q,kind,why,hints){
  const A=[['острый',45],['прямой',90],['тупой',130]];const ord=shuffle(A);
  return {k:'pick',q,svg:1,opts:ord.map(a=>angleSVG(a[1])),ok:ord.findIndex(a=>a[0]===kind),hints:hints||['Прямой угол — как уголок тетради. Острый — меньше, тупой — больше.','Мысленно приложи уголок тетради к каждому углу.'],why};
}

/* ===== Тетрадь: страницы 29, 31–35 ===== */
const RULE_BR=`<p>В выражениях <b>со скобками</b> сначала считаем <b>в скобках</b>.</p><p>Потом <b>умножение и деление</b> (слева направо), потом <b>сложение и вычитание</b> (слева направо).</p>
<p class="smp"><span class="ex">40 : (18 − 10)</span>: ① вычитание в скобках, ② деление</p>`;
const RULE_WORDS=`<p><b>Сумма</b> — сложение (+), <b>разность</b> — вычитание (−), <b>произведение</b> — умножение (·), <b>частное</b> — деление (:).</p>
<p>«Увеличить <b>на</b> …» — прибавить, «уменьшить <b>на</b> …» — вычесть.</p><p>«Увеличить <b>в</b> … раз» — умножить, «уменьшить <b>в</b> … раз» — разделить.</p>
<p>Если первое действие — сложение или вычитание, а потом умножение или деление, первое берём <b>в скобки</b>.</p>`;
const RULE_01=`<p>Число · 1 = число. &nbsp; 1 · число = число.</p><p>Число · 0 = 0. &nbsp; 0 · число = 0.</p>`;
const RULE_D01=`<p>Число : 1 = число. &nbsp; Число : само себя = 1.</p><p>0 : число = 0. &nbsp; <b>На 0 делить нельзя!</b></p>`;
const RULE_TRI=`<p><b>Прямоугольный</b> треугольник — у него есть <b>прямой угол</b> (как угол тетради).</p><p><b>Тупоугольный</b> — есть <b>тупой угол</b> (больше прямого, «раскрытый»).</p><p><b>Остроугольный</b> — все углы <b>острые</b> (меньше прямого).</p><p>Фигуры обозначают латинскими буквами: треугольник <b>ABC</b>.</p>`;
const RULE_PROP=`<p><b>Сначала узнай, сколько в одном</b> (К1): всего делим на количество.</p><p>Потом умножь на новое количество.</p><p class="smp">К1 · К = ОК</p>`;
const RULE_SCALE=`<p>Весы показывают массу в килограммах: смотри, на какое число указывает стрелка.</p><p>«На сколько больше/меньше?» — вычитаем. «Во сколько раз?» — делим большее на меньшее.</p>`;
const WHY_SUM={ok:'«Всего» — складываем',no:['«Всего» — вычитаем']};
const WHY_MUL=(a,b)=>({ok:`По ${b} взять ${a} раз`,no:[`${a} и ${b} надо сложить`]});
const WHY_DIFF={ok:'«На сколько» — вычитаем',no:['«На сколько» — делим']};
const WHY_RATIO={ok:'«Во сколько раз» — делим',no:['«Во сколько раз» — вычитаем']};

/* две группы по … — всего (куропатки) */
function twoProdTask(o){
  const tree=(a,b,c)=>drawTree({op:'+',l:{op:'·',l:String(o.a1),r:String(o.b1),v:a},r:{op:'·',l:String(o.a2),r:String(o.b2),v:b},v:c});
  const r1=o.a1*o.b1,r2=o.a2*o.b2;
  return taskItem({start:'',top:n=>BL(n>=1?tree(r1,n>=2?r2:undefined,n>=3?r1+r2:undefined):tree()),
    pre:[{k:'pick',q:'Выбери схему к задаче.',svg:1,opts:[drawTree({op:'+',l:{op:'+',l:String(o.a1),r:String(o.b1)},r:{op:'+',l:String(o.a2),r:String(o.b2)}}),tree(),drawTree({op:'−',l:{op:'·',l:String(o.a1),r:String(o.b1)},r:{op:'·',l:String(o.a2),r:String(o.b2)}})],ok:1,
      hints:[`«${o.a1} по ${o.b1}» — это ${o.b1} взять ${o.a1} раз. Какой знак соединяет ${o.a1} и ${o.b1}?`,'Потом обе группы вместе — какой знак внизу?'],why:{ok:'Сначала две группы «по …» (·), потом вместе (+)',no:['Сначала всё сложить']}}],
    acts:[{q:`Сколько ${o.g1}? Как узнать?`,opts:[`${o.a1} + ${o.b1}`,`${o.a1} · ${o.b1}`,`${o.b1} − ${o.a1}`],ok:1,hints:[`${o.a1} раз по ${o.b1} — какое действие?`,'Одинаковые числа складываем много раз — это умножение.'],why:WHY_MUL(o.a1,o.b1),calc:[o.a1,'·',o.b1],u:o.u,lbl:o.g1},
      {q:`Сколько ${o.g2}? Как узнать?`,opts:[`${o.a2} · ${o.b2}`,`${o.a2} + ${o.b2}`,`${o.b2} − ${o.a2}`],ok:0,hints:[`${o.a2} раз по ${o.b2} — какое действие?`,'Так же, как в первом действии.'],why:WHY_MUL(o.a2,o.b2),calc:[o.a2,'·',o.b2],u:o.u,lbl:o.g2},
      {q:`Как узнать, сколько всего ${o.all}?`,opts:[`${r1} − ${r2}`,`${r1} + ${r2}`,`${r1} · ${r2}`],ok:1,hints:['«Всего» — какое действие?','Соедини обе группы вместе.'],why:WHY_SUM,calc:[r1,'+',r2],u:o.u}],
    answer:{q:`Ответ: сколько всего ${o.all}?`,ok:r1+r2,text:`${r1+r2} ${o.ans}.`}});
}

PAGES.wb[29]={lesson:'Урок 27. Порядок действий в выражениях со скобками',rule:RULE_BR,ex:[
 {n:1,title:'Определи порядок действий',text:'Определи порядок выполнения действий.<div class="smp">Считать не надо — только номера действий.</div>',rule:RULE_BR,items:[
   orderItem('□ · (□ − □)'),orderItem('□ : (□ + □) − □'),orderItem('□ + (□ : □)'),orderItem('□ − □ : (□ − □)')]},
 {n:2,title:'Порядок действий и значения',text:'Определи порядок выполнения действий и найди значения выражений.',rule:RULE_BR,items:[
   valueItem('(91 − 35) : 7',{}),valueItem('81 : (36 : 4)',{}),valueItem('(90 − 37) − 49 : 7',{}),valueItem('100 − (72 : 9) · 6',{})]},
 {n:3,title:'Составь выражения',text:'Составь выражения и найди их значения.',rule:RULE_WORDS,items:[
   composeItem('Разность чисел 91 и 37 уменьшить в 9 раз.','(91 − 37) : 9',['91 − 37 : 9','(91 − 37) − 9'],['«Разность» — вычитание, «уменьшить в 9 раз» — разделить на 9.','Вычитание надо сделать первым — значит, его берём в скобки.'],{ok:'Сначала разность — она в скобках',no:['Скобки не нужны']}),
   composeItem('Произведение чисел 7 и 6 увеличить на разность чисел 72 и 38.','7 · 6 + (72 − 38)',['7 · 6 · (72 − 38)','7 · 6 − (72 − 38)'],['«Произведение» — умножение, «увеличить на» — прибавить.','Разность 72 и 38 — это одно число, её берём в скобки и прибавляем.'],{ok:'«Увеличить на» — прибавить',no:['«Увеличить на» — умножить']}),
   composeItem('Частное чисел 63 и 9 увеличить на сумму чисел 27 и 35.','63 : 9 + (27 + 35)',['63 : 9 · (27 + 35)','63 : (9 + 27 + 35)'],['«Частное» — деление, «увеличить на» — прибавить.','Сначала 63 : 9, потом прибавить сумму (27 + 35).'],{ok:'Частное плюс сумма',no:['Частное умножить на сумму']})]},
 {n:4,title:'Задача про куропаток',text:'У 7 серых куропаток по 8 птенцов, а у 6 белых — по 3. Сколько всего птенцов у куропаток?',rule:RULE_TREE,items:[
   twoProdTask({a1:7,b1:8,a2:6,b2:3,g1:'птенцов у серых',g2:'птенцов у белых',all:'птенцов',u:'(пт.)',ans:'птенцов у куропаток'})]},
 {n:5,title:'Кролики на весах',text:'На сколько белый кролик легче серого? Во сколько раз серый кролик тяжелее белого?',rule:RULE_SCALE,items:[
   taskItem({top:BL(`<div class="dials">${dial(4,'белый')}${dial(12,'серый')}</div>`),
     pre:[{k:'num',q:'Сколько килограммов весит белый кролик? Посмотри на стрелку.',ok:4,hints:['Найди, на какое число показывает красная стрелка на левых весах.','Стрелка у белого кролика — между 3 и 5.']},
          {k:'num',q:'А серый кролик?',ok:12,hints:['Посмотри на правые весы.','Стрелка смотрит прямо вверх.']}],
     acts:[{q:'На сколько белый легче серого? Как узнать?',opts:['12 + 4','12 − 4','12 : 4'],ok:1,hints:['«На сколько» — какое действие?','Из большего вычитаем меньшее.'],why:WHY_DIFF,calc:[12,'−',4],u:'(кг)'},
           {q:'Во сколько раз серый тяжелее белого? Как узнать?',opts:['12 − 4','12 · 4','12 : 4'],ok:2,hints:['«Во сколько раз» — какое действие?','Большее делим на меньшее.'],why:WHY_RATIO,calc:[12,':',4],u:''}],
     answer:{q:'Ответ: во сколько раз серый тяжелее?',ok:3,text:'белый кролик легче серого на 8 кг; серый тяжелее белого в 3 раза.'}})]}
]};

PAGES.wb[31]={lesson:'Уроки 29–30. Буквы для фигур. Виды треугольников',rule:RULE_TRI,ex:[
 {n:1,title:'Виды треугольников',text:'Соедини вид треугольника с фигурой.',rule:RULE_TRI,items:[
   ['ABC',[[10,110],[120,110],[60,10]],1],['TSH',[[0,110],[190,0],[150,110]],2],['NRP',[[0,110],[0,0],[160,110]],0]].map(([nm,pts,ok])=>({start:BL(triSVG(pts,nm.split(''))),
     steps:[{k:'pick',q:`Какой треугольник ${nm}?`,opts:['прямоугольный','остроугольный','тупоугольный'],ok,show:'',
       hints:['Посмотри на каждый угол. Есть угол, как у тетради? Есть «раскрытый» угол?','Прямой угол — как угол листа. Тупой — шире прямого. Острые — уже.'],
       why:[{ok:'Есть прямой угол',no:['Все углы острые']},{ok:'Все углы острые',no:['Есть тупой угол']},{ok:'Есть тупой угол',no:['Есть прямой угол']}][ok]}],record:`${nm} — ${['прямоугольный','остроугольный','тупоугольный'][ok]}`}))},
 {n:2,title:'Сравни',text:'Сравни.',rule:RULE_CMP,items:[
   signItem('a − 7','a − 17','>',['Из одного и того же числа a вычитаем 7 и 17. Когда остаётся больше?','Чем меньше вычитаем, тем больше остаётся.']),
   signItem('36 : b','42 : b','<',['Делим на одно и то же число b. Что делим — 36 или 42?','Делим меньшее число — получится меньше.']),
   signItem('d · 4','6 · d','<',['Множитель d есть в обоих. Сравни 4 и 6.','4 раза по d или 6 раз по d — где больше?']),
   signItem('a · 5','a · 7','<',['Множитель a одинаковый. Сравни 5 и 7.','5 раз по a меньше, чем 7 раз по a?'])].map((it,i)=>{it.steps[0].why=[{ok:'Меньше вычитаем — больше остаётся',no:['17 больше 7 — значит, больше']},{ok:'Делим меньшее число',no:['Делим на разные числа']},{ok:'b одинаковое, а 4 < 6',no:['d · 4 стоит слева']},{ok:'a одинаковое, а 5 < 7',no:['a · 5 стоит слева']}][i];return it})},
 {n:3,title:'Найди значения, если n = 8',text:'Найди значения выражений, если <i class="var">n</i> = 8.',rule:RULE_VAR+RULE_BR,items:[
   valueItem('81 : (72 : n) + 54',{n:8}),valueItem('(93 − 37) : n · 5',{n:8}),valueItem('92 − (5 · n + 19)',{n:8}),valueItem('48 : 6 · n − 27',{n:8}),valueItem('9 · 9 − 7 · n',{n:8}),valueItem('37 + (56 : n + 27)',{n:8})]},
 {n:4,title:'Шары двумя способами',text:'Реши задачу двумя способами. На праздник купили 9 золотистых шаров, а красных в 4 раза больше. Сколько всего шаров купили на праздник?',rule:RULE_TIMES,items:[
   (()=>{const sch=SCH.both(SCH.times('З.','К.',9,4,'9',''),'?');const w1=SCH.both(SCH.more('З.','К.',9,4,'9','4',''),'?'),w2=SCH.both(SCH.part('З.','К.',9,4,'9',''),'?');
     const t=taskItem({start:'',top:BL(drawScheme(sch)),
     pre:[{k:'pick',q:'Красных шаров больше или меньше, чем золотистых?',opts:['Больше','Меньше'],ok:0,board:' ',hints:['«Красных в 4 раза больше».','Значит, красных…'],why:{ok:'Сказано «в 4 раза больше»',no:['Сказано «меньше»']}},
          {k:'pick',q:'Выбери схему к задаче.',svg:1,opts:[drawScheme(w1),drawScheme(sch),drawScheme(w2)],ok:1,hints:['Красных <b>в 4 раза больше</b> — это 4 таких же отрезка, как золотистые.','«На 4 больше» — это золотистые и ещё кусочек 4. А у нас «в 4 раза». Скобка «?» справа — сколько всего.'],
           why:{ok:'«В 4 раза больше» — 4 таких отрезка',no:['«В 4 раза» — кусочек 4']}}],
     acts:[{q:'Способ 1. Сколько красных шаров?',opts:['9 + 4','9 · 4','9 : 4'],ok:1,hints:['«В 4 раза больше» — какое действие?','По 9 взять 4 раза.'],why:{ok:'«В 4 раза больше» — умножаем',no:['«В 4 раза больше» — прибавляем 4']},calc:[9,'·',4],u:'(ш.)',lbl:'красные'},
           {q:'Сколько всего шаров?',opts:['36 − 9','36 + 9','36 · 9'],ok:1,hints:['«Всего» — какое действие?','Золотистые и красные вместе.'],why:WHY_SUM,calc:[9,'+',36],u:'(ш.)'}]});
     const v=valueItem('9 + 9 · 4',{});
     t.steps.push({k:'pick',q:'Способ 2 — одним выражением. Какое подходит?',opts:['9 + 9 · 4','(9 + 9) · 4','9 · 4'],ok:0,hints:['Золотистые (9) плюс красные (9 · 4).','Скобки не нужны: умножение и так делаем первым.'],why:{ok:'Золотистые + красные',no:['Только красные']},board:t.steps[t.steps.length-1].board+BL('Способ 2: '+exprHTML('9 + 9 · 4'))});
     v.steps.forEach(s=>{s.board=t.steps[t.steps.length-2].board+s.board;t.steps.push(s)});
     t.steps.push({k:'num',q:'Ответ: сколько всего шаров?',ok:45,hints:['Оба способа дают один ответ.','Посмотри на результат.'],board:t.steps[t.steps.length-1].board+BL('Ответ: 45 шаров купили на праздник.')});
     return t})()]},
 {n:5,title:'Прямоугольный треугольник',text:'Начерти прямоугольный треугольник со сторонами 3 см, 2 см, 3 см 6 мм. Обозначь его буквами. Найди периметр треугольника.',rule:RULE_TRI+RULE_PER,items:[
   {start:'',steps:[
     anglePick('Треугольник прямоугольный. Какой угол обязательно должен у него быть?','прямой',{ok:'Прямоугольный — есть прямой угол',no:['Прямоугольный — все углы острые']},['Посмотри на слово: прямо-угольный.','Какой угол похож на уголок тетради?']),
     {k:'nums',q:'Выпиши из задания длины сторон по порядку.',fields:[{ok:3,u:'см,'},{ok:2,u:'см,'},{ok:3,u:'см'},{ok:6,u:'мм'}],hints:['В задании после слов «со сторонами» — три длины.','У третьей стороны есть и сантиметры, и миллиметры.'],board:BL('Стороны: 3 см, 2 см, 3 см 6 мм')},
     {k:'pick',q:'Прямой угол образуют две стороны. Какие из них чертим по клеточкам от прямого угла?',opts:['3 см и 2 см','3 см и 3 см 6 мм','2 см и 3 см 6 мм'],ok:0,hints:['Самая длинная сторона лежит напротив прямого угла — она соединяет концы двух других.','Найди самую длинную сторону. Две другие — у прямого угла.'],why:{ok:'Самая длинная — напротив прямого угла',no:['Самая длинная — у прямого угла']}},
     {k:'note',q:'Начерти в тетради по линейке: прямой угол по клеточкам, на его сторонах отложи длины, которые ты выбрала. Соедини концы.',btn:'Начертила'},
     {k:'nums',q:'Измерь линейкой третью сторону. Сколько получилось?',fields:[{ok:3,u:'см'},{ok:6,u:'мм'}],hints:['Приложи 0 линейки к одному концу стороны.','Сравни с длиной в задании — должно совпасть.'],board:BL('Третья сторона — как в задании ✓')},
     {k:'pick',q:'Как обозначить треугольник?',opts:['Буквами у вершин','Цифрами у сторон'],ok:0,hints:['Вершина — это уголок, где сходятся стороны.','Треугольники называют латинскими буквами, например ABC.'],why:{ok:'Вершины обозначают буквами',no:['Стороны обозначают цифрами']}},
     {k:'note',q:'Подпиши вершины треугольника в тетради латинскими буквами.',btn:'Подписала'},
     {k:'pick',q:'Что такое периметр треугольника?',opts:['Сумма длин всех трёх сторон','Длина самой большой стороны'],ok:0,hints:['Периметр — длина всех сторон вместе.','Сложи все стороны.'],why:{ok:'Все стороны вместе',no:['Только одна сторона']}},
     {k:'nums',pre:'P =',q:'Запиши, что складываем: длины всех сторон по порядку, как в задании.',fields:[{ok:3,u:'см +'},{ok:2,u:'см +'},{ok:3,u:'см'},{ok:6,u:'мм'}],hints:['Периметр — все стороны вместе. Сколько сторон у треугольника?','Возьми длины из задания по порядку. У третьей стороны есть и сантиметры, и миллиметры.'],board:BL('P = 3 см + 2 см + 3 см 6 мм = <b class="qq">?</b>')},
     {k:'nums',q:'Чему равен периметр?',fields:[{ok:8,u:'см'},{ok:6,u:'мм'}],hints:['Сложи отдельно сантиметры, отдельно миллиметры.','Миллиметры есть только у одной стороны.'],board:BL('P = 3 см + 2 см + 3 см 6 мм = 8 см 6 мм')+BL('Ответ: периметр треугольника 8 см 6 мм.')}],record:'P = 3 см + 2 см + 3 см 6 мм = 8 см 6 мм'+'Ответ: периметр треугольника 8 см 6 мм.'}]}
]};

PAGES.wb[32]={lesson:'Уроки 31–33. Закрепление',rule:RULE_BR,ex:[
 {n:1,title:'Определи порядок действий',text:'Определи порядок действий.<div class="smp">Считать не надо — только номера действий.</div>',rule:RULE_BR,items:[
   orderItem('(a + d) : c − d'),orderItem('s · b + (d − c)'),orderItem('a · c + b · m'),orderItem('(c − b · a) + s')]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_BR,items:[
   valueItem('6 · 4 : 3 · 5',{}),valueItem('83 − 64 : (2 · 4)',{}),valueItem('7 · 7 − 54 : 6',{}),valueItem('(100 − 35 : 7) − 48',{})]},
 {n:3,title:'Составь выражения',text:'Составь выражения. Найди их значения.',rule:RULE_WORDS,items:[
   composeItem('К произведению чисел 5 и 8 прибавить разность чисел 100 и 67.','5 · 8 + (100 − 67)',['5 · 8 − (100 − 67)','5 · (8 + 100 − 67)'],['«Произведение» — умножение, «прибавить» — плюс.','Разность 100 и 67 берём в скобки.'],{ok:'Произведение плюс разность',no:['Произведение минус разность']}),
   composeItem('Из произведения чисел 8 и 7 вычесть частное чисел 49 и 7.','8 · 7 − 49 : 7',['8 · 7 + 49 : 7','(8 · 7 − 49) : 7'],['«Из произведения вычесть» — сначала 8 · 7, потом минус.','Частное 49 : 7 — деление, его и так делаем раньше вычитания.'],{ok:'Произведение минус частное',no:['Сначала вычесть, потом делить']}),
   composeItem('Частное чисел 36 и 6 увеличить в 9 раз.','36 : 6 · 9',['36 : 6 + 9','36 : (6 · 9)'],['«Частное» — деление, «увеличить в 9 раз» — умножить на 9.','Сначала 36 : 6, потом умножить на 9.'],{ok:'«Увеличить в 9 раз» — умножить',no:['«Увеличить в 9 раз» — прибавить 9']})]},
 {n:4,title:'Клубника (n = 6, m = 5)',text:'Реши задачу, если <i class="var">n</i> = 6, <i class="var">m</i> = 5. За сезон Клим собрал <i class="var">n</i> кг клубники, Влад — в <i class="var">m</i> раз больше. А Игорь собрал столько, сколько Клим и Влад вместе. Сколько килограммов клубники собрал Игорь?',rule:RULE_VAR,items:[
   (()=>{const tp=(k,v,g)=>BL(`Клим — ${k}`)+BL(`Влад — ${v}`)+BL(`Игорь — ${g}`);const t=taskItem({top:n=>tp('6 кг',n>=1?'30 кг':'в 5 раз больше',n>=2?'36 кг':'?'),
     pre:[{k:'num',q:'Подставь числа: сколько кг собрал Клим?',ok:6,hints:['Клим собрал n кг.','Посмотри в задание: чему равно n?']},
          {k:'num',q:'Во сколько раз Влад собрал больше Клима?',ok:5,hints:['Влад — в m раз больше.','Посмотри в задание: чему равно m?']}],
     acts:[{q:'Сколько собрал Влад?',opts:['6 + 5','6 · 5','6 : 5'],ok:1,hints:['Влад — в 5 раз больше. Какое действие?','«В … раз больше» — умножаем.'],why:{ok:'«В 5 раз больше» — умножаем',no:['«В 5 раз больше» — прибавляем 5']},calc:[6,'·',5],u:'(кг)',lbl:'Влад'},
           {q:'Сколько собрал Игорь?',opts:['30 − 6','30 + 6','30 · 6'],ok:1,hints:['Игорь — столько, сколько Клим и Влад вместе.','«Вместе» — складываем.'],why:{ok:'«Вместе» — складываем',no:['«Вместе» — умножаем']},calc:[6,'+',30],u:'(кг)',lbl:'Игорь'}],
     answer:{q:'Ответ: сколько кг собрал Игорь?',ok:36,text:'36 кг клубники собрал Игорь.'}});t.start=tp('<b class="qq">?</b>','в <b class="qq">?</b> раз больше','?');t.steps[0].board=tp('6 кг','в <b class="qq">?</b> раз больше','?');t.steps[1].board=tp('6 кг','в 5 раз больше','?');return t})()]},
 {n:5,title:'Ломаная ANMF',text:'Начерти ломаную ANMF, длина первого звена которой — 8 см, что в 4 раза больше длины второго звена, а третье звено — в 3 раза длиннее второго. Найди длину ломаной.',rule:`<p>Ломаная ANMF: звенья AN, NM, MF.</p><p><b>Длина ломаной</b> — сумма длин всех звеньев.</p><p>«8 см — это в 4 раза <b>больше</b> второго» — значит, второе <b>меньше</b>: делим.</p>`,items:[
   (()=>{const t=taskItem({top:'',
     pre:[{k:'pick',q:'Второе звено длиннее или короче первого?',opts:['Короче','Длиннее'],ok:0,hints:['«8 см — это в 4 раза больше второго звена». Кто больше — первое или второе?','Первое больше, значит, второе…'],why:{ok:'Первое в 4 раза больше второго',no:['Второе в 4 раза больше']}}],
     acts:[{q:'Как найти второе звено?',opts:['8 · 4','8 : 4','8 − 4'],ok:1,hints:['Второе в 4 раза короче первого. Какое действие?','«В 4 раза меньше» — делим.'],why:{ok:'Второе короче — делим',no:['Слово «больше» — умножаем']},calc:[8,':',4],u:'(см)',lbl:'NM'},
           {q:'Как найти третье звено?',opts:['2 · 3','2 + 3','8 · 3'],ok:0,hints:['Третье в 3 раза длиннее <b>второго</b>.','Второе — 2 см. В 3 раза длиннее — умножаем.'],why:{ok:'В 3 раза длиннее второго',no:['В 3 раза длиннее первого']},calc:[2,'·',3],u:'(см)',lbl:'MF'},
           {q:'Длина ломаной — это все звенья вместе. Как её найти?',opts:['8 + 2 + 6','8 · 2 · 6','8 + 2 − 6'],ok:0,hints:['Длина ломаной — сумма всех звеньев.','Сложи все три звена.'],why:{ok:'Длина — сумма звеньев',no:['Длина — произведение звеньев']},calc:[8,'+',2,'+',6],u:'(см)',lbl:'длина ломаной'}],
     answer:{q:'Ответ: длина ломаной (см)?',ok:16,text:'длина ломаной 16 см.'}});t.steps.push({k:'note',q:'Начерти ломаную ANMF в тетради по линейке. Длины звеньев AN, NM и MF возьми из своих действий на доске.',btn:'Начертила'});return t})()]}
]};

PAGES.wb[33]={lesson:'Урок 34. Задачи на нахождение четвёртого пропорционального',rule:RULE_PROP,ex:[
 {n:1,title:'Заполни таблицу к задаче',text:'Заполни таблицу к задаче. В 6 одинаковых коробках 54 конфеты. Купили 4 такие коробки конфет. Сколько конфет купили?',rule:RULE_PROP,items:[
   {start:BL(kTable(['В 1 коробке (к.)','Количество коробок (шт.)','Всего конфет (к.)'],[['','',''],['','','']])),steps:tableSteps(['В 1 коробке (к.)','Количество коробок (шт.)','Всего конфет (к.)'],{n1:6,t1:54,n2:4}),
    record:kTable(['В 1 коробке (к.)','Количество коробок (шт.)','Всего конфет (к.)'],[['?','6','54'],['одинаково, ?','4','?']])}]},
 {n:2,title:'Вставь пропущенные числа',text:'Вставь пропущенные числа в цепочку.',rule:RULE_ORDER,items:[chainItem(6,[['·',8],['−',29],['+',37],[':',7],['·',5],['−',13],[':',3],['·',7]])]},
 {n:3,title:'Заполни схему: платья и пуговицы',text:'Заполни схему к задаче и реши её. На трёх одинаковых платьях 18 пуговиц. Сколько пуговиц на 5 таких же платьях?',rule:RULE_TREE+RULE_PROP,items:[
   taskItem({top:n=>BL(drawTree({op:'·',l:{op:':',l:'18',r:'3',v:n>=1?6:undefined},r:'5',v:n>=2?30:undefined})),start:'',
     pre:[{k:'pick',q:'Как заполнить схему? Выбери правильную.',svg:1,opts:[drawTree({op:'·',l:{op:':',l:'18',r:'5'},r:'3'}),drawTree({op:'·',l:{op:':',l:'18',r:'3'},r:'5'}),drawTree({op:'·',l:{op:':',l:'3',r:'18'},r:'5'})],ok:1,
       hints:['Сначала узнаём, сколько пуговиц на 1 платье: 18 делим на количество платьев — на 3.','Потом умножаем на 5 платьев.'],why:{ok:'18 : 3 — на одном, потом · 5',no:['18 : 5, потом · 3']},board:''}],
     acts:[{q:'Сколько пуговиц на одном платье?',opts:['18 : 3','18 − 3','18 · 3'],ok:0,hints:['18 пуговиц на 3 платьях поровну.','Делим поровну — деление.'],why:{ok:'Поровну на 3 платья — делим',no:['Платья и пуговицы вычитаем']},calc:[18,':',3],u:'(п.)',lbl:'на одном'},
           {q:'Сколько пуговиц на 5 платьях?',opts:['6 + 5','6 · 5','30 : 5'],ok:1,hints:['На каждом из 5 платьев по 6 пуговиц.','По 6 взять 5 раз.'],why:WHY_MUL(5,6),calc:[6,'·',5],u:'(п.)'}],
     answer:{q:'Ответ: сколько пуговиц на 5 платьях?',ok:30,text:'30 пуговиц на 5 платьях.'}})]},
 {n:4,title:'Реши задачу № 1',text:'Реши задачу, данную в задании № 1. В 6 одинаковых коробках 54 конфеты. Купили 4 такие коробки. Сколько конфет купили?',rule:RULE_PROP,items:[
   taskItem({top:n=>BL(kTable(['В 1 коробке (к.)','Количество коробок (шт.)','Всего конфет (к.)'],[[n>=1?'9':'?','6','54'],[n>=1?'9':'?','4',n>=2?'36':'?']])),
     acts:[{q:'Сначала сколько конфет в 1 коробке. Как узнать?',opts:['54 − 6','54 : 6','54 · 6'],ok:1,hints:['54 конфеты в 6 коробках поровну.','Всего делим на количество коробок.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[54,':',6],u:'(к.)',lbl:'в 1 коробке'},
           {q:'Сколько конфет в 4 коробках?',opts:['9 + 4','9 · 4','54 − 9'],ok:1,hints:['В каждой из 4 коробок по 9 конфет.','По 9 взять 4 раза.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[9,'·',4],u:'(к.)'}],
     answer:{q:'Ответ: сколько конфет купили?',ok:36,text:'36 конфет купили.'}})]},
 {n:5,title:'Длина ломаной',text:'Начерти ломаную, длина которой вычисляется так: 4 см + 1 см + 4 см · 2. Найди длину ломаной.',rule:RULE_ORDER+'<p><b>Длина ломаной</b> — сумма длин всех звеньев.</p>',items:[
   (()=>{const v=valueItem('4 + 1 + 4 · 2',{});v.steps.unshift({k:'pick',q:'Что значит «4 см · 2» для ломаной?',opts:['Два звена по 4 см','Одно звено 2 см','Одно звено 4 см'],ok:0,hints:['· 2 — значит взять 2 раза.','Сколько раз взяли звено 4 см?'],why:{ok:'4 см взяли 2 раза',no:['4 см и 2 см — разные звенья']},board:BL('4 см + 1 см + 4 см · 2')},
     {k:'num',q:'Сколько всего звеньев будет у ломаной?',ok:4,hints:['Посчитай звенья: 4 см, 1 см, и ещё «4 см · 2» — это сколько звеньев?','Два звена отдельно и ещё два одинаковых.'],board:BL('4 см + 1 см + 4 см · 2')},
     {k:'nums',q:'Запиши длины звеньев по порядку.',fields:[{ok:4,u:'см,'},{ok:1,u:'см,'},{ok:4,u:'см,'},{ok:4,u:'см'}],hints:['Первые два звена записаны в выражении прямо.','«4 см · 2» — два звена по сколько?'],board:BL('Звенья: 4 см, 1 см, 4 см, 4 см')},
     {k:'note',q:'Начерти эту ломаную в тетради по линейке. Каждое следующее звено начинай с конца предыдущего.',btn:'Начертила',board:BL('Звенья: 4 см, 1 см, 4 см, 4 см')});v.record+=' (см)';return v})()]}
]};

PAGES.wb[34]={lesson:'Уроки 35–36. Умножение на 1 и на 0',rule:RULE_01,ex:[
 {n:1,title:'Вставь пропущенные числа',text:'Вставь пропущенные числа.',rule:RULE_01,items:[
   boxItem('<span class="bx"></span> · 1 = 5',0,null,'',5,['Умножить на 1 — число не меняется.','Какое число · 1 даёт 5?']),
   boxItem('<span class="bx"></span> · 0 = 0',0,null,'',0,['Любое число · 0 = 0.','Подойдёт любое число! Напиши какое хочешь.'],1),
   boxItem('1 · 4 = <span class="bx"></span>',0,null,'',4,['1 · число = само число.','1 · 4 = ?']),
   boxItem('0 · 7 = <span class="bx"></span>',0,null,'',0,['0 · число = 0.','Ноль взять 7 раз — сколько будет?'])]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_01,items:[
   valueItem('34 · 1',{}),valueItem('48 · 0',{}),valueItem('52 · 1 · 0',{}),valueItem('64 · 1 · 1',{}),valueItem('1 · 38 + 26 · 0',{}),valueItem('6 · (43 − 39) · 1',{}),valueItem('57 − 4 · 9 · 0',{}),valueItem('9 · 0 + 57 · 1',{})]},
 {n:3,title:'Вставь числа, чтобы равенства были верными',text:'Вставь пропущенные числа, чтобы равенства были верными.',rule:RULE_01+'<p>Неизвестное слагаемое = сумма − другое слагаемое. Неизвестное вычитаемое = уменьшаемое − разность.</p>',items:[
   boxItem('100 − <span class="bx"></span> · 1 = 73',0,null,'□ · 1 — это само число. 100 − □ = 73.',27,['Неизвестное вычитаемое: из 100 вычти 73.','100 − 73 = ?']),
   boxItem('(56 − 34 · 0) + <span class="bx"></span> = 80',0,'56 − 34 · 0','В скобках получилось 56. 56 + □ = 80.',24,['Неизвестное слагаемое: 80 − 56.','80 − 56 = ?']),
   boxItem('(35 · 1 + 28) − <span class="bx"></span> = 18',0,'35 · 1 + 28','В скобках получилось 63. 63 − □ = 18.',45,['Неизвестное вычитаемое: 63 − 18.','63 − 18 = ?']),
   boxItem('(34 · 1 + 28) − <span class="bx"></span> = 44',0,'34 · 1 + 28','В скобках получилось 62. 62 − □ = 44.',18,['Неизвестное вычитаемое: 62 − 44.','62 − 44 = ?']),
   boxItem('<span class="bx"></span> + (47 + 4 · 0) = 83',0,'47 + 4 · 0','В скобках получилось 47. □ + 47 = 83.',36,['Неизвестное слагаемое: 83 − 47.','83 − 47 = ?']),
   boxItem('80 + <span class="bx"></span> · 0 + 20 = 100',0,null,'□ · 0 = 0 при любом числе. 80 + 0 + 20 = 100 — верно всегда!',0,['Любое число · 0 = 0.','Подойдёт любое число — напиши какое хочешь.'],1)]},
 {n:4,title:'Таблица: скрипки и струны',text:'Заполни таблицу и реши задачу. На 8 скрипок натянули 32 струны. Сколько струн у 6 таких скрипок?',rule:RULE_PROP,items:[
   (()=>{const H=['Струн у одной скрипки (стр.)','Количество скрипок (шт.)','Струн на всех скрипках (стр.)'];const ts=tableSteps(H,{n1:8,t1:32,n2:6});
     const t=taskItem({top:n=>BL(kTable(H,[[n>=1?'4':'?','8','32'],[n>=1?'4':'?','6',n>=2?'24':'?']])),
       acts:[{q:'Сколько струн у одной скрипки?',opts:['32 − 8','32 : 8','32 · 8'],ok:1,hints:['32 струны на 8 скрипках поровну.','Всего делим на количество.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[32,':',8],u:'(стр.)',lbl:'у одной'},
             {q:'Сколько струн у 6 скрипок?',opts:['4 · 6','4 + 6','32 − 6'],ok:0,hints:['У каждой из 6 скрипок по 4 струны.','По 4 взять 6 раз.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[4,'·',6],u:'(стр.)'}],
       answer:{q:'Ответ: сколько струн у 6 скрипок?',ok:24,text:'24 струны у 6 скрипок.'}});
     t.start=BL(kTable(H,[['','',''],['','','']]));t.steps=ts.concat(t.steps);return t})()]},
 {n:5,title:'Клумба и плитка',text:'Папа сделал клумбу прямоугольной формы длиной 4 м, а шириной 2 м. Хватит ли 18 штук бордюрной плитки длиной по 1 м, если её класть со всех сторон клумбы?',rule:RULE_PER,items:[
   (()=>{const t=taskItem({top:'',
     pre:[{k:'pick',q:'Плитку кладут со всех сторон. Что надо узнать сначала?',opts:['Периметр клумбы','Площадь клумбы'],ok:0,hints:['Плитка идёт по краю, вокруг клумбы.','Длина всех сторон вместе — это…'],why:{ok:'Вокруг клумбы — это периметр',no:['Вокруг клумбы — это площадь']}},
          {k:'pick',q:'Как найти периметр?',opts:['4 · 2','(4 + 2) · 2','4 + 2'],ok:1,hints:['2 длины и 2 ширины.','(длина + ширина) · 2'],why:{ok:'2 длины и 2 ширины',no:['1 длина и 1 ширина']}}],
     acts:[{q:'Что считаем первым?',opts:['4 + 2','4 · 2','4 − 2'],ok:0,hints:['Действие в скобках.','4 + 2.'],why:{ok:'Сначала скобки',no:['Сначала умножение']},calc:[4,'+',2],u:'(м)'},
           {q:'Теперь умножаем на 2',opts:['6 · 2','6 + 2','6 : 2'],ok:0,hints:['Две длины и две ширины — половинку берём 2 раза.','6 · 2.'],why:{ok:'Половину периметра — 2 раза',no:['Делим пополам']},calc:[6,'·',2],u:'(м)',lbl:'периметр'}]});t.steps.push(
     {k:'num',q:'Каждая плитка — 1 м. Сколько плиток нужно на 12 м?',ok:12,hints:['Одна плитка — один метр.','12 м — это 12 плиток по 1 м.']},
     {k:'pick',q:'Хватит ли 18 плиток?',opts:['Хватит','Не хватит'],ok:0,hints:['Сравни: нужно 12, а есть 18.','18 больше 12?'],why:{ok:'18 больше 12',no:['18 меньше 12']},board:BL('P = (4 + 2) · 2 = 12 (м)')+BL('Нужно 12 плиток, есть 18.')+BL('Ответ: 18 плиток хватит (останется 6 плиток).')});return t})()]}
]};

PAGES.wb[35]={lesson:'Уроки 37–38. Деление на 1, на само число, деление 0',rule:RULE_D01,ex:[
 {n:1,title:'Сравни',text:'Сравни.',rule:RULE_D01,items:[
   signRaw('37 : 1','0 : 37','>',['37 : 1 — сколько? А 0 : 37?','37 : 1 = 37, 0 : 37 = 0.'],{ok:'37 больше 0',no:['Они равны']}),
   signRaw('0 · 99','0 : 99','=',['0 · 99 = ? И 0 : 99 = ?','И там, и там — 0.'],{ok:'И там, и там 0',no:['Умножение всегда больше']}),
   signRaw('54 см + 1 см','54 см : 1','>',['54 + 1 = ? А 54 : 1 = ?','55 см и 54 см.'],{ok:'55 см больше 54 см',no:['Они равны']}),
   signRaw('1 м 5 дм : 1','1 м 5 дм · 0','>',['Число : 1 = само число. Число · 0 = 0.','1 м 5 дм и 0.'],{ok:'1 м 5 дм больше 0',no:['Они равны']})]},
 {n:2,title:'Найди значения выражений',text:'Найди значения выражений.',rule:RULE_D01+RULE_ORDER,items:[
   valueItem('1 · 8 − 0 : 23',{}),valueItem('0 : 64 + 48 : 6',{}),valueItem('81 − 25 : 1 : 5',{}),valueItem('72 : 9 : 1',{}),valueItem('52 : 1 − 36 : 6',{}),valueItem('7 · 7 + 0 : 34',{}),valueItem('(80 + 54 : 54) : 9',{}),valueItem('0 : (54 + 39)',{})]},
 {n:3,title:'Ящики с яблоками',text:'Масса одного ящика с яблоками 5 кг. Сколько килограммов яблок в 6 таких ящиках?',rule:RULE_PROP,items:[
   taskItem({top:BL(kTable(['Масса 1 ящика (кг)','Количество ящиков (шт.)','Масса всех (кг)'],[['5','6','?']])),
     acts:[{q:'Как узнать массу 6 ящиков?',opts:['5 + 6','5 · 6','6 − 5'],ok:1,hints:['В каждом из 6 ящиков по 5 кг.','По 5 взять 6 раз.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[5,'·',6],u:'(кг)'}],
     answer:{q:'Ответ: сколько кг яблок?',ok:30,text:'30 кг яблок в 6 ящиках.'}})]},
 {n:4,title:'Рейсы водителя',text:'За 5 дней водитель выполнил 25 рейсов. Сколько рейсов он сделал за 3 дня, если по графику — одинаковое количество рейсов каждый день?',rule:RULE_PROP,items:[
   taskItem({top:n=>BL(kTable(['Рейсов в 1 день','Количество дней','Всего рейсов'],[[n>=1?'5':'?','5','25'],[n>=1?'5':'?','3',n>=2?'15':'?']])),
     acts:[{q:'Сначала сколько рейсов за 1 день. Как узнать?',opts:['25 − 5','25 : 5','25 · 5'],ok:1,hints:['25 рейсов за 5 дней поровну.','Всего делим на количество дней.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[25,':',5],u:'(р.)',lbl:'за 1 день'},
           {q:'Сколько рейсов за 3 дня?',opts:['5 + 3','5 · 3','25 − 3'],ok:1,hints:['Каждый из 3 дней — по 5 рейсов.','По 5 взять 3 раза.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[5,'·',3],u:'(р.)'}],
     answer:{q:'Ответ: сколько рейсов за 3 дня?',ok:15,text:'15 рейсов водитель сделал за 3 дня.'}})]},
 {n:5,title:'Котята и щенок на весах',text:'Во сколько раз щенок тяжелее котёнка, если масса котят одинаковая?',rule:RULE_SCALE,items:[
   taskItem({top:BL(`<div class="dials">${dial(6,'2 котёнка')}${dial(9,'щенок')}</div>`),
     pre:[{k:'num',q:'Сколько килограммов весят 2 котёнка вместе? Посмотри на стрелку.',ok:6,hints:['Стрелка на левых весах показывает вниз.','Внизу циферблата — число 6.']},
          {k:'num',q:'А сколько весит щенок?',ok:9,hints:['Посмотри на правые весы.','Стрелка показывает влево.']}],
     acts:[{q:'Сколько весит один котёнок?',opts:['6 : 2','6 − 2','6 · 2'],ok:0,hints:['2 котёнка весят одинаково.','6 кг делим поровну на 2.'],why:{ok:'Котята одинаковые — делим поровну',no:['Отнимаем одного котёнка']},calc:[6,':',2],u:'(кг)',lbl:'котёнок'},
           {q:'Во сколько раз щенок тяжелее котёнка?',opts:['9 − 3','9 : 3','9 + 3'],ok:1,hints:['«Во сколько раз» — какое действие?','Большее делим на меньшее.'],why:WHY_RATIO,calc:[9,':',3],u:''}],
     answer:{q:'Ответ: во сколько раз щенок тяжелее?',ok:3,text:'щенок тяжелее котёнка в 3 раза.'}})]}
]};

/* ===== Задачи «по … в каждом» — через К1 · К = ОК (как решают в классе), без схем-деревьев ===== */
const RULE_K=`<p>Решаем через таблицу <b>К1 · К = ОК</b>:</p><p><b>К1</b> — сколько в одном (букете, ряду…), <b>К</b> — сколько их, <b>ОК</b> — общее количество.</p><p>Знаем К1 и К → ОК = К1 · К. «Всего» в конце — складываем.</p>`;
function kGroups(o){
  const H=o.h;
  const tbl=(ok,showRows)=>`<table class="tblc ktab"><tr><th></th><th>К1<br><small>${H[0]}</small></th><th>К<br><small>${H[1]}</small></th><th>ОК<br><small>${H[2]}</small></th></tr>${o.rows.map((r,i)=>`<tr><th>${r.name}</th><td>${showRows[i]>=1?r.k1:''}</td><td>${showRows[i]>=2?r.k:''}</td><td>${ok[i]!=null?'<b>'+ok[i]+'</b>':showRows[i]>=2?'<b class="qq">?</b>':''}</td></tr>`).join('')}</table>${o.plus?`<p class="bl">${o.plus.name}: <b>${o.plus.v}</b></p>`:''}`;
  const filled=o.rows.map(()=>0),okv=o.rows.map(()=>null);
  const pre=[];
  o.rows.forEach((r,i)=>{
    pre.push({k:'num',q:`${r.q1} Это <b>К1</b>.`,ok:r.k1,hints:['Ищи в задаче слово «по»: число после него — это сколько в ОДНОМ.','«по 9 роз» — значит, в каждом букете 9.'],board:(filled[i]=1,BL(tbl(okv,filled.slice())))});
    pre.push({k:'num',q:`${r.q2} Это <b>К</b>.`,ok:r.k,hints:['Сколько их всего штук — букетов, рядов…?','Это число стоит перед словом «по».'],board:(filled[i]=2,BL(tbl(okv,filled.slice())))});
  });
  const steps=pre.slice();const lines=[];
  o.rows.forEach((r,i)=>{
    const ok=r.k1*r.k;
    steps.push({k:'pick',q:`${r.name}: как найти ОК — сколько всего?`,opts:shuffle([`${r.k1} · ${r.k}`,`${r.k1} + ${r.k}`,`${Math.max(r.k1,r.k)} − ${Math.min(r.k1,r.k)}`]),ok:-1,okv:`${r.k1} · ${r.k}`,hints:['Знаем К1 и К. Как найти ОК?','К1 · К = ОК — умножаем.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},
      board:BL(tbl(okv,filled.slice()))+lines.map(BL).join('')+BL(`${i+1}) <span class="ex">${r.k1} · ${r.k} = <b class="qq">?</b></span> ${o.u}`)});
    const cs=calcStep(r.k1,'·',r.k);okv[i]=ok;lines.push(`${i+1}) <span class="ex">${r.k1} · ${r.k} = ${ok}</span> ${o.u} — ${r.short||r.name.toLowerCase()}`);
    cs.board=BL(tbl(okv.slice(),filled.slice()))+lines.map(BL).join('');steps.push(cs);
  });
  const a=o.plus?o.plus.v:okv[0],b=o.plus?okv[0]:okv[1],n=o.rows.length+1,tot=a+b;
  steps.push({k:'pick',q:o.allQ,opts:shuffle([`${a} + ${b}`,`${Math.max(a,b)} − ${Math.min(a,b)}`,`${a} · ${b}`]),ok:-1,okv:`${a} + ${b}`,hints:['«Всего» — какое действие?','Соединяем обе части вместе.'],why:{ok:'«Всего» — складываем',no:['«Всего» — вычитаем']},
    board:BL(tbl(okv,filled))+lines.map(BL).join('')+BL(`${n}) <span class="ex">${a} + ${b} = <b class="qq">?</b></span> ${o.u}`)});
  const cs=calcStep(a,'+',b);lines.push(`${n}) <span class="ex">${a} + ${b} = ${tot}</span> ${o.u}`);
  cs.board=BL(tbl(okv,filled))+lines.map(BL).join('')+BL('Ответ: '+o.ans(tot));steps.push(cs);
  steps.forEach(st=>{if(st.okv){st.ok=st.opts.indexOf(st.okv)}});
  return {start:BL(tbl(okv.map(()=>null),o.rows.map(()=>0))),steps};
}
function setK(p,n,item){const ex=PAGES.wb[p].ex.find(e=>e.n===n);ex.items=[item];ex.rule=RULE_K}
setK(28,4,kGroups({h:['в одном букете','букетов','всего цветов'],u:'(цв.)',
  rows:[{name:'Розы',k1:9,k:5,short:'розы',q1:'Сколько роз в одном букете?',q2:'Сколько букетов с розами?'},{name:'Гладиолусы',k1:7,k:4,short:'гладиолусы',q1:'Сколько гладиолусов в одном букете?',q2:'Сколько букетов с гладиолусами?'}],allQ:'Как узнать, сколько всего цветов?',ans:t=>`${t} ${plural(t,'цветок','цветка','цветов')} было у продавца.`}));
setK(29,4,kGroups({h:['птенцов у одной','куропаток','всего птенцов'],u:'(пт.)',
  rows:[{name:'Серые',k1:8,k:7,short:'у серых',q1:'Сколько птенцов у одной серой куропатки?',q2:'Сколько серых куропаток?'},{name:'Белые',k1:3,k:6,short:'у белых',q1:'Сколько птенцов у одной белой куропатки?',q2:'Сколько белых куропаток?'}],allQ:'Как узнать, сколько всего птенцов?',ans:t=>`${t} ${plural(t,'птенец','птенца','птенцов')} у куропаток.`}));
setK(30,4,kGroups({h:['деревьев в ряду','рядов','всего елей'],u:'(д.)',
  rows:[{name:'Ели',k1:5,k:6,short:'ели',q1:'Сколько елей в одном ряду?',q2:'Сколько рядов елей?'}],plus:{name:'Сосны',v:63},allQ:'Как узнать, сколько всего деревьев (сосны и ели)?',ans:t=>`${t} ${plural(t,'дерево','дерева','деревьев')} посадил лесник.`}));

/* ===== Тетрадь: страницы 36–37 (уроки 39–40) ===== */
const RULE_10=`<p><b>Число · 10</b> — к числу приписываем <b>0</b>: 8 · 10 = 80.</p><p><b>Круглое число : 10</b> — убираем <b>0</b> в конце: 80 : 10 = 8.</p>`;
const PEN=t=>`<div class="pen">${t}</div>`;
/* вставь знак действия; alt — другие верные знаки */
function opItem(a,b,r,ok,alt,hints,why){
  const opts=['+','−','·',':'],okI=opts.indexOf(ok);
  const eq=s=>`<span class="cmp">${a} <span class="sbox${s?' on':''}">${s||'?'}</span> ${b} = ${r}</span>`;
  const board=BL(eq(ok)+(alt?` &nbsp;или&nbsp; `+`<span class="cmp">${a} <span class="sbox on">${alt}</span> ${b} = ${r}</span>`:''));
  return {start:BL(eq()),steps:[{k:'pick',q:'Какой знак поставить?',opts,ok:okI,alt:alt?[opts.indexOf(alt)]:null,signs:1,hints,why,board}],
    record:`${a} <span class="tk">${ok}</span> ${b} = ${r}`+(alt?` (или ${a} <span class="tk">${alt}</span> ${b} = ${r})`:'')};
}
const OP_H=['Ответ больше первого числа или меньше? Сильно или чуть-чуть?','Попробуй по очереди каждый знак: +, −, ·, : — и посчитай.'];
/* действия с единицами длины: шаги по одному, в конце — дм и см */
function lenItem(expr,seq,fin){
  const head=BL(expr+' = <b class="qq">?</b>');const lines=[];const steps=[];
  seq.forEach(s=>{const st=s.st;if(s.line){lines.push(s.line)}st.board=head+lines.map(BL).join('');steps.push(st)});
  const res=`${fin.dm} дм ${fin.cm} см`;
  steps.push({k:'nums',q:`Запиши ответ: ${fin.r} см = ? дм ? см`,fields:[{u:'дм',ok:fin.dm},{u:'см',ok:fin.cm}],hints:['1 дм = 10 см. Сколько целых десятков в числе?',`Десятки — это дециметры, единицы — сантиметры.`],board:head.replace('<b class="qq">?</b>',res)+lines.map(BL).join('')});
  return {start:head,steps,record:expr+' = '+res+lines.filter(l=>!/^Сначала/.test(l)).map(PEN).join('')};
}
const DM_H=n=>[`1 дм = 10 см.`,`${n} дм — это ${n} раз по 10 см.`];
/* сравни: считаем обе части, потом знак */
function cmpItem(L,Rr,hintsSign){
  const val=x=>/[+−·:]/.test(String(x))?orderOf(x).pop().r:+x;
  const lv=val(L),rv=val(Rr),sg=lv<rv?'<':lv>rv?'>':'=',sh={'<':'&lt;','>':'&gt;','=':'='}[sg];
  const lines=[];const steps=[];
  const show=(x,v)=>exprHTML(String(x))+(v!=null?` <span class="tk">= ${v}</span>`:'');
  const head=(a,b,s)=>BL(`<span class="cmp">${show(L,a)} <span class="sbox${s?' on':''}">${s||'?'}</span> ${show(Rr,b)}</span>`);
  let lval=null,rval=null;
  [[L,'Левая часть'],[Rr,'Правая часть']].forEach(([x,nm],side)=>{
    if(!/[+−·:]/.test(String(x)))return;
    const acts=orderOf(String(x));
    acts.forEach((y,n)=>{const st=calcStep(y.a,y.o,y.b,`${nm}, <span class="cn">${CIRC[n+1]}</span>`);
      lines.push(`${nm}: <span class="cn">${CIRC[n+1]}</span> <span class="ex">${y.a} ${y.o} ${y.b} = ${y.r}</span>`);
      if(n===acts.length-1){if(side)rval=y.r;else lval=y.r}
      st.board=head(lval,rval)+lines.map(BL).join('');steps.push(st)});
  });
  const word={'<':'меньше','>':'больше','=':'равно'};
  steps.push({k:'pick',q:`${lv} и ${rv}. Какой знак поставить?`,opts:['&lt;','&gt;','='],ok:['<','>','='].indexOf(sg),signs:1,
    hints:hintsSign||['Какое число больше?','Острый «клювик» смотрит на меньшее число.'],
    why:{ok:`${lv} ${word[sg]} ${rv}`,no:[`${lv} ${sg==='<'?'больше':'меньше'} ${rv}`]},board:head(lv,rv,sh)+lines.map(BL).join('')});
  const pl=[];if(/[+−·:]/.test(String(L)))pl.push(PEN(`${exprHTML(String(L))} = ${lv}`));if(/[+−·:]/.test(String(Rr)))pl.push(PEN(`${exprHTML(String(Rr))} = ${rv}`));
  return {start:head(),steps,record:`${exprHTML(String(L))} <span class="tk">${sh}</span> ${exprHTML(String(Rr))}`+pl.join('')};
}
/* таблица К1 / К / ОК для задач «было … в одинаковых …» */
function kRowsTask(o){
  const H=o.h,R=[['','',''],['','','']];
  const tb=()=>BL(`<table class="tblc ktab"><tr><th></th><th>К1<br><small>${H[0]}</small></th><th>К<br><small>${H[1]}</small></th><th>ОК<br><small>${H[2]}</small></th></tr>${o.names.map((nm,i)=>`<tr><th>${nm}</th>${R[i].map(c=>`<td>${c===''?'':c==='?'?'<b class="qq">?</b>':'<b>'+c+'</b>'}</td>`).join('')}</tr>`).join('')}</table>`);
  const pre=[];
  o.fill.forEach(f=>{pre.push(Object.assign({k:'num'},f.st,{board:(R[f.r][f.c]=f.st.ok,tb())}))});
  pre.push({k:'pick',q:`«${o.names[1]}»: К1 — сколько в одном?`,opts:['Столько же, как в первой строке','Другое число'],ok:0,hints:['Ящики (ряды) одинаковые?','В одинаковых — поровну, одно и то же количество.'],why:{ok:'Они одинаковые',no:['Их меньше']},board:(R[0][0]='?',R[1][0]='?',R[1][2]='?',tb())});
  const t=taskItem({top:n=>{R[0][0]=R[1][0]=n>=1?o.k1:'?';R[1][2]=n>=2?o.ok2:'?';return tb()},pre:(o.extra||[]),acts:o.acts,answer:o.answer});
  t.start=(R[0][0]=R[1][0]=R[1][2]='',R[0][1]=R[0][2]=R[1][1]='',tb());
  /* pre табличные шаги должны идти до taskItem-шагов */
  t.steps=pre.concat(t.steps);return t;
}

PAGES.wb[36]={lesson:'Урок 39. Умножение и деление с числом 10',rule:RULE_10,ex:[
 {n:1,title:'Вставь знаки действий',text:'Вставь знаки действий (+, −, ·, :), чтобы равенства были верными.',rule:RULE_10+RULE_01+RULE_D01,items:[
   opItem(8,10,80,'·',null,['80 намного больше 8. Во сколько раз?','Число · 10 — приписываем 0.'],{ok:'8 увеличили в 10 раз',no:['К 8 прибавили 10']}),
   opItem(80,80,1,':',null,['Одинаковые числа, а получилась 1.','Число : само себя = ?'],{ok:'Число : само себя = 1',no:['80 − 80 = 1']}),
   opItem(80,0,0,'·',null,['Получился 0. С каким знаком число и 0 дают 0?','Число · 0 = ?'],{ok:'Число · 0 = 0',no:['Число − 0 = 0']}),
   opItem(1,80,80,'·',null,['Получилось второе число — 80.','1 · число = ?'],{ok:'1 · число = само число',no:['1 + 80 = 80']}),
   opItem(80,1,80,':','·',['Число не изменилось. Что можно сделать с 1, чтобы число не изменилось?','Число · 1 = число. А число : 1 = ?'],{ok:'· 1 и : 1 — число не меняется',no:['80 − 1 = 80'],q:'Почему подходит этот знак?'}),
   opItem(0,80,0,':','·',['Сначала 0, в ответе 0.','0 · число = 0. А 0 : число = ?'],{ok:'0 · число и 0 : число — это 0',no:['0 + 80 = 0'],q:'Почему подходит этот знак?'}),
   opItem(80,10,90,'+',null,['90 чуть-чуть больше 80. На сколько?','90 − 80 = 10.'],{ok:'90 больше 80 на 10',no:['80 · 10 = 90']}),
   opItem(80,10,8,':',null,['8 намного меньше 80. Во сколько раз?','Круглое число : 10 — убираем 0.'],{ok:'80 уменьшили в 10 раз',no:['80 − 10 = 8']})]},
 {n:2,title:'Найди значения выражений',text:'Найди значения выражений.',rule:RULE_10+RULE_ORDER,items:[
   valueItem('54 : 6 · (70 : 7)',{}),valueItem('5 · 10 + 74 · 0',{}),valueItem('(38 : 1 + 11) : 7',{}),valueItem('4 · 10 : 5 · 1',{}),
   valueItem('30 : (40 : 4) · 8',{}),valueItem('42 : (54 − 47 · 1)',{}),valueItem('0 : 8 + 4 · 10',{}),valueItem('60 : 10 − 0 : 34',{})]},
 {n:3,title:'Выполни действия (дм и см)',text:'Выполни действия.',rule:RULE_10+RULE_UNITS,items:[
   lenItem('35 см + 4 см · 10',[
     {st:{k:'pick',q:'Какое действие делаем первым?',opts:['35 см + 4 см','4 см · 10'],ok:1,hints:['Скобок нет. Что раньше — сложение или умножение?','Сначала умножение.'],why:{ok:'Сначала умножение',no:['Сначала то, что слева']}}},
     {st:calcStep(4,'·',10,'①'),line:'① <span class="ex">4 · 10 = 40</span> см'},
     {st:calcStep(35,'+',40,'②'),line:'② <span class="ex">35 + 40 = 75</span> см'}],{r:75,dm:7,cm:5}),
   lenItem('9 дм − 60 см : 10 − 3 дм 7 см',[
     {st:{k:'pick',q:'Какое действие делаем первым?',opts:['9 дм − 60 см','60 см : 10','… − 3 дм 7 см'],ok:1,hints:['Скобок нет. Ищи умножение или деление.','Знак «:» — первое действие.'],why:{ok:'Сначала деление',no:['Сначала то, что слева']}}},
     {st:calcStep(60,':',10,'①'),line:'① <span class="ex">60 : 10 = 6</span> см'},
     {st:{k:'num',q:'Переведём в сантиметры. 9 дм = <b class="qq">?</b> см',ok:90,hints:DM_H(9)},line:'9 дм = 90 см'},
     {st:calcStep(90,'−',6,'②'),line:'② <span class="ex">90 − 6 = 84</span> см'},
     {st:{k:'num',q:'3 дм 7 см = <b class="qq">?</b> см',ok:37,hints:['3 дм = 30 см. И ещё 7 см.','30 + 7 = ?']},line:'3 дм 7 см = 37 см'},
     {st:calcStep(84,'−',37,'③'),line:'③ <span class="ex">84 − 37 = 47</span> см'}],{r:47,dm:4,cm:7}),
   lenItem('5 см · 10 + 2 дм 4 см − 38 см',[
     {st:{k:'pick',q:'Какое действие делаем первым?',opts:['5 см · 10','… + 2 дм 4 см','… − 38 см'],ok:0,hints:['Скобок нет. Ищи умножение или деление.','Знак «·» — первое действие.'],why:{ok:'Сначала умножение',no:['Сначала сложение']}}},
     {st:calcStep(5,'·',10,'①'),line:'① <span class="ex">5 · 10 = 50</span> см'},
     {st:{k:'num',q:'2 дм 4 см = <b class="qq">?</b> см',ok:24,hints:['2 дм = 20 см. И ещё 4 см.','20 + 4 = ?']},line:'2 дм 4 см = 24 см'},
     {st:calcStep(50,'+',24,'②'),line:'② <span class="ex">50 + 24 = 74</span> см'},
     {st:calcStep(74,'−',38,'③'),line:'③ <span class="ex">74 − 38 = 36</span> см'}],{r:36,dm:3,cm:6})]},
 {n:4,title:'Яблоки в ящиках',text:'У продавца было 56 кг яблок в 7 одинаковых ящиках и 32 кг апельсинов. Четыре ящика с яблоками продали. Сколько килограммов яблок осталось?',rule:RULE_K,items:[
   kRowsTask({h:['кг в 1 ящике','ящиков','всего кг'],names:['Было','Продали'],k1:8,ok2:32,
     fill:[{r:0,c:1,st:{q:'Строка «Было». Сколько ящиков с яблоками? Это <b>К</b>.',ok:7,hints:['Найди в задаче слово «ящиках».','Сколько одинаковых ящиков было?']}},
           {r:0,c:2,st:{q:'Сколько всего килограммов яблок было? Это <b>ОК</b>.',ok:56,hints:['Сколько кг яблок было у продавца?','Это число стоит перед словом «яблок».']}},
           {r:1,c:1,st:{q:'Строка «Продали». Сколько ящиков продали? Это <b>К</b>.',ok:4,hints:['Сколько ящиков с яблоками продали?','Число написано словом: «Четыре».']}}],
     extra:[{k:'pick',q:'А 32 кг апельсинов нужны, чтобы ответить на вопрос?',opts:['Нет, спрашивают про яблоки','Да, их надо вычесть'],ok:0,hints:['Прочитай вопрос: про что спрашивают?','Апельсины не продавали и не спрашивают о них.'],why:{ok:'Вопрос только про яблоки',no:['Апельсины тоже яблоки']}}],
     acts:[{q:'Сколько кг в одном ящике? Как найти К1?',opts:['56 : 7','56 − 7','56 · 7'],ok:0,hints:['56 кг лежат в 7 ящиках поровну.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[56,':',7],u:'(кг)',lbl:'в 1 ящике'},
           {q:'Сколько кг яблок продали?',opts:['8 + 4','8 · 4','56 − 4'],ok:1,hints:['Продали 4 ящика по 8 кг.','К1 · К = ОК.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[8,'·',4],u:'(кг)',lbl:'продали'},
           {q:'Сколько кг яблок осталось?',opts:['56 − 32','56 + 32','32 − 8'],ok:0,hints:['Было 56 кг, а 32 кг продали.','Было − продали = осталось.'],why:{ok:'Было − продали = осталось',no:['Было + продали = осталось']},calc:[56,'−',32],u:'(кг)',lbl:'осталось'}],
     answer:{q:'Ответ: сколько кг яблок осталось?',ok:24,text:'24 кг яблок осталось.'}})]},
 {n:5,title:'Четыре остроугольных треугольника',text:'Раздели фигуру на 4 остроугольных треугольника.',rule:RULE_TRI,items:[
   {start:BL('Раздели фигуру на 4 остроугольных треугольника.'),steps:[
     anglePick('Какие углы должны быть у остроугольного треугольника? Выбери такой угол.','острый',{ok:'Остроугольный — все углы острые',no:['Хватит одного острого угла']},['Посмотри на слово: остро-угольный.','Острый угол меньше уголка тетради.']),
     {k:'pick',q:'Как проверить, что угол острый?',opts:['Приложить уголок тетради','Посмотреть на глаз'],ok:0,hints:['Глаз может обмануть.','С чем сравнивают угол — прямой он, острый или тупой?'],why:{ok:'Уголок тетради — прямой угол',no:['На глаз точнее']}},
     {k:'num',q:'Сколько треугольников должно получиться?',ok:4,hints:['Прочитай задание ещё раз.','Число написано в задании цифрой.']},
     {k:'note',q:'Проведи в фигуре отрезки по линейке, чтобы получилось столько треугольников. Каждый угол проверь уголком тетради. Если какой-то угол прямой или тупой — попробуй провести отрезки по-другому.',btn:'Разделила',board:BL('Фигура разделена на 4 треугольника, все углы острые.')}],
    record:'Фигура разделена на 4 треугольника, у каждого все углы острые.'}]}
]};

PAGES.wb[37]={lesson:'Урок 40. Закрепление',rule:RULE_10,ex:[
 {n:1,title:'Заполни таблицу a : b',text:'Заполни таблицу: найди a : b.',rule:RULE_10+RULE_D01,items:[
   (()=>{const P=[[30,10],[27,1],[0,54],[14,14]];const res=P.map(()=>null);
     const tb=q=>BL(`<table class="tblc"><tr><th>a</th>${P.map(p=>`<td>${p[0]}</td>`).join('')}</tr><tr><th>b</th>${P.map(p=>`<td>${p[1]}</td>`).join('')}</tr><tr><th>a : b</th>${res.map((r,i)=>`<td>${r!=null?'<b>'+r+'</b>':i===q?'<b class="qq">?</b>':''}</td>`).join('')}</tr></table>`);
     const steps=P.map(([a,b],i)=>{const st=calcStep(a,':',b);st.board=(res[i]=a/b,tb(i+1));return st});
     res.fill(null);const start=tb(0);P.forEach(([a,b],i)=>res[i]=a/b);
     return {start,steps,record:tb(-1).replace(/^<div class="bl">|<\/div>$/g,'')}})()]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_10+RULE_01+RULE_D01+RULE_ORDER,items:[
   valueItem('3 · 10 · 1',{}),valueItem('60 : 10 · 1',{}),valueItem('30 : 10 · 1 + 63',{}),valueItem('99 · 0 + 10 · 4',{}),
   valueItem('74 − (45 − 35) · 4',{}),valueItem('1 · 46 + 23 · 0',{}),valueItem('54 : (9 · 8 − 18)',{}),valueItem('1 · 100 − 60 : 6',{})]},
 {n:3,title:'Сравни',text:'Сравни. Сначала посчитай обе части.',rule:RULE_10+RULE_01+RULE_D01+'<p>Посчитай левую и правую часть, потом сравни числа.</p>',items:[
   cmpItem('81 : 9 + 0 : 37','36 : 4 · 0 + 12'),cmpItem('56 : 8 · 1 + 59','90 : 10 · 5 + 50'),cmpItem('70 : 10 · 8','10 · 3 : 5 · 1'),
   cmpItem('100 : 1 · 0','4'),cmpItem('35 : 7 · 1','40 : 8 · 0'),cmpItem('56 : 8 · 10','100 − 30 · 0')]},
 {n:4,title:'Деревья в рядах',text:'В семи рядах растёт 70 деревьев, поровну в каждом ряду. На сколько деревьев меньше в 4 таких рядах, чем в семи?',rule:RULE_K,items:[
   kRowsTask({h:['деревьев в 1 ряду','рядов','всего деревьев'],names:['7 рядов','4 ряда'],k1:10,ok2:40,
     fill:[{r:0,c:1,st:{q:'Первая строка. Сколько рядов? Это <b>К</b>.',ok:7,hints:['«В семи рядах…»','Число написано словом: «семи».']}},
           {r:0,c:2,st:{q:'Сколько всего деревьев в этих рядах? Это <b>ОК</b>.',ok:70,hints:['Сколько деревьев растёт в семи рядах?','Это самое большое число в задаче.']}},
           {r:1,c:1,st:{q:'Вторая строка. Сколько рядов? Это <b>К</b>.',ok:4,hints:['«…в 4 таких рядах…»','Это число стоит перед словом «таких».']}}],
     acts:[{q:'Сколько деревьев в одном ряду? Как найти К1?',opts:['70 − 7','70 : 7','70 · 7'],ok:1,hints:['70 деревьев в 7 рядах поровну.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[70,':',7],u:'(д.)',lbl:'в 1 ряду'},
           {q:'Сколько деревьев в 4 рядах?',opts:['10 + 4','10 · 4','70 − 4'],ok:1,hints:['4 ряда по 10 деревьев.','К1 · К = ОК.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[10,'·',4],u:'(д.)',lbl:'в 4 рядах'},
           {q:'На сколько меньше в 4 рядах, чем в семи?',opts:['70 : 40','70 − 40','70 + 40'],ok:1,hints:['«На сколько меньше» — какое действие?','Из большего вычитаем меньшее.'],why:WHY_DIFF,calc:[70,'−',40],u:'(д.)'}],
     answer:{q:'Ответ: на сколько деревьев меньше?',ok:30,text:'на 30 деревьев меньше в 4 рядах, чем в семи.'}})]},
 {n:5,title:'Прямоугольник из двух треугольников',text:'Из двух одинаковых прямоугольных треугольников со сторонами 3 см, 4 см и 5 см сложили прямоугольник. Начерти его и найди его периметр.',rule:RULE_PER,items:[
   (()=>{const t=taskItem({top:'',
     pre:[anglePick('Треугольники прямоугольные. Какой угол есть у каждого?','прямой',{ok:'Прямоугольный — есть прямой угол',no:['Прямоугольный — все углы острые']},['Посмотри на слово: прямо-угольный.','Какой угол похож на уголок тетради?']),
          {k:'nums',q:'Выпиши из задания длины сторон треугольника.',fields:[{ok:3,u:'см,'},{ok:4,u:'см,'},{ok:5,u:'см'}],hints:['В задании после слов «со сторонами».','Там три числа.']},
          {k:'pick',q:'Какие две стороны треугольника образуют прямой угол?',opts:['3 см и 4 см','4 см и 5 см','3 см и 5 см'],ok:0,hints:['Самая длинная сторона лежит напротив прямого угла.','Найди самую длинную — две другие у прямого угла.'],why:{ok:'Самая длинная — напротив прямого угла',no:['Самая длинная — у прямого угла']}},
          {k:'note',q:'Сложи два таких треугольника длинными сторонами — получится прямоугольник. Начерти его в тетради по линейке и по клеточкам: стороны — те, что у прямого угла. Проведи отрезок из угла в угол.',btn:'Начертила'},
          {k:'num',q:'Измерь линейкой отрезок из угла в угол. Сколько сантиметров?',ok:5,hints:['Приложи 0 линейки к одному углу.','Это длинная сторона треугольника — сравни с заданием.']},
          {k:'pick',q:'Какие стороны у прямоугольника?',opts:['4 см и 3 см','4 см и 5 см','5 см и 3 см'],ok:0,hints:['Отрезок 5 см проходит внутри, из угла в угол.','Стороны — это края прямоугольника.'],why:{ok:'5 см — внутри, это не сторона',no:['5 см — тоже сторона']}},
          {k:'pick',q:'Как найти периметр прямоугольника?',opts:['4 · 3','(4 + 3) · 2','4 + 3 + 5'],ok:1,hints:['Периметр — длина всех сторон вместе.','2 длины и 2 ширины.'],why:{ok:'2 длины и 2 ширины',no:['1 длина и 1 ширина']}}],
     acts:[{q:'Что считаем первым?',opts:['4 + 3','4 · 3','4 − 3'],ok:0,hints:['Действие в скобках.','4 + 3.'],why:{ok:'Сначала скобки',no:['Сначала умножение']},calc:[4,'+',3],u:'(см)'},
           {q:'Теперь умножаем на 2',opts:['7 · 2','7 + 2','7 : 2'],ok:0,hints:['Длина и ширина есть по 2 раза.','7 · 2.'],why:{ok:'Половину периметра — 2 раза',no:['Делим пополам']},calc:[7,'·',2],u:'(см)',lbl:'периметр'}],
     answer:{q:'Ответ: чему равен периметр (см)?',ok:14,text:'периметр прямоугольника 14 см.'}});return t})()]}
]};

/* стр. 35: таблицы заполняет сама */
PAGES.wb[35].ex[3].rule=RULE_K;
PAGES.wb[35].ex[3].items=[kRowsTask({h:['рейсов в 1 день','дней','всего рейсов'],names:['5 дней','3 дня'],k1:5,ok2:15,
  fill:[{r:0,c:1,st:{q:'Первая строка. Сколько дней? Это <b>К</b>.',ok:5,hints:['«За … дней водитель выполнил…»','Найди число перед словом «дней».']}},
        {r:0,c:2,st:{q:'Сколько всего рейсов за эти дни? Это <b>ОК</b>.',ok:25,hints:['Сколько рейсов выполнил водитель?','Число перед словом «рейсов».']}},
        {r:1,c:1,st:{q:'Вторая строка. За сколько дней надо узнать? Это <b>К</b>.',ok:3,hints:['Прочитай вопрос задачи.','«Сколько рейсов он сделал за … дня?»']}}],
  acts:[{q:'Сколько рейсов в 1 день? Как найти К1?',opts:['25 − 5','25 : 5','25 · 5'],ok:1,hints:['25 рейсов за 5 дней поровну.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[25,':',5],u:'(р.)',lbl:'за 1 день'},
        {q:'Сколько рейсов за 3 дня?',opts:['5 + 3','5 · 3','25 − 3'],ok:1,hints:['Каждый из 3 дней — по 5 рейсов.','К1 · К = ОК.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[5,'·',3],u:'(р.)'}],
  answer:{q:'Ответ: сколько рейсов за 3 дня?',ok:15,text:'15 рейсов водитель сделал за 3 дня.'}})];
PAGES.wb[35].ex[2].rule=RULE_K;
PAGES.wb[35].ex[2].items=[(()=>{const R=['','',''];
  const tb=()=>BL(`<table class="tblc ktab"><tr><th>К1<br><small>кг в 1 ящике</small></th><th>К<br><small>ящиков</small></th><th>ОК<br><small>всего кг</small></th></tr><tr>${R.map(c=>`<td>${c===''?'':c==='?'?'<b class="qq">?</b>':'<b>'+c+'</b>'}</td>`).join('')}</tr></table>`);
  const pre=[{k:'num',q:'Сколько кг в одном ящике? Это <b>К1</b>.',ok:5,hints:['«Масса одного ящика…»','Число перед «кг».']},{k:'num',q:'Сколько ящиков? Это <b>К</b>.',ok:6,hints:['Прочитай вопрос задачи.','«…в … таких ящиках?»']}];
  pre[0].board=(R[0]=5,tb());pre[1].board=(R[1]=6,R[2]='?',tb());
  const t=taskItem({top:n=>(R[2]=n>=1?30:'?',tb()),pre:[],acts:[{q:'Как найти ОК — массу всех ящиков?',opts:['5 + 6','5 · 6','6 − 5'],ok:1,hints:['В каждом из 6 ящиков по 5 кг.','К1 · К = ОК.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[5,'·',6],u:'(кг)'}],
    answer:{q:'Ответ: сколько кг яблок?',ok:30,text:'30 кг яблок в 6 ящиках.'}});
  R[0]=R[1]=R[2]='';t.start=tb();t.steps=pre.concat(t.steps);return t})()];

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

/* ===== Тетрадь: страницы 38–47 ===== */
const RULE_TENS=`<p><b>Десятки</b> умножаем и делим как простые числа: 40 · 2 = 4 дес. · 2 = 8 дес. = 80.</p><p>60 : 20 = 6 дес. : 2 дес. = 3.</p><p>Число делится на 10 без остатка, если оно оканчивается на <b>0</b>.</p>`;
const UNIT_H=['Переведи в одинаковые единицы: 1 м = 10 дм, 1 дм = 10 см, 1 ч = 60 мин.','Посчитай по шагам, что получилось.'];

PAGES.wb[38]={lesson:'Урок 41. Умножение и деление десятков',rule:RULE_TENS,ex:[
 {n:1,title:'Подчеркни числа, которые делятся на 10',text:'Подчеркни числа, которые без остатка делятся на 10.',rule:RULE_TENS,items:[
   multiItem('Нажми на все числа, которые делятся на 10 без остатка, потом нажми «Проверить».',['67','90','36','54','80','70','21','30','57'],[1,4,5,8],['Какой цифрой оканчиваются круглые числа?','Смотри на последнюю цифру каждого числа.'],{extra:'Отмечено лишнее. Посмотри на последнюю цифру.',miss:'Отмечены не все. Проверь каждое число.',none:'Ничего не отмечено.'})]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_TENS+RULE_ORDER,items:[
   valueItem('40 · 2',{}),valueItem('60 : 20',{}),valueItem('30 · 3',{}),valueItem('80 : 40',{}),
   valueItem('8 · 10 : 4 + 58',{}),valueItem('90 : 30 · 6 + 36',{}),valueItem('60 : 3 + 17 · 1',{}),valueItem('20 · 4 − 30 · 2',{})]},
 {n:3,title:'Сравни (единицы)',text:'Сравни.',rule:'<p>Сначала посчитай каждую часть и переведи в одинаковые единицы.</p><p>1 м = 10 дм, 1 дм = 10 см, 1 ч = 60 мин.</p>',items:[
   cmpU('8 дм · 10','2 м · 4',[{q:'8 дм · 10 = ? дм',ok:80,line:'8 дм · 10 = 80 дм'},{q:'2 м = ? дм',ok:20,line:'2 м = 20 дм'},{q:'20 дм · 4 = ? дм',ok:80,line:'20 дм · 4 = 80 дм'}],'=',{ok:'80 дм = 80 дм',no:['80 дм больше 80 дм']}),
   cmpU('1 · 12 мин','1 ч : 10',[{q:'1 · 12 мин = ? мин',ok:12,line:'1 · 12 мин = 12 мин'},{q:'1 ч = ? мин',ok:60,line:'1 ч = 60 мин'},{q:'60 мин : 10 = ? мин',ok:6,line:'60 мин : 10 = 6 мин'}],'>',{ok:'12 мин больше 6 мин',no:['12 мин меньше 6 мин']}),
   cmpU('90 дм : 3','5 дм · 6',[{q:'90 дм : 3 = ? дм',ok:30,line:'90 дм : 3 = 30 дм'},{q:'5 дм · 6 = ? дм',ok:30,line:'5 дм · 6 = 30 дм'}],'=',{ok:'30 дм = 30 дм',no:['30 дм меньше 30 дм']}),
   cmpU('9 дм : 10','4 дм 7 см : 47',[{q:'9 дм = ? см',ok:90,line:'9 дм = 90 см'},{q:'90 см : 10 = ? см',ok:9,line:'90 см : 10 = 9 см'},{q:'4 дм 7 см = ? см',ok:47,line:'4 дм 7 см = 47 см'},{q:'47 см : 47 = ? см',ok:1,line:'47 см : 47 = 1 см'}],'>',{ok:'9 см больше 1 см',no:['9 см меньше 1 см']}),
   cmpU('7 дм : 7 + 15 см','1 м − 4 дм 8 см',[{q:'7 дм : 7 = ? дм',ok:1,line:'7 дм : 7 = 1 дм = 10 см'},{q:'10 см + 15 см = ? см',ok:25,line:'10 см + 15 см = 25 см'},{q:'1 м = ? см',ok:100,line:'1 м = 100 см'},{q:'4 дм 8 см = ? см',ok:48,line:'4 дм 8 см = 48 см'},{q:'100 см − 48 см = ? см',ok:52,line:'100 см − 48 см = 52 см'}],'<',{ok:'25 см меньше 52 см',no:['25 см больше 52 см']}),
   cmpU('50 см · 2','30 см · 3',[{q:'50 см · 2 = ? см',ok:100,line:'50 см · 2 = 100 см'},{q:'30 см · 3 = ? см',ok:90,line:'30 см · 3 = 90 см'}],'>',{ok:'100 см больше 90 см',no:['100 см меньше 90 см']})]},
 {n:4,title:'Сосна и клён',text:'От дома до сосны — 90 м, а до клёна — в 3 раза ближе. На сколько метров ближе от дома до клёна, чем до сосны?',rule:RULE_SCALE,items:[
   recTask({rows:[{l:'До сосны',q:'Сколько метров от дома до сосны?',ok:90,v:'90 м'},{l:'До клёна',q:'Во сколько раз ближе клён?',ok:3,v:'в 3 раза ближе',at:1,vAt:'30 м'}],
     acts:[{q:'Сколько метров до клёна?',opts:['90 − 3','90 : 3','90 · 3'],ok:1,hints:['Клён в 3 раза ближе — расстояние меньше в 3 раза.','«В … раз меньше» — делим.'],why:{ok:'«В 3 раза ближе» — делим',no:['«В 3 раза ближе» — вычитаем 3']},calc:[90,':',3],u:'(м)',lbl:'до клёна'},
           {q:'На сколько метров ближе до клёна?',opts:['90 : 30','90 − 30','90 + 30'],ok:1,hints:['«На сколько» — какое действие?','Из большего вычитаем меньшее.'],why:WHY_DIFF,calc:[90,'−',30],u:'(м)'}],
     answer:{q:'Ответ: на сколько метров ближе?',ok:60,text:'на 60 м ближе от дома до клёна, чем до сосны.'}})]},
 {n:5,title:'Периметры треугольника и прямоугольника',text:'Длина каждой стороны треугольника VFE равна 30 см. Длина прямоугольника 3 см, а ширина 2 см. Во сколько раз периметр треугольника больше периметра прямоугольника?',rule:RULE_P,items:[
   taskItem({top:'',acts:[
     {q:'Периметр треугольника VFE: у него 3 одинаковые стороны. Как найти?',opts:['30 · 3','30 + 3','30 · 4'],ok:0,hints:['Сколько сторон у треугольника?','Каждая по 30 см.'],why:{ok:'3 стороны по 30 см',no:['4 стороны по 30 см']},calc:[30,'·',3],u:'(см)',lbl:'P треугольника'},
     ...perSteps(3,2),
     {q:'Во сколько раз периметр треугольника больше?',opts:['90 − 10','90 : 10','90 + 10'],ok:1,hints:['«Во сколько раз» — какое действие?','Большее делим на меньшее.'],why:WHY_RATIO,calc:[90,':',10],u:''}],
     answer:{q:'Ответ: во сколько раз больше?',ok:9,text:'периметр треугольника больше периметра прямоугольника в 9 раз.'}})]}
]};

PAGES.wb[39]={lesson:'Урок 42. Распределительное свойство умножения. Периметр прямоугольника',rule:RULE_DIST,ex:[
 {n:1,title:'Подчеркни верные равенства',text:'Подчеркни верные равенства.',rule:RULE_DIST,items:[
   multiItem('Нажми на верные равенства, потом «Проверить».',['(9 + 6) · 2 = 9 · 2 + 2 · 7','3 · 4 + 6 · 4 = (3 + 6) · 4','(4 + 12) · 7 = 4 · 7 + 12 · 7','(5 + 6) · 9 = 5 · 9 + 6 · 8'],[1,2],['Каждое слагаемое из скобок умножаем на одно и то же число.','Проверь: справа те же числа, что слева? Везде ли одинаковый множитель?'],{extra:'Отмечено лишнее. Проверь множители справа.',miss:'Отмечены не все.',none:'Ничего не отмечено.'},'<br>')]},
 {n:2,title:'Сравни, не вычисляя',text:'Сравни, не вычисляя.',rule:RULE_DIST,items:[
   Object.assign(signItem('(7 + 4) · 10','7 · 10 + 4','>',['Слева на 10 умножаем и 7, и 4. А справа?','Справа 4 не умножили на 10.']),{}),
   signItem('8 · (6 + 5)','8 · 6 + 8 · 7','<',['8 · (6 + 5) = 8 · 6 + 8 · 5. Сравни с правой частью.','8 · 5 и 8 · 7 — что больше?']),
   signItem('3 · 6 + 3 · 2','(6 + 2) · 3','=',['Вынеси 3 за скобки в левой части.','3 · 6 + 3 · 2 = (6 + 2) · 3?']),
   signItem('(30 + 5) · 7','7 · (30 + 5)','=',['Множители поменяли местами.','От перестановки множителей произведение не меняется.'])].map((it,i)=>{it.steps[0].why=[{ok:'Справа 4 не умножили на 10',no:['Это одно и то же']},{ok:'8 · 5 меньше 8 · 7',no:['8 · 5 больше 8 · 7']},{ok:'Одинаковое число 3 вынесли за скобки',no:['Скобки меняют ответ']},{ok:'Множители переставили',no:['Порядок множителей важен']}][i];return it})},
 {n:3,title:'Вычисли по образцу',text:'Вычисли по образцу: 4 · 10 + 5 · 10 = (4 + 5) · 10 = 90.',rule:RULE_DIST,items:[
   sampleItem('3 · 6 + 7 · 6'),sampleItem('1 · 7 + 9 · 7'),sampleItem('4 · 5 + 6 · 5'),sampleItem('2 · 10 + 7 · 10'),sampleItem('5 · 6 + 5 · 4'),sampleItem('3 · 7 + 3 · 2')]},
 {n:4,title:'Периметр разными способами',text:'Реши задачу разными способами. Длина прямоугольника 6 см, что в 2 раза длиннее его ширины. Найди периметр прямоугольника.',rule:RULE_P,items:[
   (()=>{const t=recTask({rows:[{l:'Длина',q:'Чему равна длина?',ok:6,v:'6 см'},{l:'Ширина',v0:'в 2 раза короче',at:1,vAt:'3 см'}],
     acts:[{q:'Длина в 2 раза длиннее ширины. Как найти ширину?',opts:['6 · 2','6 : 2','6 − 2'],ok:1,hints:['Ширина короче длины в 2 раза.','«В … раз короче» — делим.'],why:{ok:'Ширина короче — делим',no:['«Длиннее» — умножаем']},calc:[6,':',2],u:'(см)',lbl:'ширина'},
       ...perSteps(6,3)],answer:{q:'Ответ: периметр (см)?',ok:18,text:'периметр прямоугольника 18 см.'}});
     t.steps.splice(t.steps.length-1,0,{k:'pick',q:'2 способ: как ещё можно найти периметр?',opts:['6 · 2 + 3 · 2','6 · 3 + 2','6 + 3 · 2'],ok:0,hints:['Две длины и две ширины — можно посчитать отдельно.','Длину взять 2 раза, ширину взять 2 раза и сложить.'],why:{ok:'2 длины + 2 ширины',no:['Длина · ширина']},board:t.steps[t.steps.length-2].board+BL('2 способ: 6 · 2 + 3 · 2 = 12 + 6 = 18 (см)')});return t})()]},
 {n:5,title:'Деревья вокруг парка',text:'Реши задачу разными способами. Парк имеет форму прямоугольника с длиной 24 метра и шириной 18 метров. Если на его сторонах надо посадить деревья с отступом в 2 метра друг от друга, то сколько нужно деревьев?',rule:RULE_P,items:[
   taskItem({top:'',pre:[{k:'pick',q:'Деревья сажают по всем сторонам парка. Что надо узнать сначала?',opts:['Периметр парка','Площадь парка'],ok:0,hints:['Деревья растут по краю, вокруг парка.','Длина всех сторон вместе — это…'],why:{ok:'Вокруг парка — это периметр',no:['Вокруг парка — это площадь']}}],
     acts:[...perSteps(24,18,'(м)'),{q:'Через каждые 2 м — дерево. Сколько деревьев?',opts:['84 : 2','84 − 2','84 · 2'],ok:0,hints:['Сколько раз по 2 м помещается в 84 м?','Дорожка замкнутая: сколько отрезков по 2 м — столько и деревьев.'],why:{ok:'Сколько раз по 2 м в 84 м',no:['Отнимаем 2 м']},calc:[84,':',2],u:'(д.)'}],
     answer:{q:'Ответ: сколько деревьев нужно?',ok:42,text:'42 дерева нужно.'}})]}
]};

PAGES.wb[40]={lesson:'Урок 43. Умножение двузначного числа на однозначное. Периметр квадрата',rule:RULE_MUL2,ex:[
 {n:1,title:'Разбей на удобные слагаемые',text:'Разбей на удобные слагаемые.',rule:RULE_MUL2,items:[[34,2],[17,5],[14,6],[23,4]].map(([a,b])=>{const d=a-a%10,e=a%10;
   return {start:BL(`${a} · ${b}`),steps:[{k:'nums',pre:`${a} =`,q:`Разбей ${a} на десятки и единицы.`,fields:[{ok:d,u:'+'},{ok:e,u:''}],hints:['Первое слагаемое — круглое число (десятки).','Второе — единицы, последняя цифра.'],board:BL(`${a} · ${b} → ${a} = ${d} + ${e}`)}],record:`${a} · ${b}: ${a} = ${d} + ${e}`}})},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_MUL2,items:[[14,7],[19,4],[18,4],[15,6],[13,6],[13,7],[17,3],[16,2]].map(([a,b])=>mulItem(a,b))},
 {n:3,title:'Составь выражения',text:'Составь выражения и найди их значения.',rule:RULE_WORDS,items:[
   composeItem('Из суммы чисел 56 и 34 вычесть произведение чисел 15 и 5.','(56 + 34) − 15 · 5',['56 + 34 − 15 + 5','(56 + 34) · 15 − 5'],['Сумма — это «+», её берём в скобки. Произведение — «·».','Сначала сумма в скобках, из неё вычитаем произведение.'],{ok:'Сумма в скобках, минус произведение',no:['Сумма — это умножение']}),
   composeItem('К произведению чисел 24 и 2 прибавить частное чисел 80 и 40.','24 · 2 + 80 : 40',['24 + 2 + 80 : 40','24 · 2 + 80 − 40'],['Произведение — «·», частное — «:».','Произведение плюс частное.'],{ok:'Произведение + частное',no:['Частное — это вычитание']}),
   composeItem('Произведение чисел 13 и 6 уменьшить на частное чисел 80 и 8.','13 · 6 − 80 : 8',['13 · 6 : 80 : 8','13 + 6 − 80 : 8'],['«Уменьшить на» — вычитаем.','Произведение минус частное.'],{ok:'«Уменьшить на» — вычитаем',no:['«Уменьшить на» — делим']})]},
 {n:4,title:'Яблоки в ящиках',text:'В магазине было 54 кг яблок в 6 одинаковых ящиках. Продали 4 ящика. Сколько килограммов яблок продали?',rule:RULE_K,items:[
   kTask({h:['кг в 1 ящике','ящиков','всего кг'],names:['Было','Продали'],
     fill:[{r:0,c:1,q:'Строка «Было». Сколько ящиков? Это <b>К</b>.',ok:6},{r:0,c:2,q:'Сколько кг яблок было всего? Это <b>ОК</b>.',ok:54},{r:1,c:1,q:'Строка «Продали». Сколько ящиков продали? Это <b>К</b>.',ok:4}],
     unk:[{r:0,c:0,v:9,at:1},{r:1,c:0,v:9,at:1},{r:1,c:2,v:36,at:2}],
     acts:[{q:'Сколько кг в одном ящике? Как найти К1?',opts:['54 − 6','54 : 6','54 · 6'],ok:1,hints:['54 кг лежат в 6 ящиках поровну.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[54,':',6],u:'(кг)',lbl:'в 1 ящике'},
           {q:'Сколько кг продали?',opts:['9 + 4','9 · 4','54 − 4'],ok:1,hints:['Продали 4 ящика по 9 кг.','К1 · К = ОК.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[9,'·',4],u:'(кг)',lbl:'продали'}],
     answer:{q:'Ответ: сколько кг яблок продали?',ok:36,text:'36 кг яблок продали.'}})]},
 {n:5,title:'Периметр квадрата',text:'а) Найди периметр квадрата FBCD с длиной стороны 17 см. б) Периметр квадрата — 32 см. Чему равна сторона квадрата?',rule:RULE_P,items:[
   taskItem({top:BL('а) Квадрат FBCD, сторона 17 см'),acts:[{q:'Как найти периметр квадрата?',opts:['17 · 4','17 + 4','17 · 2'],ok:0,hints:['Сколько сторон у квадрата? Они равные?','4 одинаковые стороны.'],why:{ok:'4 равные стороны',no:['2 стороны']},calc:[17,'·',4],u:'(см)',lbl:'P'}],answer:{q:'Ответ: периметр квадрата (см)?',ok:68,text:'периметр квадрата 68 см.'}}),
   taskItem({top:BL('б) P квадрата = 32 см'),acts:[{q:'Как найти сторону квадрата?',opts:['32 − 4','32 : 4','32 · 4'],ok:1,hints:['Периметр — это 4 одинаковые стороны вместе.','Делим периметр на 4 равные части.'],why:{ok:'4 равные стороны — делим на 4',no:['Отнимаем 4']},calc:[32,':',4],u:'(см)',lbl:'сторона'}],answer:{q:'Ответ: сторона квадрата (см)?',ok:8,text:'сторона квадрата 8 см.'}})]}
]};

PAGES.wb[41]={lesson:'Урок 44. Закрепление',rule:RULE_MUL2,ex:[
 {n:1,title:'Подчеркни верные равенства',text:'Подчеркни верные равенства.',rule:RULE_DIST,items:[
   multiItem('Нажми на верные равенства, потом «Проверить».',['(10 + 6) · 4 = 10 · 4 + 6 · 4','(30 + 2) · 2 = 2 · 2 + 30','(20 + 3) · 3 = 20 · 3 + 3','(10 + 7) · 5 = 7 · 5 + 10 · 5'],[0,3],['Каждое слагаемое из скобок надо умножить.','Проверь: умножены ли оба слагаемых?'],{extra:'Отмечено лишнее. Проверь: оба ли слагаемых умножены?',miss:'Отмечены не все.',none:'Ничего не отмечено.'},'<br>')]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_MUL2,items:[[13,5],[15,5],[45,2],[19,3],[17,4],[18,5],[11,8],[33,3]].map(([a,b])=>mulItem(a,b))},
 {n:3,title:'Заполни таблицу',text:'Заполни таблицу.',rule:RULE_DIFF,items:[diffItem(100,'15 · 4'),diffItem(100,'14 · 7'),diffItem('23 · 3',29),diffItem('19 · 4',37),diffItem(91,'17 · 5'),diffItem(84,'16 · 3')]},
 {n:4,title:'Грузовики',text:'Реши задачу двумя способами. 3 грузовика перевезли по 12 кг муки и по 11 кг риса. Найди массу перевезённого груза.',rule:RULE_DIST,items:[
   (()=>{const t=recTask({rows:[{l:'Грузовиков',q:'Сколько грузовиков?',ok:3,v:'3'},{l:'Муки в каждом',q:'Сколько кг муки в одном грузовике?',ok:12,v:'12 кг'},{l:'Риса в каждом',q:'Сколько кг риса в одном грузовике?',ok:11,v:'11 кг'}],
     acts:[{q:'1 способ. Сколько груза в одном грузовике?',opts:['12 + 11','12 · 11','12 − 11'],ok:0,hints:['В одном грузовике и мука, и рис.','Складываем.'],why:WHY_SUM,calc:[12,'+',11],u:'(кг)',lbl:'в одном'},
           {q:'Сколько во всех 3 грузовиках?',opts:['23 + 3','23 · 3','23 : 3'],ok:1,hints:['В каждом из 3 грузовиков по 23 кг.','По 23 взять 3 раза.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[23,'·',3],u:'(кг)',lbl:'всего'}],
     answer:{q:'Ответ: масса груза (кг)?',ok:69,text:'масса перевезённого груза 69 кг.'}});
     t.steps.splice(t.steps.length-1,0,{k:'pick',q:'2 способ: как ещё можно посчитать?',opts:['12 · 3 + 11 · 3','12 · 11 · 3','12 + 11 · 3'],ok:0,hints:['Отдельно вся мука и отдельно весь рис.','Мука: 12 · 3, рис: 11 · 3, потом сложить.'],why:{ok:'Вся мука + весь рис',no:['Мука · рис']},board:t.steps[t.steps.length-2].board+BL('2 способ: 12 · 3 + 11 · 3 = 36 + 33 = 69 (кг)')});return t})()]},
 {n:5,title:'Часы',text:'Запиши, какое время показывают часы в дневное время. Запиши, какое время будет через 1 ч 10 мин.',rule:RULE_TIME,items:[
   clockItem({lbl:'а)',h:4,m:10,day:1,add:[1,10],addQ:'Какое время будет через 1 ч 10 мин?'}),clockItem({lbl:'б)',h:1,m:45,day:1,add:[1,10],addQ:'Какое время будет через 1 ч 10 мин?'}),clockItem({lbl:'в)',h:12,m:25,day:1,add:[1,10],addQ:'Какое время будет через 1 ч 10 мин?'})]}
]};

PAGES.wb[42]={lesson:'Урок 45. Деление суммы на число',rule:RULE_DDIST,ex:[
 {n:1,title:'Подчеркни верные равенства',text:'Подчеркни верные равенства.',rule:RULE_DDIST,items:[
   multiItem('Нажми на верные равенства, потом «Проверить».',['(8 + 4) : 4 = 8 : 4 + 4 : 4','(16 + 12) : 2 = 16 : 2 + 2 : 2','(24 + 32) : 4 = 24 : 6 + 32 : 8','(45 + 30) : 5 = 45 : 5 + 30 : 5'],[0,3],['Каждое слагаемое из скобок делим на одно и то же число.','Справа те же слагаемые и тот же делитель?'],{extra:'Отмечено лишнее. Проверь числа и делитель справа.',miss:'Отмечены не все.',none:'Ничего не отмечено.'},'<br>')]},
 {n:2,title:'Сравни, не вычисляя',text:'Сравни, не вычисляя.',rule:RULE_DDIST,items:[
   signItem('(54 + 8) : 2','54 : 2 + 8','<',['Слева на 2 делим и 54, и 8. А справа 8 делили?','Справа 8 целиком, а слева только его половина.']),
   signItem('(30 + 15) : 5','30 : 5 + 15 : 5','=',['Каждое слагаемое разделили на 5.','Это одно и то же.']),
   signItem('(72 + 18) : 9','(36 + 18) : 9','>',['Делитель одинаковый. Сравни суммы в скобках.','72 больше 36.']),
   signItem('(16 + 24) : 4','16 : 4 + 32 : 4','<',['(16 + 24) : 4 = 16 : 4 + 24 : 4. Сравни с правой частью.','24 : 4 и 32 : 4 — что больше?'])].map((it,i)=>{it.steps[0].why=[{ok:'Справа 8 не разделили',no:['Это одно и то же']},{ok:'Каждое слагаемое разделили на 5',no:['Скобки меняют ответ']},{ok:'72 больше 36',no:['Делители разные']},{ok:'24 : 4 меньше 32 : 4',no:['24 больше 32']}][i];return it})},
 {n:3,title:'Вычисли по образцу',text:'Вычисли по образцу: 12 : 2 + 8 : 2 = (12 + 8) : 2 = 10.',rule:RULE_DDIST,items:[
   sampleItem('15 : 5 + 30 : 5'),sampleItem('14 : 7 + 28 : 7'),sampleItem('27 : 9 + 54 : 9'),sampleItem('50 : 10 + 30 : 10'),sampleItem('24 : 8 + 48 : 8'),sampleItem('36 : 6 + 12 : 6')]},
 {n:4,title:'Таблетки',text:'В двух одинаковых упаковках 20 таблеток. Для курса лечения необходимо 60 таблеток. Сколько упаковок таблеток нужно купить?',rule:RULE_K,items:[
   kTask({h:['таблеток в 1 упаковке','упаковок','всего таблеток'],names:['Есть','Нужно'],
     fill:[{r:0,c:1,q:'Строка «Есть». Сколько упаковок? Это <b>К</b>.',ok:2},{r:0,c:2,q:'Сколько в них таблеток всего? Это <b>ОК</b>.',ok:20},{r:1,c:2,q:'Строка «Нужно». Сколько таблеток нужно всего? Это <b>ОК</b>.',ok:60}],
     unk:[{r:0,c:0,v:10,at:1},{r:1,c:0,v:10,at:1},{r:1,c:1,v:6,at:2}],
     acts:[{q:'Сколько таблеток в одной упаковке? Как найти К1?',opts:['20 − 2','20 : 2','20 · 2'],ok:1,hints:['20 таблеток в 2 упаковках поровну.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[20,':',2],u:'(т.)',lbl:'в 1 упаковке'},
           {q:'Сколько упаковок нужно? Как найти К?',opts:['60 : 10','60 − 10','60 · 10'],ok:0,hints:['В каждой упаковке по 10 таблеток. Сколько раз по 10 в 60?','ОК : К1 = К.'],why:{ok:'ОК : К1 = К',no:['ОК − К1 = К']},calc:[60,':',10],u:'(уп.)',lbl:'упаковок'}],
     answer:{q:'Ответ: сколько упаковок купить?',ok:6,text:'6 упаковок таблеток нужно купить.'}})]},
 {n:5,title:'Периметр прямоугольника',text:'Ширина прямоугольника 4 см, что на 2 см короче его длины. Найди периметр прямоугольника.',rule:RULE_P,items:[
   recTask({rows:[{l:'Ширина',q:'Чему равна ширина?',ok:4,v:'4 см'},{l:'Длина',q:'На сколько сантиметров длина больше ширины?',ok:2,v:'на 2 см больше',at:1,vAt:'6 см'}],
     acts:[{q:'Как найти длину?',opts:['4 + 2','4 − 2','4 · 2'],ok:0,hints:['Ширина короче — значит, длина больше на 2 см.','«На … больше» — прибавляем.'],why:{ok:'Длина больше на 2 см',no:['Слово «короче» — вычитаем']},calc:[4,'+',2],u:'(см)',lbl:'длина'},...perSteps(6,4)],
     answer:{q:'Ответ: периметр (см)?',ok:20,text:'периметр прямоугольника 20 см.'}})]}
]};

PAGES.wb[43]={lesson:'Урок 46. Деление двузначного числа на однозначное',rule:RULE_DIV2,ex:[
 {n:1,title:'Закончи решение',text:'Закончи решение.',rule:RULE_DIV2,items:[[80,5,30],[75,5,25],[98,7,28],[96,6,36]].map(([a,b,u])=>{const t=a-u,q1=t/b,q2=u/b,r=a/b;
   const L=x=>BL(x);const S=[{k:'num',q:`${a} : ${b} = (□ + ${u}) : ${b}. Какое число в окошке?`,ok:t,hints:[`Сумма в скобках должна быть равна ${a}.`,`${a} − ${u} = ?`],board:L(`${a} : ${b} = (${t} + ${u}) : ${b}`)},
     Object.assign(calcStep(t,':',b),{board:L(`${a} : ${b} = (${t} + ${u}) : ${b} = ${q1} + …`)}),Object.assign(calcStep(u,':',b),{board:L(`${a} : ${b} = (${t} + ${u}) : ${b} = ${q1} + ${q2}`)}),
     Object.assign(calcStep(q1,'+',q2),{board:L(`${a} : ${b} = (${t} + ${u}) : ${b} = <b>${r}</b>`)})];
   return {start:L(`${a} : ${b} = (□ + ${u}) : ${b} = ${QQ}`),steps:S,record:`${a} : ${b} = (${t} + ${u}) : ${b} = <b>${r}</b>`+PEN2(`${t} : ${b} = ${q1}, ${u} : ${b} = ${q2}, ${q1} + ${q2} = ${r}`)}})},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_DIV2,items:[[84,6],[86,2],[88,8],[60,5],[60,4],[45,3],[68,4],[90,5]].map(([a,b])=>divItem(a,b))},
 {n:3,title:'Составь выражения',text:'Составь выражения и найди их значения.',rule:RULE_WORDS,items:[
   composeItem('К частному чисел 57 и 3 прибавить произведение 14 и 5.','57 : 3 + 14 · 5',['57 · 3 + 14 · 5','57 : 3 + 14 + 5'],['Частное — «:», произведение — «·».','Частное плюс произведение.'],{ok:'Частное + произведение',no:['Частное — это умножение']}),
   composeItem('Из произведения чисел 16 и 5 вычесть частное чисел 76 и 4.','16 · 5 − 76 : 4',['16 + 5 − 76 : 4','16 · 5 − 76 · 4'],['Произведение — «·», частное — «:».','Произведение минус частное.'],{ok:'Произведение − частное',no:['Частное — это вычитание']}),
   composeItem('Сумму чисел 43 и 29 разделить на 4.','(43 + 29) : 4',['43 + 29 : 4','43 · 29 : 4'],['Сумму надо разделить целиком — нужны скобки.','Сначала сумма в скобках, потом деление.'],{ok:'Сумму целиком — в скобки',no:['Скобки не нужны']})]},
 {n:4,title:'Яблоки и груши',text:'Реши задачу двумя способами. Нужно разложить 42 кг яблок и 28 кг груш в ящики по 7 кг в каждый поровну. Сколько ящиков потребуется?',rule:RULE_DDIST,items:[
   (()=>{const t=recTask({rows:[{l:'Яблок',q:'Сколько кг яблок?',ok:42,v:'42 кг'},{l:'Груш',q:'Сколько кг груш?',ok:28,v:'28 кг'},{l:'В 1 ящик',q:'Сколько кг в один ящик?',ok:7,v:'по 7 кг'}],
     acts:[{q:'1 способ. Сколько ящиков для яблок?',opts:['42 − 7','42 : 7','42 · 7'],ok:1,hints:['Сколько раз по 7 кг в 42 кг?','ОК : К1 = К.'],why:{ok:'Сколько раз по 7 в 42',no:['Отнимаем 7']},calc:[42,':',7],u:'(ящ.)',lbl:'для яблок'},
           {q:'Сколько ящиков для груш?',opts:['28 : 7','28 − 7','28 · 7'],ok:0,hints:['Сколько раз по 7 кг в 28 кг?','Так же, как с яблоками.'],why:{ok:'Сколько раз по 7 в 28',no:['Отнимаем 7']},calc:[28,':',7],u:'(ящ.)',lbl:'для груш'},
           {q:'Сколько всего ящиков?',opts:['6 + 4','6 · 4','6 − 4'],ok:0,hints:['«Всего» — какое действие?','Ящики для яблок и для груш вместе.'],why:WHY_SUM,calc:[6,'+',4],u:'(ящ.)'}],
     answer:{q:'Ответ: сколько ящиков потребуется?',ok:10,text:'10 ящиков потребуется.'}});
     t.steps.splice(t.steps.length-1,0,{k:'pick',q:'2 способ: как посчитать одним выражением?',opts:['(42 + 28) : 7','42 + 28 : 7','(42 − 28) : 7'],ok:0,hints:['Сначала все фрукты вместе, потом раскладываем по 7 кг.','Сумму делим на 7 — нужны скобки.'],why:{ok:'Все фрукты вместе : 7',no:['Скобки не нужны']},board:t.steps[t.steps.length-2].board+BL('2 способ: (42 + 28) : 7 = 70 : 7 = 10 (ящ.)')});return t})()]},
 {n:5,title:'Ломаная и квадрат',text:'Начерти ломаную, которая состоит из 3 звеньев и длиной, равной периметру квадрата со стороной 3 см.',rule:RULE_P,items:[
   {start:BL('Квадрат: сторона 3 см. Ломаная: 3 звена, длина = P квадрата.'),steps:[
     {k:'pick',q:'Как найти периметр квадрата?',opts:['3 · 4','3 + 4','3 · 3'],ok:0,hints:['У квадрата 4 одинаковые стороны.','Сторону взять 4 раза.'],why:{ok:'4 равные стороны',no:['3 стороны']},board:BL('P = 3 · 4')},
     Object.assign(calcStep(3,'·',4),{board:BL('P = 3 · 4 = 12 (см)')}),
     {k:'nums',q:'Придумай длины 3 звеньев ломаной (в см). Вместе должно быть столько, сколько периметр.',fields:[{ok:0,u:'см +'},{ok:0,u:'см +'},{ok:0,u:'см'}],check:v=>v.every(x=>x>0)&&v[0]+v[1]+v[2]===12,testv:[4,4,4],hints:['Сумма трёх звеньев должна быть равна периметру квадрата.','Каждое звено — больше 0. Проверь сложением.'],board:BL('P = 12 см. Звенья ломаной в сумме — 12 см ✓')},
     {k:'note',q:'Начерти эту ломаную в тетради по линейке. Каждое следующее звено начинай с конца предыдущего.',btn:'Начертила',board:BL('P = 3 · 4 = 12 (см). Ломаная из 3 звеньев длиной 12 см.')}],
    record:'P = 3 · 4 = 12 (см). Ломаная: 3 звена, вместе 12 см.'}]}
]};

PAGES.wb[44]={lesson:'Урок 47. Деление двузначного числа на двузначное',rule:RULE_DIV22,ex:[
 {n:1,title:'Числа на конце',text:'Какое число — результат при умножении на 7 — в ответе даёт 5 на конце? Какие числа — результат при умножении на 6 — в ответе дают 4 на конце?',rule:'<p>Вспомни таблицу умножения на 7 и на 6. Смотри на последнюю цифру результата.</p>',items:[
   {start:BL('… · 7 = …5'),steps:[{k:'num',q:'Какое число из таблицы умножения на 7 оканчивается на 5?',ok:35,hints:['Проговори таблицу: 7, 14, 21, 28…','Смотри, где на конце цифра 5.'],board:BL('5 · 7 = 35')}],record:'5 · 7 = 35'},
   {start:BL('… · 6 = …4'),steps:[{k:'nums',q:'Какие два числа из таблицы умножения на 6 оканчиваются на 4?',fields:[{ok:0,u:'и'},{ok:0,u:''}],check:v=>[24,54].every(x=>v.includes(x))&&v[0]!==v[1],testv:[24,54],hints:['Проговори таблицу: 6, 12, 18, 24…','Таких чисел два. Ищи до 60.'],board:BL('4 · 6 = 24, 9 · 6 = 54')}],record:'4 · 6 = 24, 9 · 6 = 54'}]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_DIV22,items:[[48,24],[64,32],[84,14],[95,19],[98,14],[64,16],[75,25],[42,14]].map(([a,b])=>div2Item(a,b))},
 {n:3,title:'Составь выражения',text:'Составь выражения и найди их значения.',rule:RULE_WORDS,items:[
   composeItem('Разность чисел 91 и 23 уменьши в 17 раз.','(91 − 23) : 17',['91 − 23 : 17','(91 − 23) · 17'],['«Уменьши в … раз» — делим. Разность целиком — в скобках.','Сначала разность в скобках, потом деление.'],{ok:'«Уменьши в … раз» — делим',no:['«Уменьши в … раз» — вычитаем']}),
   composeItem('К частному чисел 57 и 19 прибавь 47.','57 : 19 + 47',['57 · 19 + 47','57 : (19 + 47)'],['Частное — «:».','Частное плюс 47.'],{ok:'Частное + 47',no:['Частное — это умножение']}),
   composeItem('Сумму чисел 39 и 46 уменьши в 17 раз.','(39 + 46) : 17',['39 + 46 : 17','(39 + 46) − 17'],['«Уменьши в … раз» — делим.','Сумму целиком — в скобки.'],{ok:'«Уменьши в … раз» — делим',no:['«Уменьши в … раз» — вычитаем']})]},
 {n:4,title:'Наборы инструментов',text:'В наборе — 5 отвёрток и 16 ключей. Сколько инструментов в 4 таких наборах?',rule:RULE_K,items:[
   recTask({rows:[{l:'Отвёрток в наборе',q:'Сколько отвёрток в одном наборе?',ok:5,v:'5'},{l:'Ключей в наборе',q:'Сколько ключей в одном наборе?',ok:16,v:'16'},{l:'Наборов',q:'Сколько наборов?',ok:4,v:'4'}],
     acts:[{q:'Сколько инструментов в одном наборе?',opts:['5 + 16','5 · 16','16 − 5'],ok:0,hints:['В наборе и отвёртки, и ключи.','Складываем.'],why:WHY_SUM,calc:[5,'+',16],u:'(шт.)',lbl:'в 1 наборе'},
           {q:'Сколько инструментов в 4 наборах?',opts:['21 + 4','21 · 4','21 : 4'],ok:1,hints:['В каждом из 4 наборов по 21.','К1 · К = ОК.'],why:{ok:'К1 · К = ОК',no:['К1 + К = ОК']},calc:[21,'·',4],u:'(шт.)'}],
     answer:{q:'Ответ: сколько инструментов?',ok:84,text:'84 инструмента в 4 наборах.'}})]},
 {n:5,title:'Часы: 3 оборота',text:'Какое время показывают часы? Какое время будут показывать часы, когда минутная стрелка сделает 3 оборота?',rule:RULE_TIME,items:[
   (()=>{const it=clockItem({lbl:'а) утро',h:9,m:25,add:[3,0],addQ:'Минутная стрелка сделала 3 оборота. Какое время?'});it.steps.splice(1,0,{k:'pick',q:'Один полный оборот минутной стрелки — это сколько?',opts:['1 час','1 минута','10 минут'],ok:0,hints:['Минутная стрелка проходит все 60 минут.','60 мин = ?'],why:{ok:'60 минут = 1 час',no:['Оборот — 1 минута']},board:it.steps[0].board});return it})(),
   clockItem({lbl:'б) утро',h:10,m:40,add:[3,0],addQ:'Минутная стрелка сделала 3 оборота (3 часа). Какое время?'}),
   clockItem({lbl:'в) день',h:3,m:10,day:1,add:[3,0],addQ:'Минутная стрелка сделала 3 оборота (3 часа). Какое время?'})]}
]};

PAGES.wb[45]={lesson:'Урок 48. Закрепление',rule:RULE_TIME,ex:[
 {n:1,title:'Вырази в часах и минутах',text:'Вырази в часах и минутах.',rule:RULE_TIME,items:[87,78,90,100].map(m=>({start:BL(`${m} мин = ${QQ} ч ${QQ} мин`),steps:[{k:'nums',pre:`${m} мин =`,q:'Сколько это часов и минут?',fields:[{ok:1,u:'ч'},{ok:m-60,u:'мин'}],hints:['1 ч = 60 мин. Сколько целых часов помещается?',`Сколько минут останется после 60?`],board:BL(`${m} мин = 1 ч ${m-60} мин`)}],record:`${m} мин = 1 ч ${m-60} мин`}))},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_DIV22+RULE_ORDER,items:[div2Item(90,45),div2Item(72,18),div2Item(75,15),div2Item(92,23),valueItem('54 : 18 · 10',{}),valueItem('96 : 48 · 10',{}),valueItem('91 : 13 · 10',{}),valueItem('78 : 26 · 10',{})]},
 {n:3,title:'Вставь пропущенные числа',text:'Вставь пропущенные числа, чтобы равенства были верными.',rule:RULE_TIME,items:[
   {start:BL('90 мин : 5 = 1 ч − □ мин'),steps:[{k:'num',q:'Посчитай левую часть: 90 мин : 5 = ? мин',ok:18,hints:calcHints(90,':',5),board:BL('90 мин : 5 = 18 мин')},{k:'num',q:'1 ч = 60 мин. 60 мин − □ = 18 мин. Какое число в окошке?',ok:42,hints:['Неизвестное вычитаемое: из 60 вычти 18.','60 − 18 = ?'],board:BL('90 мин : 5 = 1 ч − <b>42</b> мин')}],record:'90 мин : 5 = 1 ч − <b>42</b> мин'+PEN2('90 : 5 = 18 (мин), 60 − 18 = 42')},
   {start:BL('1 ч + 12 мин · 3 = 83 мин + □ мин'),steps:[{k:'num',q:'Сначала умножение: 12 мин · 3 = ? мин',ok:36,hints:calcHints(12,'·',3),board:BL('12 мин · 3 = 36 мин')},{k:'num',q:'1 ч = 60 мин. 60 мин + 36 мин = ? мин',ok:96,hints:['60 + 36 = ?','Сложи десятки и единицы.'],board:BL('1 ч + 36 мин = 96 мин')},{k:'num',q:'96 мин = 83 мин + □. Какое число в окошке?',ok:13,hints:['Неизвестное слагаемое: 96 − 83.','96 − 83 = ?'],board:BL('1 ч + 12 мин · 3 = 83 мин + <b>13</b> мин')}],record:'1 ч + 12 мин · 3 = 83 мин + <b>13</b> мин'+PEN2('12 · 3 = 36, 60 + 36 = 96, 96 − 83 = 13')},
   {start:BL('37 мин + 48 мин = 1 ч + □ мин'),steps:[{k:'num',q:'37 мин + 48 мин = ? мин',ok:85,hints:calcHints(37,'+',48),board:BL('37 мин + 48 мин = 85 мин')},{k:'num',q:'85 мин = 1 ч + □ мин. Какое число в окошке?',ok:25,hints:['1 ч = 60 мин. Сколько минут сверх 60?','85 − 60 = ?'],board:BL('37 мин + 48 мин = 1 ч + <b>25</b> мин')}],record:'37 мин + 48 мин = 1 ч + <b>25</b> мин'+PEN2('37 + 48 = 85, 85 − 60 = 25')}]},
 {n:4,title:'Букеты',text:'Флорист из 35 хризантем и 55 роз составила букеты. Все цветы распределили в 18 одинаковых букетов. Сколько цветов было в каждом букете?',rule:RULE_K,items:[
   recTask({rows:[{l:'Хризантем',q:'Сколько хризантем?',ok:35,v:'35'},{l:'Роз',q:'Сколько роз?',ok:55,v:'55'},{l:'Букетов',q:'Сколько одинаковых букетов?',ok:18,v:'18'}],
     acts:[{q:'Сколько всего цветов?',opts:['35 + 55','55 − 35','35 · 55'],ok:0,hints:['Все цветы вместе.','«Всего» — складываем.'],why:WHY_SUM,calc:[35,'+',55],u:'(цв.)',lbl:'всего'},
           {q:'Сколько цветов в каждом букете?',opts:['90 − 18','90 : 18','90 · 18'],ok:1,hints:['90 цветов разложили поровну в 18 букетов.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[90,':',18],u:'(цв.)'}],
     answer:{q:'Ответ: сколько цветов в каждом букете?',ok:5,text:'5 цветов было в каждом букете.'}})]},
 {n:5,title:'Длина по периметру',text:'Ширина прямоугольника 2 см. Чему равна длина, если периметр 12 см?',rule:RULE_P,items:[
   recTask({rows:[{l:'Ширина',q:'Чему равна ширина?',ok:2,v:'2 см'},{l:'Периметр',q:'Чему равен периметр?',ok:12,v:'12 см'},{l:'Длина',v0:'?',at:2,vAt:'4 см'}],
     acts:[{q:'Сколько будут длина и ширина вместе (половина периметра)?',opts:['12 : 2','12 − 2','12 · 2'],ok:0,hints:['Периметр — это 2 длины и 2 ширины. А одна длина и одна ширина?','Половина периметра — делим на 2.'],why:{ok:'Длина + ширина = половина периметра',no:['Вычитаем ширину из периметра']},calc:[12,':',2],u:'(см)',lbl:'длина + ширина'},
           {q:'Как найти длину?',opts:['6 − 2','6 + 2','6 : 2'],ok:0,hints:['Длина + ширина = 6 см. Ширина 2 см.','Неизвестное слагаемое: 6 − 2.'],why:{ok:'Из суммы вычитаем ширину',no:['Складываем']},calc:[6,'−',2],u:'(см)',lbl:'длина'}],
     answer:{q:'Ответ: длина (см)?',ok:4,text:'длина прямоугольника 4 см.'}})]}
]};

PAGES.wb[46]={lesson:'Уроки 49–50. Получение доли. Сравнение долей',rule:RULE_FRAC,ex:[
 {n:1,title:'Какая часть закрашена',text:'Запиши в виде дроби, какая часть фигуры закрашена. На сколько равных частей разделено целое?',rule:RULE_FRAC,items:[fracItem('а)',stripSVG(2),2),fracItem('б)',stripSVG(3),3),fracItem('в)',stripSVG(8),8),fracItem('г)',stripSVG(6),6)]},
 {n:2,title:'Раздели прямоугольники',text:'Первый прямоугольник раздели на две одинаковые части, а второй — на четыре. Закрась одну часть. Запиши в виде дроби, чему равна закрашенная часть каждого прямоугольника.',rule:RULE_FRAC,items:[
   {start:BL('Два прямоугольника в тетради'),steps:[
     {k:'note',q:'Раздели первый прямоугольник на 2 одинаковые части, второй — на 4 (по клеточкам, линейкой). Закрась в каждом одну часть.',btn:'Сделала',board:BL(`<div class="pics">${stripSVG(2)}${stripSVG(4)}</div>`)},
     {k:'num',q:`Первый: закрашена 1 часть из скольких? ${FR(1,'?')}`,ok:2,hints:['На сколько частей ты разделила первый?','Посчитай части.'],board:BL(`<div class="pics">${stripSVG(2)}${stripSVG(4)}</div>`)+BL(`Первый: ${FR(1,2)}`)},
     {k:'num',q:`Второй: ${FR(1,'?')}`,ok:4,hints:['На сколько частей ты разделила второй?','Посчитай части.'],board:BL(`<div class="pics">${stripSVG(2)}${stripSVG(4)}</div>`)+BL(`Первый: ${FR(1,2)}, второй: ${FR(1,4)}`)}],record:`Первый: ${FR(1,2)}, второй: ${FR(1,4)}`}]},
 {n:3,title:'Сравни с помощью рисунка',text:'Сравни с помощью рисунка.',rule:RULE_FRAC,items:[fracCmp(3,4,pieSVG(3),pieSVG(4)),fracCmp(8,4,pieSVG(8),pieSVG(4)),fracCmp(5,2,pieSVG(5),pieSVG(2))]},
 {n:4,title:'Капуста',text:'Чтобы заквасить 36 кг капусты, потребовалось 4 бочонка. Сколько таких бочонков потребуется, чтобы заквасить 54 кг капусты?',rule:RULE_K,items:[
   kTask({h:['кг в 1 бочонке','бочонков','всего кг'],names:['Было','Нужно'],
     fill:[{r:0,c:1,q:'Строка «Было». Сколько бочонков? Это <b>К</b>.',ok:4},{r:0,c:2,q:'Сколько кг капусты в них? Это <b>ОК</b>.',ok:36},{r:1,c:2,q:'Строка «Нужно». Сколько кг капусты надо заквасить? Это <b>ОК</b>.',ok:54}],
     unk:[{r:0,c:0,v:9,at:1},{r:1,c:0,v:9,at:1},{r:1,c:1,v:6,at:2}],
     acts:[{q:'Сколько кг в одном бочонке? Как найти К1?',opts:['36 − 4','36 : 4','36 · 4'],ok:1,hints:['36 кг в 4 бочонках поровну.','ОК : К = К1.'],why:{ok:'ОК : К = К1',no:['ОК − К = К1']},calc:[36,':',4],u:'(кг)',lbl:'в 1 бочонке'},
           {q:'Сколько бочонков нужно для 54 кг? Как найти К?',opts:['54 : 9','54 − 9','54 · 9'],ok:0,hints:['Сколько раз по 9 кг в 54 кг?','ОК : К1 = К.'],why:{ok:'ОК : К1 = К',no:['ОК − К1 = К']},calc:[54,':',9],u:'(б.)',lbl:'бочонков'}],
     answer:{q:'Ответ: сколько бочонков?',ok:6,text:'6 бочонков потребуется.'}})]},
 {n:5,title:'Прямоугольник и доли',text:'Начерти прямоугольник с длиной 3 см и шириной 2 см. Обозначь его буквами. Найди его периметр. Раздели на три равные части. Закрась одну часть, подпиши, какая это часть.',rule:RULE_P+RULE_FRAC,items:[
   taskItem({top:'',pre:[anglePick('Какие углы у прямоугольника?','прямой',{ok:'У прямоугольника все углы прямые',no:['У прямоугольника углы острые']},['Прямоугольник — «прямые углы».','Как уголок тетради.']),
       {k:'note',q:'Начерти в тетради по клеточкам прямоугольник: длина и ширина — из задания. Подпиши вершины латинскими буквами.',btn:'Начертила'}],
     acts:perSteps(3,2),answer:{q:'Ответ: периметр (см)?',ok:10,text:'P = 10 см.'}}),
   {start:BL('Прямоугольник 3 см × 2 см'),steps:[{k:'note',q:'Раздели прямоугольник на 3 равные части (длина 3 см — удобно по 1 см). Закрась одну часть.',btn:'Сделала',board:BL(`<div class="pics">${stripSVG(3)}</div>`)},
     {k:'num',q:`Какая часть закрашена? ${FR(1,'?')}`,ok:3,hints:['На сколько равных частей ты разделила?','Одна часть из …'],board:BL(`<div class="pics">${stripSVG(3)}</div>`)+BL(`Закрашена ${FR(1,3)} часть`)}],record:`Закрашена ${FR(1,3)} часть прямоугольника.`}]}
]};

PAGES.wb[47]={lesson:'Уроки 51–53. Нахождение доли числа и числа по его доле',rule:RULE_FRAC,ex:[
 {n:1,title:'Отрезок на 3 части',text:'Начерти отрезок длиной 6 см. Раздели его на 3 равные части. Сколько сантиметров в одной части? Запиши примером.',rule:RULE_FRAC,items:[
   {start:BL('Отрезок 6 см, 3 равные части'),steps:[{k:'note',q:'Начерти отрезок нужной длины по линейке.',btn:'Начертила'},
     {k:'pick',q:'Как узнать длину одной части?',opts:['6 : 3','6 − 3','6 · 3'],ok:0,hints:['Отрезок делим на 3 равные части.','Делим поровну — какое действие?'],why:{ok:'Делим на равные части',no:['Отнимаем 3']},board:BL('6 : 3 = ?')},
     Object.assign(calcStep(6,':',3),{board:BL('6 : 3 = 2 (см)')}),{k:'note',q:'Отметь на отрезке части по этой длине.',btn:'Отметила',board:BL('6 : 3 = 2 (см). Ответ: 2 см в одной части.')}],record:'6 : 3 = 2 (см). Ответ: 2 см в одной части.'}]},
 {n:2,title:'Сравни с помощью рисунка',text:'Сравни с помощью рисунка.',rule:RULE_FRAC,items:[fracCmp(9,4,pieSVG(9),pieSVG(4)),fracCmp(5,7,pieSVG(5),pieSVG(7)),fracCmp(3,2,pieSVG(3),pieSVG(2))]},
 {n:3,title:'Значения с m',text:'Найди значения выражений, если в первом выражении m = 2, во втором — 4.',rule:RULE_VAR,items:[valueItem('84 : m + 11 · m',{m:2}),valueItem('0 · m + 72 : m',{m:4})]},
 {n:4,title:'Доли',text:'Реши задачи.',rule:RULE_FRAC,items:[
   taskItem({top:BL('а) Было 90 кг яблок. Продали шестую часть. Сколько кг продали?'),acts:[{q:`Шестая часть (${FR(1,6)}) от 90 — как найти?`,opts:['90 : 6','90 · 6','90 − 6'],ok:0,hints:['Делим 90 на 6 равных частей и берём одну.','Долю числа находим делением.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[90,':',6],u:'(кг)'}],answer:{q:'Ответ: сколько кг продали?',ok:15,text:'15 кг яблок продали.'}}),
   taskItem({top:BL('б) В книге 96 страниц. Алеся прочитала восьмую часть. Сколько страниц?'),acts:[{q:`${FR(1,8)} от 96 — как найти?`,opts:['96 · 8','96 : 8','96 − 8'],ok:1,hints:['Восьмая часть — делим на 8 равных частей.','Долю числа находим делением.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[96,':',8],u:'(стр.)'}],answer:{q:'Ответ: сколько страниц прочитала Алеся?',ok:12,text:'12 страниц прочитала Алеся.'}}),
   taskItem({top:BL(`в) Отрезали ${FR(1,5)} куска ткани — это 2 м. Какой длины весь кусок?`),acts:[{q:`2 м — это одна пятая часть. Как найти весь кусок?`,opts:['2 : 5','2 · 5','2 + 5'],ok:1,hints:['Весь кусок — это 5 таких частей.','Число по его доле находим умножением.'],why:{ok:'Число по доле — умножаем',no:['Число по доле — делим']},calc:[2,'·',5],u:'(м)'}],answer:{q:'Ответ: длина куска (м)?',ok:10,text:'весь кусок ткани был 10 м.'}}),
   taskItem({top:BL(`г) Купили 4 кг свёклы. Это ${FR(1,6)} часть от купленного картофеля. Сколько кг картофеля купили?`),acts:[{q:'4 кг — это одна шестая часть картофеля. Как найти весь картофель?',opts:['4 · 6','4 : 6','4 + 6'],ok:0,hints:['Картофель — это 6 таких частей по 4 кг.','Число по его доле находим умножением.'],why:{ok:'Число по доле — умножаем',no:['Число по доле — делим']},calc:[4,'·',6],u:'(кг)'}],answer:{q:'Ответ: сколько кг картофеля?',ok:24,text:'24 кг картофеля купили.'}})]},
 {n:5,title:'Периметр и половина метра',text:'Верно ли утверждение, что периметр треугольника ABC со сторонами 17 см, 21 см, 14 см равен одной второй части метра?',rule:RULE_FRAC+RULE_PER,items:[
   (()=>{const t=taskItem({top:'',acts:[{q:'Периметр треугольника: что делаем?',opts:['17 + 21 + 14','17 · 21','17 + 21'],ok:0,hints:['Периметр — все стороны вместе.','Сложи все три стороны.'],why:{ok:'Все три стороны вместе',no:['Только две стороны']},calc:[17,'+',21,'+',14],u:'(см)',lbl:'P',chint:['Сложи по очереди: сначала 17 + 21, потом прибавь 14.','17 + 21 = 38.']}]});
     t.steps.push({k:'num',q:`1 м = 100 см. Сколько сантиметров в ${FR(1,2)} метра?`,ok:50,hints:['Одна вторая — половина.','100 : 2 = ?'],board:t.steps[t.steps.length-1].board+BL(`${FR(1,2)} м = 100 : 2 = 50 (см)`)},
       {k:'pick',q:'Верно ли утверждение?',opts:['Неверно','Верно'],ok:0,hints:['Сравни периметр и половину метра.','52 см и 50 см — равны?'],why:{ok:'52 см не равно 50 см',no:['52 см = 50 см']},board:t.steps[t.steps.length-1].board+BL(`${FR(1,2)} м = 50 см`)+BL('Ответ: неверно, периметр 52 см, а половина метра — 50 см.')});return t})()]}
]};

/* ===== Тетрадь: страницы 48–57 ===== */
const RULE_CHK=`<p><b>Проверка вычитания:</b> разность + вычитаемое = уменьшаемое.</p><p><b>Проверка сложения:</b> сумма − одно слагаемое = другое слагаемое.</p>`;
const RULE_DIVCHK=`<p><b>Проверка деления:</b> частное · делитель = делимое.</p><p><b>Проверка умножения:</b> произведение : один множитель = другой множитель.</p>`;
/* вычисли и проверь (сложение/вычитание) */
function chkItem(a,o,b){
  const r=apply(a,o,b);const ca=o==='−'?[r,'+',b]:[r,'−',b],cr=apply(...ca);
  return {start:BL(`${a} ${o} ${b} = ${QQ}`),steps:[Object.assign(calcStep(a,o,b),{board:BL(`${a} ${o} ${b} = <b>${r}</b>`)}),
    {k:'pick',q:'Как проверить?',opts:shuffle([`${ca[0]} ${ca[1]} ${ca[2]}`,`${r} ${ca[1]==='+'?'−':'+'} ${b}`]),okv:`${ca[0]} ${ca[1]} ${ca[2]}`,hints:[o==='−'?'Проверка вычитания: к разности прибавь вычитаемое.':'Проверка сложения: из суммы вычти одно слагаемое.','Должно получиться '+(o==='−'?'уменьшаемое.':'другое слагаемое.')],why:{ok:o==='−'?'Разность + вычитаемое = уменьшаемое':'Сумма − слагаемое = другое слагаемое',no:[o==='−'?'Разность − вычитаемое = уменьшаемое':'Сумма + слагаемое = слагаемое']},board:BL(`${a} ${o} ${b} = <b>${r}</b>`)+BL(`Проверка: ${ca[0]} ${ca[1]} ${ca[2]} = ?`)},
    Object.assign(calcStep(...ca,'Проверка:'),{board:BL(`${a} ${o} ${b} = <b>${r}</b>`)+BL(`Проверка: ${ca[0]} ${ca[1]} ${ca[2]} = ${cr} ✓`)})].map(x=>{if(x.okv)x.ok=x.opts.indexOf(x.okv);return x}),
    record:`${a} ${o} ${b} = <b>${r}</b>`+PEN2(`${ca[0]} ${ca[1]} ${ca[2]} = ${cr}`)};
}
/* части: «в n раз больше и на d больше» */
function partsTask(o){ /* {top,nm1,nm2,n,d,u,ans} — второе в n раз больше первого и на d больше */
  const p=o.d/(o.n-1),big=p*o.n;
  return taskItem({top:o.top,pre:[{k:'num',q:`Если ${o.nm1} — 1 часть, то сколько таких частей в «${o.nm2}»?`,ok:o.n,hints:[`«В ${o.n} раз больше» — значит, ${o.n} таких частей.`,`Сколько раз взяли 1 часть?`]},
      {k:'num',q:`На сколько частей «${o.nm2}» больше, чем «${o.nm1}»?`,ok:o.n-1,hints:[`${o.n} частей и 1 часть — какая разница?`,`${o.n} − 1 = ?`]}],
    acts:[{q:`${o.n-1} частей — это ${o.d} ${o.u}. Сколько в 1 части?`,opts:[`${o.d} : ${o.n-1}`,`${o.d} − ${o.n-1}`,`${o.d} · ${o.n-1}`],ok:0,hints:[`${o.d} делим на ${o.n-1} равных частей.`,'Одна часть — делим.'],why:{ok:'Равные части — делим',no:['Отнимаем части']},calc:[o.d,':',o.n-1],u:`(${o.u})`,lbl:o.nm1},
          {q:`Сколько в «${o.nm2}» (${o.n} частей)?`,opts:[`${p} · ${o.n}`,`${p} + ${o.n}`,`${p} + ${o.d}`],ok:0,hints:[`${o.n} частей по ${p}.`,`По ${p} взять ${o.n} раз.`],why:{ok:`${o.n} частей по ${p}`,no:[`К ${p} прибавить ${o.n}`]},calc:[p,'·',o.n],u:`(${o.u})`,lbl:o.nm2}],
    answer:o.ans(big,p)});
}
const RULE_PARTS=`<p>Если одно число <b>в n раз больше</b> другого, меньшее — 1 часть, большее — n частей.</p><p>Разница — (n − 1) частей. Узнай, сколько в 1 части, и умножь.</p>`;

PAGES.wb[48]={lesson:'Уроки 54–55. Уравнение. Решение уравнений',rule:RULE_EQ,ex:[
 {n:1,title:'Подчеркни уравнения',text:'Подчеркни уравнения.',rule:RULE_EQ,items:[
   multiItem('Нажми на уравнения, потом «Проверить».',['78 − <i class="var">x</i> = 34','87 &gt; 78 + <i class="var">c</i>','67 − <i class="var">a</i> &lt; 90','<i class="var">m</i> + 56 = 90'],[0,3],['Уравнение — это равенство (знак «=») с неизвестным числом-буквой.','Где стоит знак «=», а где «&lt;» или «&gt;»?'],{extra:'Отмечено лишнее. В уравнении обязательно знак «=».',miss:'Отмечены не все.',none:'Ничего не отмечено.'})]},
 {n:2,title:'Вычисли, выполни проверку',text:'Вычисли, выполни проверку.',rule:RULE_CHK,items:[chkItem(100,'−',34),chkItem(63,'−',19),chkItem(82,'−',46),chkItem(37,'+',48)]},
 {n:3,title:'Реши уравнения',text:'Реши уравнения.',rule:RULE_EQ,items:[eqItem('60 − x = 12'),eqItem('4 + x = 64'),eqItem('x − 28 = 36')]},
 {n:4,title:'Саша и Кирилл',text:'Саша решил 27 примеров. Это третья часть тех примеров, которые решил Кирилл. На сколько меньше примеров решил Саша, чем Кирилл?',rule:RULE_FRAC,items:[
   recTask({rows:[{l:'Саша',q:'Сколько примеров решил Саша?',ok:27,v:'27'},{l:'Кирилл',q:`Саша решил какую часть от Кирилла? ${FR(1,'?')}`,ok:3,v:`27 — это ${FR(1,3)}`,at:1,vAt:'81'}],
     acts:[{q:'Сколько примеров решил Кирилл?',opts:['27 : 3','27 · 3','27 + 3'],ok:1,hints:['27 — одна третья часть. Всё — это 3 таких части.','Число по его доле — умножаем.'],why:{ok:'Число по доле — умножаем',no:['Число по доле — делим']},calc:[27,'·',3],u:'(пр.)',lbl:'Кирилл'},
           {q:'На сколько меньше решил Саша?',opts:['81 : 27','81 − 27','81 + 27'],ok:1,hints:['«На сколько меньше» — какое действие?','Из большего вычитаем меньшее.'],why:WHY_DIFF,calc:[81,'−',27],u:'(пр.)'}],
     answer:{q:'Ответ: на сколько меньше?',ok:54,text:'на 54 примера меньше решил Саша, чем Кирилл.'}})]},
 {n:5,title:'Длина ломаной',text:'Вычисли длину ломаной. Начерти ломаную. 3 см · 3 + 2 см · 2 = ? см',rule:RULE_ORDER,items:[
   (()=>{const v=valueItem('3 · 3 + 2 · 2',{});v.steps.push({k:'num',q:'«3 см · 3» — это 3 звена по 3 см. А «2 см · 2»? Сколько всего звеньев у ломаной?',ok:5,hints:['3 звена по 3 см и ещё … звена по 2 см.','Сложи количество звеньев.'],board:v.steps[v.steps.length-1].board},
     {k:'note',q:'Начерти ломаную в тетради по линейке: сначала звенья по 3 см, потом по 2 см.',btn:'Начертила',board:v.steps[v.steps.length-1].board});v.record+=' (см)';return v})()]}
]};

PAGES.wb[49]={lesson:'Уроки 56–57. Решение уравнений',rule:RULE_EQ,ex:[
 {n:1,title:'Где неизвестное ищем сложением',text:'Подчеркни уравнения, в которых неизвестное число надо найти сложением.',rule:RULE_EQ,items:[
   multiItem('Нажми на уравнения, где x найдём сложением, потом «Проверить».',['<i class="var">x</i> · 12 = 60','<i class="var">x</i> − 34 = 17','90 : <i class="var">x</i> = 15','<i class="var">x</i> − 27 = 52'],[1,3],['Сложением находим неизвестное уменьшаемое: разность + вычитаемое.','Где x стоит первым перед знаком «−»?'],{extra:'Отмечено лишнее. Умножение и деление решаем делением или умножением.',miss:'Отмечены не все.',none:'Ничего не отмечено.'})]},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_ORDER+RULE_DIV22,items:[valueItem('68 : (56 : 14)',{}),valueItem('100 − 98 : 7',{}),valueItem('75 : (45 : 3)',{}),valueItem('(90 − 39) : 3',{})]},
 {n:3,title:'Реши уравнения',text:'Реши уравнения.',rule:RULE_EQ,items:[eqItem('x · 14 = 70'),eqItem('x : 7 = 14'),eqItem('90 : x = 15')]},
 {n:4,title:'Заяц, волк и лиса',text:`Заяц весит 4 кг. Он в 10 раз легче волка. Сколько весит лиса, если её масса составляет ${FR(1,5)} от массы волка?`,rule:RULE_FRAC,items:[
   recTask({rows:[{l:'Заяц',q:'Сколько весит заяц?',ok:4,v:'4 кг'},{l:'Волк',q:'Во сколько раз заяц легче волка?',ok:10,v:'в 10 раз тяжелее зайца',at:1,vAt:'40 кг'},{l:'Лиса',q:`Лиса — какая часть от волка? ${FR(1,'?')}`,ok:5,v:`${FR(1,5)} от волка`,at:2,vAt:'8 кг'}],
     acts:[{q:'Сколько весит волк?',opts:['4 · 10','4 : 10','4 + 10'],ok:0,hints:['Заяц легче в 10 раз — значит, волк тяжелее в 10 раз.','«В … раз больше» — умножаем.'],why:{ok:'Волк тяжелее в 10 раз — умножаем',no:['«Легче» — делим']},calc:[4,'·',10],u:'(кг)',lbl:'волк'},
           {q:`Сколько весит лиса (${FR(1,5)} от 40)?`,opts:['40 : 5','40 · 5','40 − 5'],ok:0,hints:['Долю числа находим делением.','40 делим на 5 равных частей.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[40,':',5],u:'(кг)',lbl:'лиса'}],
     answer:{q:'Ответ: сколько весит лиса (кг)?',ok:8,text:'лиса весит 8 кг.'}})]},
 {n:5,title:'Проволока вокруг клумбы',text:'Клумба имеет прямоугольную форму. Её ширина — 5 м, а длина на 3 м больше. Она обнесена проволокой в 3 ряда. Сколько метров проволоки понадобилось?',rule:RULE_P,items:[
   recTask({rows:[{l:'Ширина',q:'Чему равна ширина?',ok:5,v:'5 м'},{l:'Длина',q:'На сколько метров длина больше?',ok:3,v:'на 3 м больше',at:1,vAt:'8 м'},{l:'Рядов проволоки',q:'Сколько рядов проволоки?',ok:3,v:'3'}],
     acts:[{q:'Как найти длину?',opts:['5 + 3','5 · 3','5 − 3'],ok:0,hints:['«На 3 м больше» — какое действие?','Прибавляем.'],why:{ok:'«На … больше» — прибавляем',no:['«На … больше» — умножаем']},calc:[5,'+',3],u:'(м)',lbl:'длина'},...perSteps(8,5,'(м)'),
           {q:'Проволока в 3 ряда. Сколько всего метров?',opts:['26 · 3','26 + 3','26 : 3'],ok:0,hints:['Каждый ряд — это один периметр.','3 ряда по 26 м.'],why:{ok:'3 ряда по периметру',no:['Прибавляем 3 м']},calc:[26,'·',3],u:'(м)'}],
     answer:{q:'Ответ: сколько метров проволоки?',ok:78,text:'78 м проволоки понадобилось.'}})]}
]};

PAGES.wb[50]={lesson:'Уроки 58–59. Построение прямоугольника',rule:RULE_P,ex:[
 {n:1,title:'Прямоугольник MKNL',text:'Начерти прямоугольник MKNL с длиной 4 см и шириной 2 см.',rule:RULE_P,items:[
   {start:BL('Прямоугольник MKNL'),steps:[anglePick('Какие углы у прямоугольника?','прямой',{ok:'Все углы прямые',no:['Все углы острые']},['Прямо-угольник.','Как уголок тетради.']),
     {k:'pick',q:'Какие стороны у прямоугольника равны?',opts:['Противоположные','Соседние'],ok:0,hints:['Верхняя и нижняя стороны — одинаковые?','Длина напротив длины, ширина напротив ширины.'],why:{ok:'Противоположные стороны равны',no:['Все стороны разные']}},
     {k:'nums',q:'Какой длины будут стороны? Выпиши из задания.',fields:[{ok:4,u:'см и'},{ok:2,u:'см'}],hints:['Длина и ширина — в задании.','Сначала длина, потом ширина.'],board:BL('MKNL: длина 4 см, ширина 2 см')},
     {k:'note',q:'Начерти в тетради по клеточкам и линейке: длину, потом от её концов под прямым углом — ширину. Соедини. Подпиши вершины M, K, N, L по кругу.',btn:'Начертила',board:BL('MKNL: 4 см × 2 см ✓')}],record:'Прямоугольник MKNL: длина 4 см, ширина 2 см.'}]},
 {n:2,title:'Дополни треугольники',text:'Дополни треугольники до прямоугольника. Обозначь прямоугольники буквами.',rule:RULE_TRI,items:[
   {start:BL('Треугольники в тетради'),steps:[anglePick('Какой угол есть у этих треугольников?','прямой',{ok:'Они прямоугольные',no:['У них все углы острые']},['Посмотри на угол в клеточках.','Он как уголок тетради.']),
     {k:'num',q:'Сколько вершин у прямоугольника? А у треугольника 3. Сколько вершин надо добавить?',ok:1,hints:['У прямоугольника 4 вершины.','4 − 3 = ?'],board:BL('Добавить 1 вершину')},
     {k:'note',q:'Найди по клеточкам четвёртую вершину: напротив прямого угла. Проведи от неё две стороны по линейке. Подпиши вершины буквами.',btn:'Сделала',board:BL('Треугольники дополнены до прямоугольников ✓')}],record:'Треугольники дополнены до прямоугольников, вершины подписаны.'}]},
 {n:3,title:'Прямоугольник ABCD',text:'Начерти прямоугольник ABCD с длиной 6 см и шириной 2 см. Обозначь его буквами. Вычисли периметр.',rule:RULE_P,items:[
   taskItem({top:'',pre:[{k:'nums',q:'Выпиши длину и ширину из задания.',fields:[{ok:6,u:'см и'},{ok:2,u:'см'}],hints:['Длина и ширина — в задании.','Сначала длина.']},{k:'note',q:'Начерти по клеточкам и линейке, подпиши вершины A, B, C, D по кругу.',btn:'Начертила'}],acts:perSteps(6,2),answer:{q:'Ответ: периметр (см)?',ok:16,text:'периметр прямоугольника ABCD 16 см.'}})]},
 {n:4,title:'Ширина — треть длины',text:'Ширина прямоугольника — 9 см, что составляет третью часть от его длины. Найди периметр данного прямоугольника.',rule:RULE_P+RULE_FRAC,items:[
   recTask({rows:[{l:'Ширина',q:'Чему равна ширина?',ok:9,v:'9 см'},{l:'Длина',q:`Ширина — какая часть длины? ${FR(1,'?')}`,ok:3,v:`ширина — ${FR(1,3)} длины`,at:1,vAt:'27 см'}],
     acts:[{q:'Как найти длину?',opts:['9 : 3','9 · 3','9 + 3'],ok:1,hints:['9 см — одна третья. Длина — 3 таких части.','Число по его доле — умножаем.'],why:{ok:'Число по доле — умножаем',no:['Число по доле — делим']},calc:[9,'·',3],u:'(см)',lbl:'длина'},...perSteps(27,9)],
     answer:{q:'Ответ: периметр (см)?',ok:72,text:'периметр прямоугольника 72 см.'}})]},
 {n:5,title:'Прямоугольник OPST',text:'Длина прямоугольника OPST в 4 раза больше его ширины. Ширина прямоугольника OPST на 18 см меньше его длины. Вычисли периметр прямоугольника OPST.',rule:RULE_PARTS+RULE_P,items:[
   (()=>{const t=partsTask({top:'',nm1:'ширина',nm2:'длина',n:4,d:18,u:'см',ans:()=>({q:'',ok:0,text:''})});t.steps.pop();
     const per=taskItem({top:'',acts:perSteps(24,6),answer:{q:'Ответ: периметр (см)?',ok:60,text:'периметр прямоугольника OPST 60 см.'}});
     const last=t.steps[t.steps.length-1].board;per.steps.forEach(s=>s.board=last+s.board);t.steps=t.steps.concat(per.steps);return t})()]}
]};

PAGES.wb[51]={lesson:'Урок 60. Проверка умножения',rule:RULE_DIVCHK,ex:[
 {n:1,title:'Выполни по образцу',text:'Выполни по образцу: 7 · 9 = 63, 63 : 7 = 9, 63 : 9 = 7.',rule:RULE_DIVCHK+RULE_MUL2,items:[[16,5],[19,4]].map(([a,b])=>{const m=mulItem(a,b),r=a*b;
   m.steps.push({k:'num',q:`Проверка: ${r} : ${a} = ${QQ}`,ok:b,hints:['Произведение делим на один множитель — получим другой.','Посмотри на пример.'],board:BL(m.record)+BL(`${r} : ${a} = ${b}`)},{k:'num',q:`${r} : ${b} = ${QQ}`,ok:a,hints:['Произведение делим на другой множитель.','Получится первый множитель.'],board:BL(m.record)+BL(`${r} : ${a} = ${b}`)+BL(`${r} : ${b} = ${a}`)});
   m.record+=`<br>${r} : ${a} = ${b}<br>${r} : ${b} = ${a}`;return m})},
 {n:2,title:'Найди значения выражений',text:'Найди значения выражений.',rule:RULE_ORDER,items:[valueItem('80 : 20 : 1 · 15',{}),valueItem('(65 + 27) : (60 : 15)',{}),valueItem('(13 · 7 − 79) · 4',{}),valueItem('35 : 5 · 0 + 67',{})]},
 {n:3,title:'Реши уравнения',text:'Реши уравнения.',rule:RULE_EQ,items:[eqItem('x · 4 = 68'),eqItem('x · 6 = 96'),eqItem('x · 18 = 90')]},
 {n:4,title:'Конфеты, зефир, карамель',text:'В магазин привезли 59 кг шоколадных конфет, зефира, карамелек. Карамелек привезли 36 кг. Масса шоколадных конфет составила шестую часть от массы карамелек. Сколько килограммов зефира привезли в магазин?',rule:RULE_FRAC,items:[
   recTask({rows:[{l:'Всего',q:'Сколько кг привезли всего?',ok:59,v:'59 кг'},{l:'Карамель',q:'Сколько кг карамелек?',ok:36,v:'36 кг'},{l:'Шоколадные',q:`Шоколадные — какая часть от карамелек? ${FR(1,'?')}`,ok:6,v:`${FR(1,6)} от карамелек`,at:1,vAt:'6 кг'},{l:'Зефир',v0:'?',at:3,vAt:'17 кг'}],
     acts:[{q:'Сколько кг шоколадных конфет?',opts:['36 : 6','36 · 6','36 − 6'],ok:0,hints:['Шестая часть от 36.','Долю числа — делим.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[36,':',6],u:'(кг)',lbl:'шоколадные'},
           {q:'Сколько кг карамелек и шоколадных вместе?',opts:['36 + 6','36 − 6','36 · 6'],ok:0,hints:['Вместе — складываем.','Карамель + шоколадные.'],why:WHY_SUM,calc:[36,'+',6],u:'(кг)',lbl:'карамель и шоколадные'},
           {q:'Сколько кг зефира?',opts:['59 − 42','59 + 42','42 − 17'],ok:0,hints:['Из всего убери то, что уже знаешь.','Всего − (карамель и шоколадные).'],why:{ok:'Всего − известные части',no:['Всего + части']},calc:[59,'−',42],u:'(кг)',lbl:'зефир'}],
     answer:{q:'Ответ: сколько кг зефира?',ok:17,text:'17 кг зефира привезли в магазин.'}})]},
 {n:5,title:'Стороны прямоугольника EFPS',text:'Одна вторая часть периметра прямоугольника EFPS равна 15 см. Длина этого прямоугольника в 4 раза больше его ширины. Найди длины сторон прямоугольника.',rule:RULE_P+RULE_PARTS,items:[
   taskItem({top:'',pre:[{k:'pick',q:`${FR(1,2)} периметра — это что?`,opts:['Длина + ширина','Только длина','Длина · ширина'],ok:0,hints:['Периметр — 2 длины и 2 ширины. А половина?','Одна длина и одна ширина.'],why:{ok:'Половина периметра = длина + ширина',no:['Половина периметра = длина']}},
       {k:'num',q:'Если ширина — 1 часть, длина — 4 части. Сколько частей в длине + ширине?',ok:5,hints:['4 части + 1 часть.','4 + 1 = ?']}],
     acts:[{q:'5 частей — это 15 см. Сколько в 1 части (ширина)?',opts:['15 : 5','15 − 5','15 · 5'],ok:0,hints:['15 см делим на 5 равных частей.','Делим.'],why:{ok:'Равные части — делим',no:['Отнимаем части']},calc:[15,':',5],u:'(см)',lbl:'ширина'},
           {q:'Длина — 4 части. Сколько см?',opts:['3 · 4','3 + 4','15 − 4'],ok:0,hints:['4 части по 3 см.','По 3 взять 4 раза.'],why:{ok:'4 части по 3 см',no:['3 + 4']},calc:[3,'·',4],u:'(см)',lbl:'длина'}],
     answer:{q:'Ответ: длина (см)?',ok:12,text:'длина 12 см, ширина 3 см.'}})]}
]};

PAGES.wb[52]={lesson:'Уроки 61–62. Проверка деления',rule:RULE_DIVCHK,ex:[
 {n:1,title:'Где неизвестное ищем делением',text:'Подчеркни уравнения, в которых неизвестное число нужно найти действием деления.',rule:RULE_EQ,items:[
   multiItem('Нажми на уравнения, где x найдём делением, потом «Проверить».',['<i class="var">x</i> : 5 = 14','<i class="var">x</i> + 25 = 67','<i class="var">x</i> · 14 = 60','66 : <i class="var">x</i> = 6'],[2,3],['Делением находим неизвестный множитель и неизвестный делитель.','Где x — множитель? Где x — делитель?'],{extra:'Отмечено лишнее. Делимое находим умножением, слагаемое — вычитанием.',miss:'Отмечены не все.',none:'Ничего не отмечено.'})]},
 {n:2,title:'Вычисли и проверь',text:'Вычисли. Выполни проверку способом нахождения делимого.',rule:RULE_DIV2+RULE_DIVCHK,items:[divItem(68,4,1),divItem(98,7,1),divItem(84,6,1),divItem(90,5,1)]},
 {n:3,title:'Реши уравнения',text:'Реши уравнения.',rule:RULE_EQ,items:[eqItem('70 : x = 14'),eqItem('91 : x = 77 : 11'),eqItem('x : 7 = 90 : 9')]},
 {n:4,title:'Книги со сказками',text:'В библиотеке книг со сказками в 6 раз больше, чем со стихами, и на 40 книг больше, чем со стихами. Сколько книг со сказками в библиотеке?',rule:RULE_PARTS,items:[
   partsTask({top:BL('Стихи — 1 часть. Сказки — в 6 раз больше и на 40 больше.'),nm1:'стихи',nm2:'сказки',n:6,d:40,u:'кн.',ans:b=>({q:'Ответ: сколько книг со сказками?',ok:b,text:`${b} книг со сказками в библиотеке.`})})]},
 {n:5,title:'Длина по периметру',text:'Периметр прямоугольника равен 14 см. Его ширина равна 2 см. Найди длину прямоугольника и начерти его.',rule:RULE_P,items:[
   (()=>{const t=recTask({rows:[{l:'Периметр',q:'Чему равен периметр?',ok:14,v:'14 см'},{l:'Ширина',q:'Чему равна ширина?',ok:2,v:'2 см'},{l:'Длина',v0:'?',at:2,vAt:'5 см'}],
     acts:[{q:'Сколько длина + ширина (половина периметра)?',opts:['14 : 2','14 − 2','14 · 2'],ok:0,hints:['Периметр — 2 длины и 2 ширины.','Половину — делим на 2.'],why:{ok:'Длина + ширина = половина периметра',no:['Из периметра вычесть ширину']},calc:[14,':',2],u:'(см)',lbl:'длина + ширина'},
           {q:'Как найти длину?',opts:['7 − 2','7 + 2','7 : 2'],ok:0,hints:['Длина + 2 = 7.','Неизвестное слагаемое — вычитаем.'],why:{ok:'Из суммы вычитаем ширину',no:['Складываем']},calc:[7,'−',2],u:'(см)',lbl:'длина'}],
     answer:{q:'Ответ: длина (см)?',ok:5,text:'длина прямоугольника 5 см.'}});
     t.steps.push({k:'note',q:'Начерти этот прямоугольник в тетради по клеточкам и линейке.',btn:'Начертила',board:t.steps[t.steps.length-1].board});return t})()]}
]};

PAGES.wb[53]={lesson:'Уроки 63–65. Закрепление',rule:RULE_DIV22,ex:[
 {n:1,title:'Делимое, делитель, частное',text:'Обведи в овал делимое. Делители подчеркни одной линией, а частное — двумя.',rule:'<p>В записи <b>75 : 5 = 15</b>: 75 — делимое, 5 — делитель, 15 — частное.</p>',items:[[75,5,15],[96,24,4]].map(([a,b,c])=>({start:BL(`${a} : ${b} = ${c}`),steps:[
   {k:'pick',q:'Какое число — делимое (его делят)?',opts:[String(a),String(b),String(c)],ok:0,hints:['Делимое — то, что делят.','Оно стоит перед знаком «:».'],board:BL(`<span class="ov">${a}</span> : ${b} = ${c}`)},
   {k:'pick',q:'Какое число — делитель (на него делят)?',opts:[String(a),String(b),String(c)],ok:1,hints:['Делитель — на что делят.','Он стоит после знака «:».'],board:BL(`<span class="ov">${a}</span> : <span class="u1">${b}</span> = ${c}`)},
   {k:'pick',q:'Какое число — частное (результат)?',opts:[String(a),String(b),String(c)],ok:2,hints:['Частное — результат деления.','Оно после знака «=».'],board:BL(`<span class="ov">${a}</span> : <span class="u1">${b}</span> = <span class="u2">${c}</span>`)}],
   record:`<span class="ov">${a}</span> : <span class="u1">${b}</span> = <span class="u2">${c}</span>`}))},
 {n:2,title:'Вычисли',text:'Вычисли.',rule:RULE_MUL2+RULE_DIV2+RULE_DIV22,items:[mulItem(14,7),mulItem(25,4),divItem(96,6),divItem(80,5),div2Item(90,15),div2Item(70,14),div2Item(84,12),div2Item(57,19)]},
 {n:3,title:'Реши уравнения',text:'Реши уравнения.',rule:RULE_EQ,items:[eqItem('x · 17 = 68'),eqItem('54 : x = 18'),eqItem('x : 5 = 16')]},
 {n:4,title:'Сколько лет бабушке',text:'Тёте 36 лет. Возраст её дочери составляет третью часть возраста тёти. Бабушка старше внучки на 47 лет. Сколько лет бабушке?',rule:RULE_FRAC,items:[
   recTask({rows:[{l:'Тётя',q:'Сколько лет тёте?',ok:36,v:'36 лет'},{l:'Дочь (внучка)',q:`Дочь — какая часть от возраста тёти? ${FR(1,'?')}`,ok:3,v:`${FR(1,3)} от 36`,at:1,vAt:'12 лет'},{l:'Бабушка',q:'На сколько лет бабушка старше внучки?',ok:47,v:'на 47 лет старше внучки',at:2,vAt:'59 лет'}],
     acts:[{q:'Сколько лет дочери?',opts:['36 : 3','36 · 3','36 − 3'],ok:0,hints:['Третья часть от 36.','Долю числа — делим.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[36,':',3],u:'(л.)',lbl:'дочь'},
           {q:'Сколько лет бабушке?',opts:['12 + 47','47 − 12','12 · 47'],ok:0,hints:['Бабушка старше внучки на 47 лет.','«Старше на» — прибавляем.'],why:{ok:'«Старше на» — прибавляем',no:['«Старше на» — вычитаем']},calc:[12,'+',47],u:'(л.)',lbl:'бабушка'}],
     answer:{q:'Ответ: сколько лет бабушке?',ok:59,text:'59 лет бабушке.'}})]},
 {n:5,title:'Прямоугольник MNOP',text:'Ширина прямоугольника MNOP равна четвёртой части его длины. Длина этого прямоугольника на 12 см больше, чем ширина. Найди периметр прямоугольника MNOP.',rule:RULE_PARTS+RULE_P,items:[
   (()=>{const t=partsTask({top:'',nm1:'ширина',nm2:'длина',n:4,d:12,u:'см',ans:()=>({q:'',ok:0,text:''})});t.steps.pop();
     const per=taskItem({top:'',acts:perSteps(16,4),answer:{q:'Ответ: периметр (см)?',ok:40,text:'периметр прямоугольника MNOP 40 см.'}});
     const last=t.steps[t.steps.length-1].board;per.steps.forEach(s=>s.board=last+s.board);t.steps=t.steps.concat(per.steps);return t})()]}
]};

PAGES.wb[54]={lesson:'Уроки 66–67. Деление с остатком',rule:RULE_REM,ex:[
 {n:1,title:'Каким может быть остаток',text:'Напиши, каким может быть остаток при делении на 7 и на 5.',rule:RULE_REM,items:[[7,9],[5,7]].map(([b,mx])=>({start:BL(`Остаток при делении на ${b}`),steps:[{k:'multi',raw:1,q:`Нажми на все числа, которые могут быть остатком при делении на ${b}.`,opts:Array.from({length:mx+1},(_,i)=>String(i)),ok:Array.from({length:b-1},(_,i)=>i+1),hints:[`Остаток всегда меньше делителя (${b}).`,'И остаток не бывает 0 — тогда делится без остатка.'],msgs:{extra:`Отмечено лишнее. Остаток меньше ${b} и не 0.`,miss:'Отмечены не все.',none:'Ничего не отмечено.'}}],record:`${b} — ${Array.from({length:b-1},(_,i)=>i+1).join(', ')}`}))},
 {n:2,title:'Выполни деление с остатком',text:'Выполни деление с остатком.',rule:RULE_REM,items:[[37,5],[27,4],[92,9],[6,8],[49,6],[28,3],[34,10],[89,8]].map(([a,b])=>remItem(a,b))},
 {n:3,title:'Составь и реши уравнения',text:'Составь и реши уравнения. Неизвестное число уменьшили в 15 раз и получили 6. Неизвестное число уменьшили на 15 и получили 6. Неизвестное число увеличили в 15 раз и получили 60.',rule:RULE_EQ+RULE_WORDS,items:[
   ['Неизвестное число уменьшили в 15 раз и получили 6.','x : 15 = 6',['x − 15 = 6','x · 15 = 6']],['Неизвестное число уменьшили на 15 и получили 6.','x − 15 = 6',['x : 15 = 6','x + 15 = 6']],['Неизвестное число увеличили в 15 раз и получили 60.','x · 15 = 60',['x + 15 = 60','x : 15 = 60']]].map(([txt,eq,w])=>{
     const it=eqItem(eq);const o=shuffle([eq,...w]);it.steps.unshift({k:'pick',q:'Какое уравнение подходит?',opts:o.map(X),ok:o.indexOf(eq),hints:['«Уменьшить в … раз» — делим, «на …» — вычитаем, «увеличить в … раз» — умножаем.','Неизвестное число — это x.'],why:{ok:'«В … раз» — умножаем или делим',no:['«В … раз» — прибавляем или вычитаем']},board:BL(txt)+BL(X(eq))});
     it.start=BL(txt);return it})},
 {n:4,title:'Черешня',text:'Собрали 72 кг черешни. Четвёртую часть пустили на джемы, а 25 кг продали. Сколько килограммов черешни осталось?',rule:RULE_FRAC,items:[
   recTask({rows:[{l:'Собрали',q:'Сколько кг собрали?',ok:72,v:'72 кг'},{l:'На джемы',q:`Какую часть пустили на джемы? ${FR(1,'?')}`,ok:4,v:FR(1,4),at:1,vAt:'18 кг'},{l:'Продали',q:'Сколько кг продали?',ok:25,v:'25 кг'}],
     acts:[{q:'Сколько кг пустили на джемы?',opts:['72 : 4','72 · 4','72 − 4'],ok:0,hints:['Четвёртая часть от 72.','Долю числа — делим.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[72,':',4],u:'(кг)',lbl:'на джемы'},
           {q:'Сколько кг израсходовали всего (джемы + продали)?',opts:['18 + 25','25 − 18','18 · 25'],ok:0,hints:['Вместе — складываем.','Джемы и продажа.'],why:WHY_SUM,calc:[18,'+',25],u:'(кг)',lbl:'всего ушло'},
           {q:'Сколько кг осталось?',opts:['72 − 43','72 + 43','43 − 25'],ok:0,hints:['Было − ушло = осталось.','Вычитаем.'],why:{ok:'Было − ушло = осталось',no:['Было + ушло']},calc:[72,'−',43],u:'(кг)',lbl:'осталось'}],
     answer:{q:'Ответ: сколько кг осталось?',ok:29,text:'29 кг черешни осталось.'}})]},
 {n:5,title:'Ширина по периметру',text:'Периметр прямоугольника равен 64 см. Его длина 14 см. Чему равна ширина?',rule:RULE_P,items:[
   recTask({rows:[{l:'Периметр',q:'Чему равен периметр?',ok:64,v:'64 см'},{l:'Длина',q:'Чему равна длина?',ok:14,v:'14 см'},{l:'Ширина',v0:'?',at:2,vAt:'18 см'}],
     acts:[{q:'Сколько длина + ширина (половина периметра)?',opts:['64 : 2','64 − 14','64 · 2'],ok:0,hints:['Периметр — 2 длины и 2 ширины.','Половину — делим на 2.'],why:{ok:'Длина + ширина = половина периметра',no:['Из периметра вычесть длину']},calc:[64,':',2],u:'(см)',lbl:'длина + ширина'},
           {q:'Как найти ширину?',opts:['32 − 14','32 + 14','32 : 14'],ok:0,hints:['14 + ширина = 32.','Неизвестное слагаемое — вычитаем.'],why:{ok:'Из суммы вычитаем длину',no:['Складываем']},calc:[32,'−',14],u:'(см)',lbl:'ширина'}],
     answer:{q:'Ответ: ширина (см)?',ok:18,text:'ширина прямоугольника 18 см.'}})]}
]};

PAGES.wb[55]={lesson:'Уроки 68–69. Проверка деления с остатком',rule:RULE_REM,ex:[
 {n:1,title:'Проверка деления с остатком',text:'Вставь пропущенные числа в проверку деления с остатком.',rule:RULE_REM,items:[
   {start:BL('56 : 6 = 9 (ост. 2)<br>6 · 9 + □ = 56'),steps:[{k:'num',q:'6 · 9 + □ = 56. Какое число в окошке?',ok:2,hints:['К произведению прибавляем остаток.','Посмотри на остаток в записи деления.'],board:BL('56 : 6 = 9 (ост. 2)<br>6 · 9 + <b>2</b> = 56')}],record:'56 : 6 = 9 (ост. 2)<br>6 · 9 + <b>2</b> = 56'},
   {start:BL('66 : 4 = 16 (ост. 2)<br>□ · 16 + 2 = 66'),steps:[{k:'num',q:'□ · 16 + 2 = 66. Какое число в окошке?',ok:4,hints:['Частное умножаем на делитель.','Какой делитель в записи?'],board:BL('66 : 4 = 16 (ост. 2)<br><b>4</b> · 16 + 2 = 66')}],record:'66 : 4 = 16 (ост. 2)<br><b>4</b> · 16 + 2 = 66'}]},
 {n:2,title:'Выполни и проверь',text:'Выполни и проверь деление с остатком.',rule:RULE_REM,items:[remItem(14,12,1),remItem(9,8,1),remItem(38,9,1),remItem(66,8,1)]},
 {n:3,title:'Вставь пропущенные числа',text:'Вставь пропущенные числа, чтобы записи были верными.',rule:RULE_REM,items:[[60,7,'q'],[59,3,'r'],[83,9,'r'],[72,10,'q'],[17,23,'q'],[57,11,'r']].map(([a,b,w])=>{const q=Math.floor(a/b),r=a%b;
   const txt=w==='q'?`${a} : ${b} = □ (ост. ${r})`:`${a} : ${b} = ${q} (ост. □)`,done=`${a} : ${b} = ${q} (ост. ${r})`;
   return {start:BL(txt),steps:[{k:'num',q:`${txt}. Какое число в окошке?`,ok:w==='q'?q:r,hints:w==='q'?[`Какое самое большое число, не больше ${a - r}, делится на ${b}?`,`${b} · ? = ${a-r}`]:[`${b} · ${q} = ? Сколько не хватает до ${a}?`,`Остаток меньше ${b}.`],board:BL(done)}],record:done}})},
 {n:4,title:'Ромашка',text:`Собрали 96 кг лекарственной ромашки. В аптеки отвезли ${FR(1,6)} часть всей собранной ромашки. На сколько килограммов ромашки больше осталось, чем отвезли в аптеки?`,rule:RULE_FRAC,items:[
   recTask({rows:[{l:'Собрали',q:'Сколько кг собрали?',ok:96,v:'96 кг'},{l:'В аптеки',q:`Какую часть отвезли в аптеки? ${FR(1,'?')}`,ok:6,v:FR(1,6),at:1,vAt:'16 кг'},{l:'Осталось',v0:'?',at:2,vAt:'80 кг'}],
     acts:[{q:'Сколько кг отвезли в аптеки?',opts:['96 : 6','96 · 6','96 − 6'],ok:0,hints:['Шестая часть от 96.','Долю числа — делим.'],why:{ok:'Доля числа — делим',no:['Доля числа — умножаем']},calc:[96,':',6],u:'(кг)',lbl:'в аптеки'},
           {q:'Сколько кг осталось?',opts:['96 − 16','96 + 16','16 · 6'],ok:0,hints:['Было − отвезли = осталось.','Вычитаем.'],why:{ok:'Было − отвезли = осталось',no:['Было + отвезли']},calc:[96,'−',16],u:'(кг)',lbl:'осталось'},
           {q:'На сколько больше осталось, чем отвезли?',opts:['80 − 16','80 : 16','80 + 16'],ok:0,hints:['«На сколько больше» — какое действие?','Из большего вычитаем меньшее.'],why:WHY_DIFF,calc:[80,'−',16],u:'(кг)'}],
     answer:{q:'Ответ: на сколько кг больше?',ok:64,text:'на 64 кг ромашки больше осталось, чем отвезли в аптеки.'}})]},
 {n:5,title:'Прямоугольник по доле',text:'Ширина прямоугольника 2 см. Она составляет третью часть его длины. Построй такой прямоугольник. Обозначь его буквами. Вычисли периметр.',rule:RULE_P+RULE_FRAC,items:[
   (()=>{const t=recTask({rows:[{l:'Ширина',q:'Чему равна ширина?',ok:2,v:'2 см'},{l:'Длина',q:`Ширина — какая часть длины? ${FR(1,'?')}`,ok:3,v:`ширина — ${FR(1,3)} длины`,at:1,vAt:'6 см'}],
     acts:[{q:'Как найти длину?',opts:['2 : 3','2 · 3','2 + 3'],ok:1,hints:['2 см — одна третья часть. Длина — 3 таких части.','Число по его доле — умножаем.'],why:{ok:'Число по доле — умножаем',no:['Число по доле — делим']},calc:[2,'·',3],u:'(см)',lbl:'длина'},...perSteps(6,2)],
     answer:{q:'Ответ: периметр (см)?',ok:16,text:'P = 16 см.'}});
     t.steps.push({k:'note',q:'Построй этот прямоугольник в тетради по клеточкам и линейке. Подпиши вершины латинскими буквами.',btn:'Построила',board:t.steps[t.steps.length-1].board});return t})()]}
]};

/* площади: свои рисунки (по мотивам тетради) */
const triCells=`<svg viewBox="-2 -2 48 48" width="48" height="48" role="img" aria-label="треугольник"><path d="M0 0V44H44Z" fill="#E7F1FF" stroke="#26224F" stroke-width="2"/></svg>`;
const sqBig=`<svg viewBox="-2 -2 48 48" width="48" height="48" role="img" aria-label="квадрат"><rect width="44" height="44" fill="#E7F1FF" stroke="#26224F" stroke-width="2"/></svg>`;
const sqSmall=`<svg viewBox="-2 -2 26 26" width="26" height="26" role="img" aria-label="маленький квадрат"><rect width="22" height="22" fill="#E7F1FF" stroke="#26224F" stroke-width="2"/></svg>`;
const fig=(svg,n)=>`<figure>${svg}<figcaption>${n}</figcaption></figure>`;
const PIC56=BL(`<div class="pics">${fig(triCells,'1')}${fig(sqBig,'2')}${fig(sqSmall,'3')}</div><p class="smp">Маленький квадрат — 1 см × 1 см</p>`);
PAGES.wb[56]={lesson:'Уроки 70–71. Площадь. Квадратный сантиметр',rule:RULE_AREA,ex:[
 {n:1,title:'Фигура площадью 1 см²',text:'Обведи фигуру, площадь которой равна 1 см². Сравни площади фигур. (Рисунок — как в тетради; сверяй с тетрадью.)',rule:RULE_AREA,items:[
   {start:PIC56,steps:[{k:'pick',q:'Какая фигура — квадрат со стороной 1 см (площадь 1 см²)?',opts:['1','2','3'],ok:2,hints:['1 см² — это квадрат, у которого каждая сторона 1 см.','Самый маленький квадрат.'],why:{ok:'Квадрат 1 см × 1 см',no:['Любой квадрат — 1 см²']},board:PIC56}],record:'Площадь 1 см² — у фигуры 3.'},
   (()=>{const it=signRaw('Площадь фигуры 1','площади фигуры 2','<',['Треугольник помещается внутри квадрата 2?','Треугольник — половина такого квадрата.'],{ok:'Треугольник — половина квадрата',no:['Треугольник больше']});it.start=PIC56+it.start;it.steps[0].board=PIC56+it.steps[0].board;return it})(),
   (()=>{const it=signRaw('Площадь фигуры 3','площади фигуры 1','<',['Сколько маленьких квадратов поместится в треугольнике?','Маленький квадрат меньше треугольника.'],{ok:'Маленький квадрат меньше',no:['Они равны']});it.start=PIC56+it.start;it.steps[0].board=PIC56+it.steps[0].board;return it})()]},
 {n:2,title:'Наименьшая и наибольшая площадь',text:'Напиши, какая фигура имеет наименьшую и наибольшую площадь.',rule:RULE_AREA,items:[
   (()=>{const P=BL(`<div class="pics"><svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="ромб и круг"><path d="M60 4L116 60L60 116L4 60Z" fill="#fff" stroke="#26224F" stroke-width="2"/><circle cx="60" cy="60" r="36" fill="#B9B6C8" stroke="#26224F" stroke-width="2"/></svg><svg viewBox="0 0 140 120" width="140" height="120" role="img" aria-label="треугольник и квадрат"><path d="M70 2L138 118H2Z" fill="#fff" stroke="#26224F" stroke-width="2"/><rect x="48" y="62" width="44" height="44" fill="#B9B6C8" stroke="#26224F" stroke-width="2"/></svg></div>`);
     return {start:P,steps:[{k:'pick',q:'У какой фигуры наименьшая площадь?',opts:['круг','ромб','треугольник','квадрат'],ok:3,hints:['Фигура внутри другой всегда меньше её. Сравни те, что внутри: круг и квадрат.','Какая из закрашенных меньше?'],why:{ok:'Квадрат внутри — и он меньше круга',no:['Ромб самый маленький']},board:P+BL('Наименьшая площадь у квадрата.')},
       {k:'pick',q:'У какой фигуры наибольшая площадь?',opts:['круг','ромб','треугольник','квадрат'],ok:2,hints:['Самая большая — среди внешних: ромб или треугольник.','Сравни ромб и треугольник.'],why:{ok:'Треугольник больше ромба',no:['Круг самый большой']},board:P+BL('Наименьшая площадь у квадрата. Наибольшая — у треугольника.')}],record:'Наименьшая площадь у квадрата, наибольшая — у треугольника.'}})()]},
 {n:3,title:'Площадь каждого прямоугольника',text:'Найди площадь каждого прямоугольника.',rule:RULE_AREA,items:[areaRect('AKMO',6,2),areaRect('DCNL',3,3)]},
 {n:4,title:'Сравни площади фигур',text:'Сравни площади данных фигур, если они разбиты на квадраты со стороной 1 см.',rule:RULE_AREA,items:[
   (()=>{const F=[[[0,0],[1,0],[2,0],[2,1],[2,2],[3,2]],[[0,0],[1,0],[0,1],[1,1],[2,1],[3,1]],[[0,0],[1,0],[1,1],[1,2],[2,2],[3,2],[3,3]]];
     const P=BL(`<div class="pics">${F.map((c,i)=>fig(cellsSVG(c),String(i+1))).join('')}</div>`);
     return {start:P,steps:[...F.map((c,i)=>({k:'num',q:`Сколько квадратов в фигуре ${i+1}?`,ok:c.length,hints:['Считай по рядам.','Отмечай в уме посчитанные.'],board:P+BL(F.slice(0,i+1).map((x,j)=>`${j+1}) ${x.length} см²`).join(', '))})),
       {k:'pick',q:'Что можно сказать о площадях?',opts:['Площади 1 и 2 равны, у 3 — больше','Все равны','У фигуры 1 — самая большая'],ok:0,hints:['Сравни числа, которые получились.','6, 6 и 7.'],why:{ok:'6 = 6, а 7 больше',no:['Все равны']},board:P+BL('S1 = S2 = 6 см², S3 = 7 см² — больше.')}],record:'S1 = 6 см², S2 = 6 см², S3 = 7 см². Площади фигур 1 и 2 равны, площадь фигуры 3 больше.'}})()]},
 {n:5,title:'Прямоугольник и квадрат',text:'Начерти прямоугольник с длиной 5 см и шириной 2 см. Рядом начерти квадрат со стороной 3 см. Обозначь фигуры буквами. Раздели фигуры на квадраты со стороной 1 см. Площадь какой фигуры больше и на сколько?',rule:RULE_AREA,items:[
   (()=>{const t=taskItem({top:'',pre:[{k:'note',q:'Начерти в тетради прямоугольник и квадрат по размерам из задания. Подпиши вершины буквами. Раздели их на квадраты по 1 см.',btn:'Начертила'}],
     acts:[{q:'Площадь прямоугольника: в ряду 5 квадратов, рядов 2. Как найти?',opts:['5 · 2','5 + 2','(5 + 2) · 2'],ok:0,hints:['Квадратов в ряду · рядов.','По 5 взять 2 раза.'],why:{ok:'В ряду · рядов',no:['Это периметр']},calc:[5,'·',2],u:'(см²)',lbl:'прямоугольник'},
           {q:'Площадь квадрата: в ряду 3, рядов 3.',opts:['3 · 3','3 · 4','3 + 3'],ok:0,hints:['Квадратов в ряду · рядов.','По 3 взять 3 раза.'],why:{ok:'В ряду · рядов',no:['Сторона · 4']},calc:[3,'·',3],u:'(см²)',lbl:'квадрат'},
           {q:'На сколько площадь прямоугольника больше?',opts:['10 − 9','10 : 9','10 + 9'],ok:0,hints:['«На сколько больше» — вычитаем.','Из большего вычитаем меньшее.'],why:WHY_DIFF,calc:[10,'−',9],u:'(см²)'}],
     answer:{q:'Ответ: на сколько см² больше?',ok:1,text:'площадь прямоугольника больше на 1 см².'}});return t})()]}
]};

PAGES.wb[57]={lesson:'Уроки 72–74. Палетка. Измерение площадей',rule:RULE_AREA,ex:[
 {n:1,title:'Площади каких фигур равны',text:'Напиши, площади каких фигур равны. (Рисунок — по мотивам тетради; сверяй с тетрадью.)',rule:RULE_AREA,items:[
   (()=>{const F=[[[1,0],[0,1],[1,1],[2,1]],[[0,0],[1,0]],[[0,0],[1,0],[0,1],[1,1]],[[0,0],[0,1]]];const P=BL(`<div class="pics">${F.map((c,i)=>fig(cellsSVG(c),String(i+1))).join('')}</div>`);
     return {start:P,steps:[...F.map((c,i)=>({k:'num',q:`Сколько клеток в фигуре ${i+1}?`,ok:c.length,hints:['Считай клетки по одной.','Отмечай в уме посчитанные.'],board:P+BL(F.slice(0,i+1).map((x,j)=>`${j+1}) ${x.length}`).join(', '))})),
       {k:'pick',q:'Площади каких фигур равны?',opts:['1 и 3, 2 и 4','1 и 2, 3 и 4','1 и 4, 2 и 3'],ok:0,hints:['Найди одинаковые числа.','4 и 4, 2 и 2.'],why:{ok:'Одинаковое число клеток',no:['Одинаковая форма']},board:P+BL('Площади фигур 1 и 3 равны, 2 и 4 равны.')}],record:'Площади фигур 1 и 3 равны (4 клетки), 2 и 4 равны (2 клетки).'}})()]},
 {n:2,title:'Сравни площади',text:'Сравни площади фигур.',rule:RULE_AREA,items:[
   (()=>{const F=[[[0,0],[1,0],[2,0],[3,0]],[[1,0],[1,1],[0,2],[1,2]]];const P=BL(`<div class="pics">${F.map((c,i)=>fig(cellsSVG(c),String(i+1))).join('')}</div>`);
     return {start:P,steps:[{k:'num',q:'Сколько клеток в фигуре 1?',ok:4,hints:['Считай по одной.','Один ряд.'],board:P+BL('1) 4')},{k:'num',q:'Сколько клеток в фигуре 2?',ok:4,hints:['Считай по одной.','Сверху вниз.'],board:P+BL('1) 4, 2) 4')},
       {k:'pick',q:'Какой знак: площадь 1 … площадь 2?',opts:['&lt;','&gt;','='],ok:2,signs:1,hints:['Сравни числа.','4 и 4.'],why:{ok:'4 клетки = 4 клетки',no:['Разная форма — разная площадь']},board:P+BL('S1 = S2 (по 4 клетки)')}],record:'Площадь фигуры 1 = площади фигуры 2 (по 4 клетки).'}})()]},
 {n:3,title:'Большие и маленькие квадраты',text:'Вырази площадь фигуры: а) в больших квадратах; б) в маленьких квадратах. Запиши суммы, заменив сложение умножением.',rule:RULE_AREA,items:[
   (()=>{const cells=[[0,0],[1,0],[0,1],[1,1],[0,2],[1,2],[2,2],[3,2],[0,3],[1,3],[2,3],[3,3]];const P=BL(`<div class="pics">${cellsSVG(cells,{big:[[0,0],[0,2],[2,2]]})}</div>`);
     return {start:P,steps:[{k:'num',q:'а) Сколько больших квадратов (с жирной рамкой)?',ok:3,hints:['Считай жирные рамки.','Каждый большой — 2 × 2 маленьких.'],board:P+BL('а) 3 больших квадрата')},
       {k:'num',q:'Сколько маленьких квадратов в одном большом?',ok:4,hints:['2 в ряду и 2 ряда.','2 · 2 = ?'],board:P+BL('а) 3 больших; в каждом по 4 маленьких')},
       {k:'pick',q:'б) Как записать 4 + 4 + 4 умножением?',opts:['4 · 3','4 + 3','3 · 3'],ok:0,hints:['Сколько раз по 4?','По 4 взять 3 раза.'],why:{ok:'По 4 взять 3 раза',no:['4 + 3']},board:P+BL('б) 4 + 4 + 4 = 4 · 3')},
       Object.assign(calcStep(4,'·',3),{board:P+BL('а) 3 больших квадрата')+BL('б) 4 + 4 + 4 = 4 · 3 = 12 маленьких квадратов')})],record:'а) 3 больших квадрата; б) 4 + 4 + 4 = 4 · 3 = 12 маленьких квадратов.'}})()]},
 {n:4,title:'Площадь в см²',text:'Разбей фигуры на квадраты со стороной 1 см. Найди площадь фигур в см². (Размеры — по мотивам тетради; сверяй с тетрадью.)',rule:RULE_AREA,items:[areaRect('Прямоугольник',6,4),areaRect('Квадрат',3,3)]},
 {n:5,title:'Какая площадь больше',text:'Площадь каждой клетки равна 1 см². Площадь какой фигуры больше? На сколько квадратных сантиметров? (Рисунок — по мотивам тетради.)',rule:RULE_AREA+'<p>Две половинки клетки — это 1 целая клетка.</p>',items:[
   (()=>{const s=22;const P=BL(`<div class="pics"><figure><svg viewBox="-2 -2 ${5*s+4} ${3*s+4}" width="${5*s+4}" height="${3*s+4}" role="img" aria-label="фигура 1"><path d="M0 ${s}L${s} 0H${4*s}V${2*s}L${3*s} ${3*s}H0Z" fill="#E7F1FF" stroke="#26224F" stroke-width="2"/>${[1,2,3].map(i=>`<line x1="${i*s}" y1="0" x2="${i*s}" y2="${3*s}" stroke="#7C86C8"/>`).join('')}${[1,2].map(i=>`<line x1="0" y1="${i*s}" x2="${4*s}" y2="${i*s}" stroke="#7C86C8"/>`).join('')}</svg><figcaption>1</figcaption></figure><figure><svg viewBox="-2 -2 ${4*s+4} ${4*s+4}" width="${4*s+4}" height="${4*s+4}" role="img" aria-label="треугольник"><path d="M0 0V${4*s}H${3*s}Z" fill="#E7F1FF" stroke="#26224F" stroke-width="2"/>${[1,2,3].map(i=>`<line x1="0" y1="${i*s}" x2="${3*s}" y2="${i*s}" stroke="#7C86C8"/>`).join('')}${[1,2].map(i=>`<line x1="${i*s}" y1="0" x2="${i*s}" y2="${4*s}" stroke="#7C86C8"/>`).join('')}</svg><figcaption>2</figcaption></figure></div>`);
     return {start:P,steps:[{k:'num',q:'Фигура 1: сколько в ней целых клеток?',ok:10,hints:['Считай только полные квадратики.','Все клетки, кроме срезанных уголков.'],board:P+BL('Фигура 1: 10 целых')},
       {k:'num',q:'Сколько половинок клеток в фигуре 1?',ok:2,hints:['Посмотри на срезанные уголки.','Где клетка разрезана наискосок?'],board:P+BL('Фигура 1: 10 целых + 2 половинки = 11 см²')},
       {k:'num',q:'Итак, площадь фигуры 1 (2 половинки = 1 клетка)?',ok:11,hints:['10 + 1 = ?','Две половинки — одна клетка.'],board:P+BL('S1 = 11 см²')},
       {k:'num',q:'Фигура 2 (треугольник) — это половина прямоугольника 3 × 4. Площадь прямоугольника 3 · 4 = ? см²',ok:12,hints:['3 клетки в ряду, 4 ряда.','3 · 4 = ?'],board:P+BL('S1 = 11 см²')+BL('Прямоугольник 3 · 4 = 12 см²')},
       {k:'num',q:'Половина от 12 — площадь треугольника?',ok:6,hints:['Половина — делим на 2.','12 : 2 = ?'],board:P+BL('S1 = 11 см², S2 = 12 : 2 = 6 см²')},
       {k:'num',q:'На сколько см² площадь фигуры 1 больше?',ok:5,hints:['«На сколько больше» — вычитаем.','11 − 6 = ?'],board:P+BL('S1 = 11 см², S2 = 6 см²')+BL('Площадь фигуры 1 больше на 5 см².')}],record:'S1 = 11 см², S2 = 12 : 2 = 6 см². Площадь фигуры 1 больше на 5 см².'}})()]}
]};

/* ===== «Почему?» — короткий выбор причины после верного ответа ===== */
function W(p,n,it,st,ok,no,q){const s=PAGES.wb[p].ex.find(e=>e.n===n).items[it].steps[st];s.why={ok,no:no||[],q}}
/* стр. 30 */
W(30,1,0,0,'В них есть буква',['В них есть число 35'],'Почему подчёркиваем <b class="nw">35 : a</b> и <b class="nw">35 + b</b>?');
W(30,2,0,0,'7 одинаковое, а 8 < 9',['8 · 7 стоит слева']);
W(30,2,1,0,'Больше частей — кусочки меньше',['6 больше 4 — значит, больше']);
W(30,2,2,0,'a одинаковое, а 18 > 8',['18 · a стоит слева']);
W(30,2,3,0,'Больше частей — кусочки меньше',['8 больше 2 — значит, больше']);
W(30,5,0,0,'4 стороны по 9 см',['2 стороны по 9 см']);
W(30,5,0,2,'2 длины и 2 ширины',['1 длина и 1 ширина']);
W(30,5,0,5,'36 больше 22',[],'Почему у квадрата?');
W(30,5,0,6,'«На сколько» — вычитаем',['«На сколько» — делим']);
/* стр. 28 */
W(28,5,0,0,'Ширина меньше длины',['Длина меньше ширины'],'Почему длина?');
W(28,5,0,1,'«В 2 раза больше» — 2 таких куска',['«В 2 раза» — кусочек 2 см'],'Почему эта схема?');
W(28,5,0,2,'Длина больше — умножаем',['Слово «меньше» — делим']);
W(28,5,0,4,'2 длины и 2 ширины',['1 длина и 1 ширина']);
[[4,':','−'],[5,'·','+'],[6,'·','−'],[7,'·','−']].forEach(([i,m,o])=>{PAGES.wb[28].ex.find(e=>e.n===2).items[i].steps[0].why=rankWhy(m,o)});


/** всё нужное наружу — одним объектом с явными типами */
export const DM = { PAGES, BOOKS, exprHTML, tokens } as unknown as {
  PAGES: Record<string, Record<string, LegacyPage>>;
  BOOKS: Record<string, { name: string; short: string }>;
  exprHTML(s: string, marks?: Record<number, number>, opt?: { tap?: number; circles?: number }): string;
  tokens(s: string): { t: string; o?: string; v?: number; name?: string }[];
};
export interface LegacyStep {
  k: 'pick' | 'num' | 'nums' | 'multi' | 'order' | 'note';
  q: string;
  board?: string;
  show?: string;
  hints?: string[];
  why?: { q?: string; ok: string; no?: string[] };
  opts?: string[];
  ok?: any;
  alt?: number[];
  svg?: number;
  signs?: number;
  raw?: number;
  msgs?: { extra?: string; none?: string; miss?: string };
  any?: boolean;
  act?: { a: number; o: string; b: number };
  fields?: { u: string; ok: number }[];
  pre?: string;
  check?: (v: number[]) => boolean;
  testv?: number[];
  expr?: string;
  btn?: string;
}
export interface LegacyItem {
  start?: string;
  steps: LegacyStep[];
  record?: string;
  col?: (string | number)[];
}
export interface LegacyEx {
  n: number;
  title: string;
  text: string;
  rule: string;
  items: LegacyItem[];
}
export interface LegacyPage {
  lesson: string;
  rule: string;
  ex: LegacyEx[];
}
