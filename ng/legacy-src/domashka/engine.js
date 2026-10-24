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
