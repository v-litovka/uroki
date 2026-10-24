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
