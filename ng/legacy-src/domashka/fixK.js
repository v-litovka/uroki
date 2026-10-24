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
