/* ===== Грамматика: to be / have got / can — утверждение, отрицание, вопрос ===== */
/* подлежащее: [как в предложении, картинка, местоимение для краткого ответа, в вопросе (I → you)] */
const BE=[ /* [подлежащее, картинка, глагол, остаток, местоимение, по-русски] */
 ['I','🙋‍♀️','am','nine','I','мне девять'],['I','🙋‍♀️','am','hungry','I','я голодная'],['Vira','🐄🐱','is','fat','she','Вира толстая'],['Wendy','🐈','is','thin','she','Венди худая'],
 ['Vira','🐄🐱','is','on the floor','she','Вира на полу'],['My dad','👨','is','tall','he','папа высокий'],['My sister','👧','is','at school','she','сестра в школе'],
 ['Mike','👦','is','funny','he','Майк смешной'],['The ball','⚽','is','red','it','мяч красный'],['We','🙋‍♀️🙋','are','friends','we','мы друзья'],
 ['My parents','👫','are','at home','they','родители дома'],['Vira and Wendy','🐱🐱','are','hungry','they','кошки голодные'],['The cats','🐱🐱','are','in the kitchen','they','кошки на кухне'],
 ['You','🫵','are','happy','you','ты счастлива'],['Liz','👧','is','tired','she','Лиз устала'],['My granny','👵','is','kind','she','бабушка добрая']];
const HAVE=[ /* [подлежащее, картинка, have/has, что, местоимение] */
 ['I','🙋‍♀️','have','a cat','I'],['Vira','🐄🐱','has','a big bowl','she'],['Wendy','🐈','has','a long tail','she'],['My parents','👫','have','a car','they'],
 ['Mike','👦','has','a bike','he'],['We','🙋‍♀️🙋','have','a garden','we'],['Liz','👧','has','a doll','she'],['The cats','🐱🐱','have','a soft sofa','they'],
 ['My granny','👵','has','glasses','she'],['My dad','👨','has','a computer','he'],['You','🫵','have','a nice dress','you'],['Vira','🐄🐱','has','black spots','she']];
const CAN=[ /* [подлежащее, картинка, что, может?, местоимение] */
 ['Wendy','🐈','jump high',1,'she'],['Vira','🐄🐱','jump high',0,'she'],['Vira','🐄🐱','eat a lot',1,'she'],['A fish','🐟','swim',1,'it'],['A fish','🐟','fly',0,'it'],
 ['A bird','🐦','fly',1,'it'],['A parrot','🦜','talk',1,'it'],['A tortoise','🐢','run fast',0,'it'],['A dog','🐶','sing',0,'it'],['My granny','👵','roller-skate',0,'she'],
 ['Mike','👦','ride a bike',1,'he'],['I','🙋‍♀️','read',1,'I'],['My dad','👨','cook',1,'he'],['Vira and Wendy','🐱🐱','swim',0,'they'],['A frog','🐸','jump',1,'it']];
const BE_NEG={am:"'m not",is:"isn't",are:"aren't"};
const HV_NEG={have:"haven't",has:"hasn't"};
const cap=s=>s[0].toUpperCase()+s.slice(1);
const qSubj=s=>s==='I'?'you':/^(You|We|They|He|She|It)$/.test(s)?s.toLowerCase():(/^(My|The|A)\b/.test(s)?s[0].toLowerCase()+s.slice(1):s);
const ansPr=p=>p==='you'?'I':p==='I'?'you':p;
const qBe=r=>{const s=r[0]==='I'?'you':qSubj(r[0]);const v=r[0]==='I'?'are':r[2];return [cap(v),s,r[3]]};
const R_BE=`<table class="pt"><tr><th>+</th><th>−</th><th>?</th></tr><tr><td>I <b>am</b></td><td>I<b>'m not</b></td><td><b>Am</b> I …?</td></tr><tr><td>he/she/it <b>is</b></td><td>… <b>isn't</b></td><td><b>Is</b> he …?</td></tr><tr><td>we/you/they <b>are</b></td><td>… <b>aren't</b></td><td><b>Are</b> they …?</td></tr></table><p>В вопросе <b>am / is / are</b> встаёт <b>на первое место</b>. Ответ: Yes, she <b>is</b>. / No, she <b>isn't</b>.</p>`;
const R_HV=`<table class="pt"><tr><th>+</th><th>−</th><th>?</th></tr><tr><td>I/we/you/they <b>have got</b></td><td><b>haven't got</b></td><td><b>Have</b> they <b>got</b> …?</td></tr><tr><td>he/she/it <b>has got</b></td><td><b>hasn't got</b></td><td><b>Has</b> she <b>got</b> …?</td></tr></table><p>Вира — she → <b>has</b>. Кошки — they → <b>have</b>. Ответ: Yes, she <b>has</b>. / No, she <b>hasn't</b>.</p>`;
const R_CAN=`<p><b>can</b> — может, умеет. <b>can't</b> — не может. Для всех одинаково: I can, she can, they can — <b>без -s!</b></p><p>Вопрос: <b>Can</b> Wendy jump? Ответ: Yes, she <b>can</b>. / No, she <b>can't</b>.</p>`;
const yesNo=ok=>ok?'<span class="yn y">✅</span>':'<span class="yn n">❌</span>';

