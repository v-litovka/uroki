import re
src=open('math/engine-base.html',encoding='utf8').read().split('\n')
head='\n'.join(src[0:232])   # до "/* ====== ЗАДАНИЯ"
engine='\n'.join(src[522:])   # с "/* =================== ДВИЖОК"
shared=open('math/shared.js',encoding='utf8').read()
content=open('math/content.js',encoding='utf8').read()
def R(s,a,b,cnt=1):
    assert s.count(a)>=1,('MISSING',a[:80])
    return s.replace(a,b) if cnt==0 else s.replace(a,b,cnt)
head=R(head,'<title>Город Слов</title>','<title>Город Задач</title>')
head=R(head,'<div class="name">Город Слов</div>','<div class="name">Город Задач</div>')
head=R(head,"const KEY='gorod-slov-v1';","const KEY='gorod-zadach-v1';")
head=R(head,"const PAIR={'о':'а','а':'о','е':'и','и':'е','я':'е','ю':'у'};\n",'')
head=R(head,'--sky:#E3DAFF; --sky2:#F5F1FF;','--sky:#D9ECFF; --sky2:#F1F8FF;')
css='''
/* задачи и схемы */
.task{margin:0;padding:12px 16px;border:3px solid var(--ink);border-radius:18px;background:#FFF8DC;font-size:20px;font-weight:800;line-height:1.4}
.task.sm{font-size:17px;padding:10px 12px}
.opts.cards{grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr))}
.opt.sch{padding:30px 10px 10px;display:grid;place-items:center;background:#fff}
.opt.sch .scheme{width:100%;max-height:170px}
.opt.sch.right{background:#D8F3E2}.opt.sch.bad{background:#FFE1D8}
.mini{display:grid;place-items:center;padding:6px;border:2px dashed var(--ghost);border-radius:14px;background:#fff}
.mini .scheme{max-height:150px;width:auto;max-width:100%}
.eq{margin:0;text-align:center;font-weight:900;font-size:28px;line-height:1.5;font-variant-numeric:tabular-nums}
.eq b{color:var(--good)}
.eq .blank{width:2em;height:1.1em}
b.big{font-size:1.3em;color:var(--accent)}
.ex .task.sm{background:#FFFDF8}
.ex .eq{font-size:22px}
.cheatbox h1{font-family:var(--display);font-weight:400;font-size:clamp(32px,8vw,48px);line-height:1;margin:6px 0 12px}
'''
head=R(head,'/* итоги и добавочное время */',css+'/* итоги и добавочное время */')
e=engine
e=R(e,"streets:['dict','vow']","streets:['na','v','kosv']")
e=R(e,"function lev(a,b){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>[i]);for(let j=1;j<=n;j++)d[0][j]=j;\n  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}\n",'')
e=R(e,"function boxId(it){if((it.type==='syn'||it.type==='ant')&&S.lexHard)return 'L'+it.id;return (it.type==='vow'||(it.type==='err'&&it.vw))&&S.vowHard?'H'+it.id:it.id}","function boxId(it){return it.id}")
# draw: input/num, cards, opts long
old_draw_start=e.index('      ${sp.input?')
old_draw_end=e.index("      ${sp.note?`<p class=\"note\">${sp.note}</p>`:''}")
e=e[:old_draw_start]+'''      ${sp.num?`<form class="inrow" id="inform" autocomplete="off"><input id="inp" class="inp" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="ответ" aria-label="Ответ числом"><button class="btn" type="submit"><span class="lbl">Проверить</span></button></form><p class="soft" id="soft" aria-live="polite"></p>`
        :sp.cards?`<div class="opts cards" id="opts">${sp.cards.map((c,j)=>`<button class="opt sch" data-v="${c.v}" aria-label="Схема ${j+1}"><span class="k">${j+1}</span>${c.html}</button>`).join('')}</div>`
        :`<div class="opts${sp.letters?' letters':''}${sp.long||sp.opts.some(o=>o.length>11)?' long':''}" id="opts" lang="ru">${sp.opts.map((o,j)=>`<button class="opt" data-v="${esc(o)}"><span class="k">${j+1}</span>${esc(o)}</button>`).join('')}</div>`}
'''+e[old_draw_end:]
a=e.index('    if(sp.input){');b=e.index('    }else if(sp.tap){')
e=e[:a]+'''    if(sp.num){
      KEYS=null;const inp=$('#inp');setTimeout(()=>{try{inp.focus()}catch(err){}},50);
      $('#inform').addEventListener('submit',ev2=>{
        ev2.preventDefault();const v=inp.value.replace(/\\D/g,'');
        if(!v){inp.focus();return;}
        if(v===sp.ans){vals[i]=v;inp.disabled=true;inp.classList.add('right');ok();}
        else if(!sp.tried){sp.tried=1;play('stepWrong');shake(inp);$('#soft').textContent='Не так. Пересчитай ещё раз внимательно.';inp.select();}
        else{inp.classList.add('bad');bad(v);}
      });
'''+e[b:]
a=e.index('  /* свободный ввод (синонимы/антонимы)');b=e.index('  draw();\n}')
e=e[:a]+e[b:]
# newRound / retry with instances
e=R(e,"""  const it=pickItem(),st=streetOf(it);
  runSpecs(mainSpecs(it),`<p class="kicker" style="color:${st.c}">${st.name}</p>`,(ok,v)=>answered(it,ok,v));""",
"""  const it=pickItem(),st=streetOf(it);it.inst=makeInst(it);
  runSpecs(mainSpecs(it),`<p class="kicker" style="color:${st.c}">${st.name}</p><p class="task">${it.inst.text}</p>`,(ok,v)=>answered(it,ok,v));""")
