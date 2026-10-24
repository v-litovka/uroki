/* ===== Вира и Венди (рисунки) ===== */
/* Венди — худая серо-коричневая полосатая; Вира — толстая пушистая белая с чёрными пятнами, как корова */
function wendy(mood,size){
  size=size||120;const m=mood||'happy';
  const mouth=m==='sad'?'M52 57q8 -6 16 0':m==='wow'?'M56 56a4 5 0 1 0 8 0a4 5 0 1 0 -8 0':'M52 55q4 5 8 0q4 5 8 0';
  const eyes=m==='sly'?'<path d="M42 44h10M68 44h10" stroke="#2b2420" stroke-width="3" stroke-linecap="round"/>':'<ellipse cx="47" cy="44" rx="4.5" ry="6" fill="#2b2420"/><ellipse cx="73" cy="44" rx="4.5" ry="6" fill="#2b2420"/><circle cx="48.5" cy="42" r="1.6" fill="#fff"/><circle cx="74.5" cy="42" r="1.6" fill="#fff"/>';
  return `<svg class="cat" viewBox="0 0 120 150" width="${size}" height="${size*1.25}" role="img" aria-label="кошка Венди">
  <path d="M84 132c22 0 30-20 20-34" fill="none" stroke="#8a7560" stroke-width="7" stroke-linecap="round"/>
  <ellipse cx="60" cy="108" rx="22" ry="32" fill="#9b856e"/>
  <path d="M44 92h32M42 104h36M44 116h32" stroke="#6e5a46" stroke-width="4" stroke-linecap="round"/>
  <ellipse cx="60" cy="112" rx="11" ry="20" fill="#c9b49c"/>
  <ellipse cx="50" cy="138" rx="8" ry="5" fill="#9b856e"/><ellipse cx="70" cy="138" rx="8" ry="5" fill="#9b856e"/>
  <path d="M34 34l4-26 18 16z" fill="#9b856e"/><path d="M86 34l-4-26-18 16z" fill="#9b856e"/>
  <path d="M39 30l2-14 9 9z" fill="#e7a7a0"/><path d="M81 30l-2-14-9 9z" fill="#e7a7a0"/>
  <ellipse cx="60" cy="46" rx="29" ry="25" fill="#9b856e"/>
  <path d="M52 24l8 8 8-8M48 30h-6M72 30h6" stroke="#6e5a46" stroke-width="3" stroke-linecap="round" fill="none"/>
  ${eyes}<path d="M57 51l3 3 3-3z" fill="#d97a7a"/>
  <path d="${mouth}" fill="none" stroke="#2b2420" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M34 50h12M34 55l12-2M86 50h-12M86 55l-12-2" stroke="#4a3d31" stroke-width="1.4" stroke-linecap="round"/></svg>`;
}
function vira(mood,size){
  size=size||120;const m=mood||'happy';
  const mouth=m==='sad'?'M54 62q8 -6 16 0':m==='eat'?'M55 59q7 9 14 0z':m==='wow'?'M57 60a5 6 0 1 0 10 0a5 6 0 1 0 -10 0':'M54 60q4 5 8 0q4 5 8 0';
  const eyes=m==='sleep'?'<path d="M44 48q5 4 10 0M70 48q5 4 10 0" stroke="#222" stroke-width="3" fill="none" stroke-linecap="round"/>':'<ellipse cx="49" cy="48" rx="5" ry="6.5" fill="#222"/><ellipse cx="75" cy="48" rx="5" ry="6.5" fill="#222"/><circle cx="51" cy="46" r="1.8" fill="#fff"/><circle cx="77" cy="46" r="1.8" fill="#fff"/>';
  return `<svg class="cat" viewBox="0 0 124 150" width="${size}" height="${size*1.21}" role="img" aria-label="кошка Вира">
  <path d="M96 128c20 4 26-14 16-24" fill="none" stroke="#222" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="62" cy="106" rx="42" ry="38" fill="#fff" stroke="#e3e3e3" stroke-width="2"/>
  <path d="M30 92c8-10 22-8 22 2s-16 14-22 6z" fill="#222"/><path d="M78 118c10-8 22-2 18 8s-18 6-18-8z" fill="#222"/><ellipse cx="58" cy="128" rx="8" ry="5" fill="#222"/>
  <ellipse cx="44" cy="140" rx="11" ry="6" fill="#fff" stroke="#e3e3e3" stroke-width="2"/><ellipse cx="80" cy="140" rx="11" ry="6" fill="#fff" stroke="#e3e3e3" stroke-width="2"/>
  <path d="M30 36l2-26 20 14z" fill="#222"/><path d="M94 36l-2-26-20 14z" fill="#fff" stroke="#e3e3e3" stroke-width="2"/>
  <path d="M90 32l-1-14-10 8z" fill="#f2b6c0"/>
  <ellipse cx="62" cy="50" rx="35" ry="29" fill="#fff" stroke="#e3e3e3" stroke-width="2"/>
  <path d="M30 40c4-14 20-16 24-6s-6 18-16 16-10-4-8-10z" fill="#222"/>
  ${eyes}<ellipse cx="62" cy="56" rx="4" ry="3" fill="#f29aaa"/>
  <path d="${mouth}" fill="${m==='eat'?'#d9506a':'none'}" stroke="#222" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M34 56h14M34 61l14-2M90 56h-14M90 61l-14-2" stroke="#999" stroke-width="1.4" stroke-linecap="round"/></svg>`;
}
const CAT_OK=['Вира от радости покаталась по полу! 🐾','Венди гордо подняла хвост: «Purr-fect!»','Вира мурчит: «Yes! Yummy!» 😋','Венди сказала «Meow-velous!»','Вира требует за это рыбку 🐟','Венди одобрительно моргнула 😺','Вира так обрадовалась, что съела ещё полмиски!','Венди сделала сальто! 🤸'];
const CAT_BAD=['Ой! Вира легла на ответ… Попробуй ещё 🙀','Венди смотрит с подозрением 🤨','Вира отвлеклась на миску. Ещё раз!','Венди шепчет: «Think again!»','Вира перевернулась на спину и думает… 🐄'];
const pickOne=a=>a[Math.floor(Math.random()*a.length)];
/* юбка — нет хорошего эмодзи */
const SVGPIC={skirt:`<svg viewBox="0 0 60 60" width="1em" height="1em"><path d="M18 12h24l12 40H6z" fill="#E8452C"/><path d="M18 12h24v6H18z" fill="#26224F"/><path d="M14 30h32M10 42h40" stroke="#fff" stroke-width="2" opacity=".6"/></svg>`};
const picHTML=w=>SVGPIC[w[0]]||w[1];

/* котик на картинке всегда тот же, о ком фраза */
const catFor=(txt,moodV,moodW,sz)=>/Вир/.test(txt)?vira(moodV,sz||60):wendy(moodW,(sz||60)-6);