function choiceQ(key,ask,show,ans,wrong,say,rule,hint){return {kind:'choice',key,ask,show,opts:shuffle([ans,...wrong]),ans,say,rule,hint}}
function wordsQ(key,ask,show,tokens,say,rule){return {kind:'words',key,ask,show,tokens,say,rule}}
function typeQ(key,ask,show,ans,accept,say,rule){return {kind:'type',key,ask,show,ans,accept,say,rule}}
const pic=p=>`<div class="pic sm">${p}</div>`;
const sent=(t,extra)=>`<p class="sent">${t}</p>${extra||''}`;

function genBe(lv){
  const r=pickOne(BE),neg=BE_NEG[r[2]],q=qBe(r),pr=r[0]==='I'?'you':r[4],apr=ansPr(pr);
  const k=pickOne(lv===0?['aff','aff','negR','qR']:lv===1?['neg','quest','short','negR','shortN']:['words','words','typeNeg','typeShort','quest']);
  const key='be:'+k+':'+r[0]+r[3];
  if(k==='aff')return choiceQ(key,'Вставь am, is или are',pic(r[1])+sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[3])}.`,`<p class="ru">${r[5]}</p>`),r[2],['am','is','are'].filter(x=>x!==r[2]),`${r[0]} ${r[2]} ${r[3]}.`,R_BE,`Кто это? ${r[0]} → ${r[4]}. ${r[4]==='I'?'I → am':['he','she','it'].includes(r[4])?'he/she/it → is':'we/you/they → are'}`);
  if(k==='negR')return choiceQ(key,'Это НЕ так! Выбери отрицание',pic(r[1])+yesNo(0)+sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[3])}.`),neg,Object.values(BE_NEG).filter(x=>x!==neg),`${r[0]} ${r[2]==='am'?'am not':neg} ${r[3]}.`,R_BE,'Отрицание: am → \'m not, is → isn\'t, are → aren\'t');
  if(k==='neg'){const ok=`${r[0]} ${r[2]==='am'?"'m not":neg} ${r[3]}.`.replace("I 'm not","I'm not");
    return choiceQ(key,'Как сказать НЕ? Выбери правильное предложение',pic(r[1])+sent(`${esc(r[0])} ${r[2]} ${esc(r[3])}.`)+yesNo(0),ok,[`${r[0]} not ${r[2]} ${r[3]}.`,`${r[0]} don't ${r[3]}.`],ok,R_BE,'Слово «not» ставим сразу <b>после am / is / are</b>')}
  if(k==='quest'||k==='qR'){const ok=`${q[0]} ${q[1]} ${q[2]}?`;
    return choiceQ(key,'Задай вопрос: какой правильный?',pic(r[1])+sent(`${esc(r[0])} ${r[2]} ${esc(r[3])}.`),ok,[`${cap(q[1])} ${q[0].toLowerCase()} ${q[2]}?`,`Do ${q[1]} ${q[2]}?`],ok,R_BE,'В вопросе <b>Is / Are / Am</b> — на первом месте')}
  if(k==='short'||k==='shortN'){const yes=k==='short',v=apr==='I'?'am':['he','she','it'].includes(apr)?'is':'are',vn=apr==='I'?"'m not":BE_NEG[v];
    const ans=yes?v:vn;return choiceQ(key,'Закончи короткий ответ',pic(r[1])+sent(`${esc(q[0])} ${esc(q[1])} ${esc(q[2])}?<br>${yes?'Yes':'No'}, ${apr} <span class="gap">?</span>.`),ans,(yes?['am','is','are']:["'m not","isn't","aren't"]).filter(x=>x!==ans),`${yes?'Yes':'No'}, ${apr}${ans[0]==="'"?'':' '}${ans}.`,R_BE,`${apr} → ${v}`)}
  if(k==='words'){const neg2=Math.random()<.4;const toks=neg2?[r[0],r[2]==='am'?'am':r[2],'not',...r[3].split(' '),'.']:[q[0],q[1],...q[2].split(' '),'?'];
    return wordsQ(key,neg2?'Собери предложение-отрицание':'Собери вопрос',pic(r[1])+sent(`${esc(r[0])} ${r[2]} ${esc(r[3])}.`)+(neg2?yesNo(0):'<p class="ru">❓</p>'),toks,toks.join(' ').replace(' ?','?').replace(' .','.'),R_BE)}
  if(k==='typeNeg'){const acc=r[2]==='am'?["'m not",'am not']:[neg,r[2]+' not'];return typeQ(key,'Напиши отрицание сама',pic(r[1])+yesNo(0)+sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[3])}.`),acc[0],acc,`${r[0]} ${acc[1]} ${r[3]}.`,R_BE)}
  {const v=apr==='I'?'am':['he','she','it'].includes(apr)?'is':'are',vn=apr==='I'?"'m not":BE_NEG[v];
   return typeQ(key,'Напиши короткий ответ: No',pic(r[1])+sent(`${esc(q[0])} ${esc(q[1])} ${esc(q[2])}?<br>No, ${apr} <span class="gap">?</span>.`),vn,[vn,apr==='I'?'am not':v+' not'],`No, ${apr}${vn[0]==="'"?'':' '}${vn}.`,R_BE)}
}
function genHave(lv){
  const r=pickOne(HAVE),neg=HV_NEG[r[2]],qs=qSubj(r[0]),qv=r[0]==='I'?'have':r[2],apr=ansPr(r[0]==='I'?'you':r[4]);
  const av=['he','she','it'].includes(apr)?'has':'have';
  const k=pickOne(lv===0?['aff','aff','negR','qR']:lv===1?['neg','quest','short','shortN','negR']:['words','words','typeNeg','typeShort','quest']);
  const key='hv:'+k+':'+r[0]+r[3];
  const qok=`${cap(qv)} ${qs} got ${r[3]}?`;
  if(k==='aff')return choiceQ(key,'Вставь have или has',pic(r[1])+sent(`${esc(r[0])} <span class="gap">?</span> got ${esc(r[3])}.`),r[2],[r[2]==='has'?'have':'has','is'],`${r[0]} ${r[2]} got ${r[3]}.`,R_HV,`${r[0]} → ${r[4]}. he/she/it → has, остальные → have`);
  if(k==='negR')return choiceQ(key,'Этого НЕТ! Выбери отрицание',pic(r[1])+yesNo(0)+sent(`${esc(r[0])} <span class="gap">?</span> got ${esc(r[3])}.`),neg,[r[2]==='has'?"haven't":"hasn't","isn't"],`${r[0]} ${neg} got ${r[3]}.`,R_HV,'has → hasn\'t, have → haven\'t');
  if(k==='neg'){const ok=`${r[0]} ${neg} got ${r[3]}.`;return choiceQ(key,'Как сказать: нет у …? Выбери предложение',pic(r[1])+sent(`${esc(r[0])} ${r[2]} got ${esc(r[3])}.`)+yesNo(0),ok,[`${r[0]} ${r[2]} not ${r[3]}.`,`${r[0]} ${r[2]==='has'?"haven't":"hasn't"} got ${r[3]}.`],ok,R_HV,'not ставим после has / have: hasn\'t got')}
  if(k==='quest'||k==='qR')return choiceQ(key,'Задай вопрос: какой правильный?',pic(r[1])+sent(`${esc(r[0])} ${r[2]} got ${esc(r[3])}.`),qok,[`${cap(qs)} ${qv} got ${r[3]}?`,`${qv===('has')?'Have':'Has'} ${qs} got ${r[3]}?`],qok,R_HV,'Вопрос: <b>Has / Have</b> — первым, <b>got</b> остаётся после подлежащего');
  if(k==='short'||k==='shortN'){const yes=k==='short',ans=yes?av:HV_NEG[av];return choiceQ(key,'Закончи короткий ответ',pic(r[1])+sent(`${esc(qok)}<br>${yes?'Yes':'No'}, ${apr} <span class="gap">?</span>.`),ans,yes?[av==='has'?'have':'has','is']:[av==='has'?"haven't":"hasn't","isn't"],`${yes?'Yes':'No'}, ${apr} ${ans}.`,R_HV,`${apr} → ${av}`)}
  if(k==='words'){const neg2=Math.random()<.4;const toks=neg2?[r[0],neg,'got',...r[3].split(' '),'.']:[cap(qv),qs,'got',...r[3].split(' '),'?'];
    return wordsQ(key,neg2?'Собери предложение: НЕТ у …':'Собери вопрос',pic(r[1])+sent(`${esc(r[0])} ${r[2]} got ${esc(r[3])}.`)+(neg2?yesNo(0):'<p class="ru">❓</p>'),toks,toks.join(' ').replace(' ?','?').replace(' .','.'),R_HV)}
  if(k==='typeNeg')return typeQ(key,'Напиши отрицание сама',pic(r[1])+yesNo(0)+sent(`${esc(r[0])} <span class="gap">?</span> got ${esc(r[3])}.`),neg,[neg,r[2]+' not'],`${r[0]} ${neg} got ${r[3]}.`,R_HV);
  return typeQ(key,'Напиши короткий ответ: No',pic(r[1])+sent(`${esc(qok)}<br>No, ${apr} <span class="gap">?</span>.`),HV_NEG[av],[HV_NEG[av],av+' not'],`No, ${apr} ${HV_NEG[av]}.`,R_HV);
}
function genCan(lv){
  const k=pickOne(lv===0?['aff','aff','aff','qR']:lv===1?['neg','quest','short','short']:['words','words','typeShort','typeAff','quest']);
  const r=pickOne(k==='neg'?CAN.filter(x=>!x[3]):(k==='quest'||k==='qR'||k==='words')?CAN.filter(x=>x[3]):CAN),v=r[3]?'can':"can't",qs=qSubj(r[0]),apr=ansPr(r[0]==='I'?'you':r[4]);
  const key='can:'+k+':'+r[0]+r[2];
  const qok=`Can ${qs} ${r[2]}?`;
  if(k==='aff')return choiceQ(key,'Может или не может? can или can\'t',pic(r[1])+yesNo(r[3])+sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[2])}.`),v,[r[3]?"can't":'can',r[3]?'cans':'not can'],`${r[0]} ${v} ${r[2]}.`,R_CAN,r[3]?'Галочка ✅ — может → can':'Крестик ❌ — не может → can\'t');
  if(k==='neg'){const ok=`${r[0]} can't ${r[2]}.`;return choiceQ(key,'Скажи, что НЕ может',pic(r[1])+yesNo(0)+sent(`${esc(r[0])} … ${esc(r[2])}?`),ok,[`${r[0]} can ${r[2]} not.`,`${r[0]} don't can ${r[2]}.`],ok,R_CAN,'can\'t ставим перед действием: can\'t swim')}
  if(k==='quest'||k==='qR')return choiceQ(key,'Задай вопрос: какой правильный?',pic(r[1])+sent(`${esc(r[0])} can ${esc(r[2])}.`),qok,[`${cap(qs)} can ${r[2]}?`,`Does ${qs} can ${r[2]}?`],qok,R_CAN,'Вопрос: <b>Can</b> — на первом месте');
  if(k==='short'){const ans=v;return choiceQ(key,'Закончи короткий ответ',pic(r[1])+yesNo(r[3])+sent(`${esc(qok)}<br>${r[3]?'Yes':'No'}, ${apr} <span class="gap">?</span>.`),ans,[r[3]?"can't":'can',r[3]?'is':"isn't"],`${r[3]?'Yes':'No'}, ${apr} ${ans}.`,R_CAN,r[3]?'Yes → can':'No → can\'t')}
  if(k==='words'){const toks=['Can',qs,...r[2].split(' '),'?'];return wordsQ(key,'Собери вопрос',pic(r[1])+sent(`${esc(r[0])} can ${esc(r[2])}.`)+'<p class="ru">❓</p>',toks,toks.join(' ').replace(' ?','?'),R_CAN)}
  if(k==='typeAff')return typeQ(key,'Напиши can или can\'t',pic(r[1])+yesNo(r[3])+sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[2])}.`),v,r[3]?['can']:["can't",'cannot','can not'],`${r[0]} ${v} ${r[2]}.`,R_CAN);
  return typeQ(key,'Напиши короткий ответ',pic(r[1])+yesNo(r[3])+sent(`${esc(qok)}<br>${r[3]?'Yes':'No'}, ${apr} <span class="gap">?</span>.`),v,r[3]?['can']:["can't",'cannot','can not'],`${r[3]?'Yes':'No'}, ${apr} ${v}.`,R_CAN);
}