e=R(e,"""  runSpecs(mainSpecs(it),'<p class="kicker">Реши сама</p>',(ok)=>{""","""  runSpecs(mainSpecs(it),`<p class="kicker">Реши сама</p><p class="task">${it.inst.text}</p>`,(ok)=>{""")
a=e.index("  let unlock='';");b=e.index("  stage.innerHTML=`<div class=\"card\">\n    <p class=\"verdict ok\">Верно!")
e=e[:a]+"  const unlock='';\n"+e[b:]
e=R(e,"""    ${FREE_NOTE?`<p class="why" style="color:#B05A00">${FREE_NOTE}</p>`:''}\n""","")
e=R(e,"<p class=\"taskline\">Задание:</p>${taskView(it)}","<p class=\"taskline\">Задача:</p>${taskView(it)}")
e=R(e,"const learned=[...s.learned].map(id=>ITEMS.find(x=>x.id===id.replace(/^H/,''))).filter(Boolean);","const learned=[...s.learned].map(id=>ITEMS.find(x=>x.id===id)).filter(Boolean);")
e=R(e,"noteAnswer(ok,it){if(!SES)return;if(ok)SES.correct++;else{SES.wrong++;SES.miss[it.label]=(SES.miss[it.label]||0)+1;}tick();}",
      "noteAnswer(ok,it){if(!SES)return;if(ok)SES.correct++;else{SES.wrong++;const lb=RULES[it.type].title;SES.miss[lb]=(SES.miss[lb]||0)+1;}tick();}")
e=R(e,"${learned.map(x=>`<li><span>${esc(x.label)}</span></li>`).join('')}","${learned.map(x=>`<li><span>${esc(RULES[x.type].title)}: ${esc(x.t(GEN[x.type]?(x.g||GEN[x.type])():{}).slice(0,60))}…</span></li>`).join('')}")
# menu
a=e.index('  stage.innerHTML=`<section class="hero"><h1>Город Слов</h1>');b=e.index('    <div class="streets">')
e=e[:a]+'''  stage.innerHTML=`<section class="hero"><h1>Город Задач</h1>
    <p>Улицы — это типы задач из учебника. Главное здесь — <b>выбрать правильную схему</b>, потом действие, потом посчитать. Ошибёшься — откроется правило.</p></section>
'''+e[b:]
e=R(e,"""        <span class="sname">${st.name}${(st.id==='vow'||st.id==='err')&&S.vowHard?' <span class="lvl">сложный</span>':''}</span><span class="sdesc">${st.id==='vow'&&S.vowHard?'Проверочное слово пишешь сама, потом буква.':st.id==='err'&&S.vowHard?'Верно ли написано? Потом сама пишешь проверочное слово.':st.id==='err'?'Верно ли написано слово? Потом выбери проверочное.':st.desc}</span>""",
"""        <span class="sname">${st.name}</span><span class="sdesc">${st.desc}</span>""")
a=e.index('      <div class="set"><span class="setl">Проверочные слова</span>');b=e.index('    </div>\n    <div class="menu-actions"><button class="btn big" id="play">')
e=e[:a]+e[b:]
e=R(e,'<div class="menu-actions"><button class="btn big" id="play"><span class="lbl">Начать занятие</span></button>',
      '<div class="menu-actions"><button class="btn big" id="play"><span class="lbl">Начать занятие</span></button><button class="btn" id="cheat"><span class="lbl">Шпаргалка по схемам</span></button>')
a=e.index("  $('#lvE').addEventListener");b=e.index("  $('#play').addEventListener('click',startSession);")
e=e[:a]+"  $('#cheat').addEventListener('click',showCheat);\n"+e[b:]
e=R(e,"S.box={};S.stars=0;S.history=[];S.vowHard=false;S.vowHardUnlocked=false;save();","S.box={};S.stars=0;S.history=[];save();")
e=R(e,"/* ---------- старт ---------- */","""function showCheat(){
  clearTimers();NEXT=null;KEYS=null;
  stage.innerHTML=`<section class="cheatbox"><h1>Шпаргалка по схемам</h1>${cheatHTML()}<div class="menu-actions" style="margin-top:16px"><button class="btn" id="back"><span class="lbl">Назад</span></button></div></section>`;
  $('#back').addEventListener('click',renderMenu);window.scrollTo(0,0);
}
/* ---------- старт ---------- */""")
e=R(e,"window.__TEST__={NORM,ITEMS,mainSpecs,solved,taskView,lessonHTML,STREETS,VOW_OK,normW,S,errRule,ruleFor};",
      "window.__TEST__={ITEMS,mainSpecs,solved,taskView,lessonHTML,STREETS,S,ruleFor,makeInst,schemesFor,solFor,GEN,RULES};")
e=R(e,"\nupdateStars();renderMenu();\n","\n{const st=document.createElement('style');st.textContent=SCHEME_CSS+CHEAT_CSS;document.head.appendChild(st);}\nupdateStars();renderMenu();\n")
out=head+'\n'+shared+'\n'+content+'\n'+e
for bad in ['vowHard','lexHard','FREE_NOTE=T','NORM(','PAIR[']:
    if bad in out: print('LEFT',bad,[m.start() for m in re.finditer(re.escape(bad),out)][:3])
open('math/zadachi.html','w',encoding='utf8').write(out)
print(len(out))
import sys as _s;_s.path.insert(0,'.')
from patch_levels import patch as _lv
o=open('math/zadachi.html',encoding='utf8').read();open('math/zadachi.html','w',encoding='utf8').write(_lv(o,'ru'));print('levels ok')
