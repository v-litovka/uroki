/* Генераторы заданий English (перенос legacy-src/english/app.js + grammar.js). Возвращают «вопрос» Q,
 * который modes.ts превращает в шаги движка. Логика и тексты — как в старой игре. */
import { pick, shuffle } from '../../../../shared/utils/random';
import { BE, CAN, GR, HAVE, PRON_POSS, PRON_RU, PRON_SENT, PRON_SUBJ, UNITS, Word } from './data';

export type Lv = 0 | 1 | 2;

interface QBase {
  key: string;
  ask: string;
  show?: string;
  /** озвучить при показе (послушай и выбери) */
  listen?: string;
  /** что озвучить после верного ответа */
  say?: string;
  rule?: string;
  hint?: string;
}
export interface QChoice extends QBase {
  kind: 'choice';
  opts: string[];
  ans: string;
  /** плитки-картинки (крупные эмодзи) */
  pics?: boolean;
  small?: boolean;
}
export interface QType extends QBase {
  kind: 'type';
  ans: string;
  accept: string[];
}
export interface QTiles extends QBase {
  kind: 'tiles';
  word: string;
  extra: number;
}
export interface QSpell extends QBase {
  kind: 'spell';
  word: string;
}
export interface QWords extends QBase {
  kind: 'words';
  tokens: string[];
}
export interface QSteps extends QBase {
  kind: 'steps';
  steps: (Omit<QChoice, 'key' | 'kind'> & { kind?: 'choice' })[];
}
export type Q = QChoice | QType | QTiles | QSpell | QWords | QSteps;

export const esc = (s: string) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const gapHTML = (s: string) => esc(s).replace('___', '<span class="gap">?</span>');
const big = (w: Word) => `<div class="pic">${w[1]}</div>`;
const ruL = (w: Word) => `<p class="ru">${w[2]}</p>`;
const wordHint = (w: Word) => {
  const n = w[0].replace(/[^A-Za-z]/g, '').length;
  return `Подсказка: слово начинается на «${w[0][0]}», в нём ${n} ${n < 5 ? 'буквы' : 'букв'}.`;
};
const wordRule = (w: Word) => `<p><span class="pi">${w[1]}</span> <b>${w[0]}</b> — ${w[2]}</p>`;
const spellable = (w: Word) => /^[A-Za-z]{3,11}$/.test(w[0]);
const others = (list: Word[], w: Word, n: number) => shuffle(list.filter((x) => x[0] !== w[0] && x[1] !== w[1])).slice(0, n);

/* ---------- слова с перепутанными буквами ---------- */
const VOW = 'aeiou';
export function scrambles(w: string): string[] {
  const out = new Set<string>();
  const f = w[0];
  const l = w[w.length - 1];
  const core = w.slice(1, -1).split('');
  const add = (c: string[]) => {
    const v = f + c.join('') + l;
    if (v !== w) out.add(v);
  };
  for (let t = 0; t < 40 && out.size < 6; t++) {
    const c = core.slice();
    const k = t % 4;
    if (k === 0 && c.length >= 2) add(shuffle(c));
    else if (k === 1) {
      const idx = c.map((x, i) => (VOW.includes(x) ? i : -1)).filter((i) => i >= 0);
      if (idx.length) {
        const i = pick(idx);
        c[i] = pick(VOW.split('').filter((v) => v !== c[i]));
        add(c);
      }
    } else if (k === 2 && c.length >= 2) {
      const i = Math.floor(Math.random() * (c.length - 1));
      [c[i], c[i + 1]] = [c[i + 1], c[i]];
      add(c);
    } else if (k === 3) {
      const i = Math.floor(Math.random() * c.length);
      if (!VOW.includes(c[i])) {
        c.splice(i, 0, c[i]);
        add(c);
      } else {
        c[i] = pick(VOW.split(''));
        add(c);
      }
    }
  }
  return shuffle([...out]).slice(0, 3);
}

/* ---------- слова юнита ---------- */
export function genUnit(id: string, lv: Lv, canSpeak: boolean): Q {
  const ws = UNITS.find((u) => u.id === id)!.words;
  const sp = ws.filter(spellable);
  const gr = GR[id] ?? [];
  const kinds = lv === 0 ? ['p2w', 'p2w', 'l2p', 'gram', 'gram'] : lv === 1 ? ['scr', 'scr', 'tiles', 'gram', 'p2w'] : ['tilesX', 'spell', 'spell', 'gramT', 'scr'];
  let k = pick(kinds);
  if (['scr', 'tiles', 'tilesX', 'spell'].includes(k) && !sp.length) k = 'p2w';
  if (k === 'scr' && !sp.some((w) => w[0].length >= 4)) k = 'p2w';
  if ((k === 'gram' || k === 'gramT') && !gr.length) k = 'p2w';
  if (k === 'l2p' && !canSpeak) k = 'p2w';
  const w = pick(k === 'scr' ? sp.filter((x) => x[0].length >= 4) : ['tiles', 'tilesX', 'spell'].includes(k) ? sp : ws);
  const key = `${id}:${w[0]}`;
  switch (k) {
    case 'p2w':
      return { kind: 'choice', key, ask: 'Что это по-английски?', show: big(w) + ruL(w), opts: shuffle([w[0], ...others(ws, w, 2).map((x) => x[0])]), ans: w[0], say: w[0], rule: wordRule(w), hint: wordHint(w) };
    case 'l2p': {
      const o = shuffle([w, ...others(ws, w, 2)]);
      return { kind: 'choice', key, ask: 'Послушай и выбери картинку', listen: w[0], opts: o.map((x) => x[1]), ans: w[1], pics: true, say: w[0], rule: wordRule(w), hint: `Послушай ещё раз 🔊 — ${wordHint(w)}` };
    }
    case 'scr':
      return {
        kind: 'choice',
        key,
        ask: 'Какое слово написано правильно?',
        show: big(w) + ruL(w),
        opts: shuffle([w[0], ...scrambles(w[0])]),
        ans: w[0],
        say: w[0],
        hint: 'Первая и последняя буквы у всех одинаковые — смотри на середину слова. Послушай, как оно звучит.',
        rule: `<p>Первая и последняя буквы у всех одинаковые — смотри на <b>середину</b>. Правильно: <b>${w[0]}</b> — ${w[2]}.</p>`,
      };
    case 'tiles':
      return { kind: 'tiles', key, ask: 'Собери слово из букв', show: big(w) + ruL(w), word: w[0], extra: 0, say: w[0], rule: wordRule(w) };
    case 'tilesX':
      return { kind: 'tiles', key, ask: 'Собери слово. Осторожно: есть лишние буквы!', show: big(w) + ruL(w), word: w[0], extra: 3, say: w[0], rule: wordRule(w) };
    case 'spell':
      return { kind: 'spell', key, ask: 'Напиши слово сама', show: big(w) + ruL(w), word: w[0], say: w[0], rule: wordRule(w) };
    default: {
      const g = pick(gr);
      const typ = k === 'gramT' && /^[a-z]+$/.test(g[1]);
      const base = { key: `${id}:g:${g[0]}`, show: `<div class="pic sm">${g[4]}</div><p class="sent">${gapHTML(g[0])}</p>`, say: g[0].replace('___', g[1]), rule: `<p>${g[3]}</p>` };
      return typ
        ? { kind: 'type', ...base, ask: 'Впиши пропущенное слово', ans: g[1], accept: [g[1]] }
        : { kind: 'choice', ...base, ask: 'Выбери слово для пропуска', opts: shuffle([g[1], ...g[2]]), ans: g[1], hint: g[3].replace(/<[^>]+>/g, '') };
    }
  }
}

/* ---------- местоимения ---------- */
const PR_ICON: Record<string, string> = { He: '👨', She: '👩', It: '📦', They: '👨‍👩‍👧', We: '🙋‍♀️🙋', I: '🙋‍♀️', You: '🫵' };
/** «👨 He» — подпись варианта с картинкой */
export const prOpt = (o: string) => `${PR_ICON[o[0].toUpperCase() + o.slice(1)] ?? ''} ${o}`.trim();
export const PRON_RULE = `<table class="pt"><tr><th></th><th>кто?</th><th>чей?</th></tr>
<tr><td>👨 он</td><td><b>he</b></td><td><b>his</b></td></tr><tr><td>👩 она</td><td><b>she</b></td><td><b>her</b></td></tr>
<tr><td>📦🐶 оно</td><td><b>it</b></td><td><b>its</b></td></tr><tr><td>👨‍👩‍👧 они</td><td><b>they</b></td><td><b>their</b></td></tr>
<tr><td>🙋‍♀️ я</td><td><b>I</b></td><td><b>my</b></td></tr><tr><td>🙋‍♀️🙋 мы</td><td><b>we</b></td><td><b>our</b></td></tr></table>
<p>Мальчик, папа, дедушка → <b>he</b>. Девочка, бабушка, Вира → <b>she</b>. Вещь → <b>it</b>. Двое и больше → <b>they</b>.</p>
<p>🐈 <b>Животное:</b> кошка с улицы, чужая собака → <b>it</b>. А наша Вира — член семьи, мы знаем, что она девочка → <b>she</b>. Венди тоже <b>she</b>.</p>`;

export function genPron(lv: Lv): Q {
  const k = pick(lv === 0 ? ['who', 'who', 'ru'] : lv === 1 ? ['sent', 'sent', 'poss', 'who'] : ['two', 'two', 'sentAll', 'typeP']);
  if (k === 'who') {
    const p = pick(PRON_SUBJ);
    const opts = ['He', 'She', 'It', 'They'].concat(p[2] === 'We' ? ['We'] : []);
    return { kind: 'choice', key: 'pron:' + p[0], ask: 'Замени одним словом: кто это?', show: `<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])}</p><p class="ru">${p[3]}</p>`, opts: opts.map(prOpt), ans: prOpt(p[2]), say: p[0] + '. ' + p[2], rule: PRON_RULE };
  }
  if (k === 'ru') {
    const p = pick(PRON_RU);
    const opts = ['He', 'She', 'It', 'They'].concat(p[2] === 'We' ? ['We'] : []);
    return { kind: 'choice', key: 'pronru:' + p[0], ask: 'Как сказать по-английски одним словом?', show: `<div class="pic">${p[1]}</div><p class="sent">«${p[0]}»</p>`, opts: opts.map(prOpt), ans: prOpt(p[2]), say: p[2], rule: PRON_RULE };
  }
  if (k === 'sent' || k === 'sentAll' || k === 'typeP') {
    const p = pick(PRON_SENT);
    const all =
      k === 'sentAll'
        ? shuffle([p[2], ...shuffle(['He', 'She', 'It', 'They', 'His', 'Her', 'Their', 'Its', 'My', 'Our'].filter((x) => x.toLowerCase() !== p[2].toLowerCase())).slice(0, 4)]).map((x) => (/^[A-Z]/.test(p[2]) ? x : x.toLowerCase()))
        : shuffle([p[2], ...p[3]]);
    const base = { key: 'ps:' + p[1], show: `<div class="pic sm">${p[4]}</div><p class="sent">${esc(p[0])}<br>${gapHTML(p[1])}</p>`, say: p[0] + ' ' + p[1].replace('___', p[2]), rule: PRON_RULE };
    return k === 'typeP' ? { kind: 'type', ...base, ask: 'Впиши нужное слово', ans: p[2], accept: [p[2]] } : { kind: 'choice', ...base, ask: 'Какое слово вместо пропуска?', opts: all, ans: p[2] };
  }
  const p = pick(PRON_POSS);
  const obj = p[0].split(' ').pop()!;
  if (k === 'poss')
    return { kind: 'choice', key: 'pp:' + p[0], ask: 'Замени: чей?', show: `<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])} → <span class="gap">?</span> ${esc(obj)}</p>`, opts: shuffle(['his', 'her', 'their', 'its']), ans: p[2], say: p[2] + ' ' + obj, rule: PRON_RULE };
  /* два шага: кто → чей */
  const who = p[3];
  return {
    kind: 'steps',
    key: 'pp2:' + p[0],
    ask: '',
    rule: PRON_RULE,
    say: p[2] + ' ' + obj,
    steps: [
      { ask: 'Шаг 1. Кто владелец? Замени одним словом', show: `<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])}</p>`, opts: ['he', 'she', 'it', 'they'].map(prOpt), ans: prOpt(who) },
      { ask: `Шаг 2. ${who} → чей? Выбери слово`, show: `<div class="pic">${p[1]}</div><p class="sent">${esc(p[0])} → <span class="gap">?</span> ${esc(obj)}</p>`, opts: shuffle(['my', 'your', 'his', 'her', 'its', 'our', 'their']), ans: p[2], small: true },
    ],
  };
}

/* ---------- to be / have got / can ---------- */
const BE_NEG: Record<string, string> = { am: "'m not", is: "isn't", are: "aren't" };
const HV_NEG: Record<string, string> = { have: "haven't", has: "hasn't" };
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const qSubj = (s: string) => (s === 'I' ? 'you' : /^(You|We|They|He|She|It)$/.test(s) ? s.toLowerCase() : /^(My|The|A)\b/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);
const ansPr = (p: string) => (p === 'you' ? 'I' : p === 'I' ? 'you' : p);
const qBe = (r: string[]) => {
  const s = r[0] === 'I' ? 'you' : qSubj(r[0]);
  const v = r[0] === 'I' ? 'are' : r[2];
  return [cap(v), s, r[3]];
};
export const R_BE = `<table class="pt"><tr><th>+</th><th>−</th><th>?</th></tr><tr><td>I <b>am</b></td><td>I<b>'m not</b></td><td><b>Am</b> I …?</td></tr><tr><td>he/she/it <b>is</b></td><td>… <b>isn't</b></td><td><b>Is</b> he …?</td></tr><tr><td>we/you/they <b>are</b></td><td>… <b>aren't</b></td><td><b>Are</b> they …?</td></tr></table><p>В вопросе <b>am / is / are</b> встаёт <b>на первое место</b>. Ответ: Yes, she <b>is</b>. / No, she <b>isn't</b>.</p>`;
export const R_HV = `<table class="pt"><tr><th>+</th><th>−</th><th>?</th></tr><tr><td>I/we/you/they <b>have got</b></td><td><b>haven't got</b></td><td><b>Have</b> they <b>got</b> …?</td></tr><tr><td>he/she/it <b>has got</b></td><td><b>hasn't got</b></td><td><b>Has</b> she <b>got</b> …?</td></tr></table><p>Вира — she → <b>has</b>. Кошки — they → <b>have</b>. Ответ: Yes, she <b>has</b>. / No, she <b>hasn't</b>.</p>`;
export const R_CAN = `<p><b>can</b> — может, умеет. <b>can't</b> — не может. Для всех одинаково: I can, she can, they can — <b>без -s!</b></p><p>Вопрос: <b>Can</b> Wendy jump? Ответ: Yes, she <b>can</b>. / No, she <b>can't</b>.</p>`;
const yesNo = (ok: boolean | number) => (ok ? '<span class="yn">✅</span>' : '<span class="yn">❌</span>');
const pic = (p: string) => `<div class="pic sm">${p}</div>`;
const sent = (t: string, extra = '') => `<p class="sent">${t}</p>${extra}`;
const choiceQ = (key: string, ask: string, show: string, ans: string, wrong: string[], say: string, rule: string, hint?: string): QChoice => ({ kind: 'choice', key, ask, show, opts: shuffle([ans, ...wrong]), ans, say, rule, hint: hint?.replace(/<[^>]+>/g, '') });
const wordsQ = (key: string, ask: string, show: string, tokens: string[], say: string, rule: string): QWords => ({ kind: 'words', key, ask, show, tokens, say, rule });
const typeQ = (key: string, ask: string, show: string, ans: string, accept: string[], say: string, rule: string): QType => ({ kind: 'type', key, ask, show, ans, accept, say, rule });
const joinT = (t: string[]) => t.join(' ').replace(' ?', '?').replace(' .', '.');

export function genBe(lv: Lv): Q {
  const r = pick(BE);
  const neg = BE_NEG[r[2]];
  const q = qBe(r);
  const pr = r[0] === 'I' ? 'you' : r[4];
  const apr = ansPr(pr);
  const k = pick(lv === 0 ? ['aff', 'aff', 'negR', 'qR'] : lv === 1 ? ['neg', 'quest', 'short', 'negR', 'shortN'] : ['words', 'words', 'typeNeg', 'typeShort', 'quest']);
  const key = 'be:' + k + ':' + r[0] + r[3];
  const vOf = (p: string) => (p === 'I' ? 'am' : ['he', 'she', 'it'].includes(p) ? 'is' : 'are');
  if (k === 'aff')
    return choiceQ(key, 'Вставь am, is или are', pic(r[1]) + sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[3])}.`, `<p class="ru">${r[5]}</p>`), r[2], ['am', 'is', 'are'].filter((x) => x !== r[2]), `${r[0]} ${r[2]} ${r[3]}.`, R_BE,
      `Кто это? ${r[0]} → ${r[4]}. ${r[4] === 'I' ? 'I → am' : ['he', 'she', 'it'].includes(r[4]) ? 'he/she/it → is' : 'we/you/they → are'}`);
  if (k === 'negR')
    return choiceQ(key, 'Это НЕ так! Выбери отрицание', pic(r[1]) + yesNo(0) + sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[3])}.`), neg, Object.values(BE_NEG).filter((x) => x !== neg), `${r[0]} ${r[2] === 'am' ? 'am not' : neg} ${r[3]}.`, R_BE, "Отрицание: am → 'm not, is → isn't, are → aren't");
  if (k === 'neg') {
    const ok = `${r[0]} ${r[2] === 'am' ? "'m not" : neg} ${r[3]}.`.replace("I 'm not", "I'm not");
    return choiceQ(key, 'Как сказать НЕ? Выбери правильное предложение', pic(r[1]) + sent(`${esc(r[0])} ${r[2]} ${esc(r[3])}.`) + yesNo(0), ok, [`${r[0]} not ${r[2]} ${r[3]}.`, `${r[0]} don't ${r[3]}.`], ok, R_BE, 'Слово «not» ставим сразу после am / is / are');
  }
  if (k === 'quest' || k === 'qR') {
    const ok = `${q[0]} ${q[1]} ${q[2]}?`;
    return choiceQ(key, 'Задай вопрос: какой правильный?', pic(r[1]) + sent(`${esc(r[0])} ${r[2]} ${esc(r[3])}.`), ok, [`${cap(q[1])} ${q[0].toLowerCase()} ${q[2]}?`, `Do ${q[1]} ${q[2]}?`], ok, R_BE, 'В вопросе Is / Are / Am — на первом месте');
  }
  if (k === 'short' || k === 'shortN') {
    const yes = k === 'short';
    const v = vOf(apr);
    const vn = apr === 'I' ? "'m not" : BE_NEG[v];
    const ans = yes ? v : vn;
    return choiceQ(key, 'Закончи короткий ответ', pic(r[1]) + sent(`${esc(q[0])} ${esc(q[1])} ${esc(q[2])}?<br>${yes ? 'Yes' : 'No'}, ${apr} <span class="gap">?</span>.`), ans, (yes ? ['am', 'is', 'are'] : ["'m not", "isn't", "aren't"]).filter((x) => x !== ans),
      `${yes ? 'Yes' : 'No'}, ${apr}${ans[0] === "'" ? '' : ' '}${ans}.`, R_BE, `${apr} → ${v}`);
  }
  if (k === 'words') {
    const neg2 = Math.random() < 0.4;
    const toks = neg2 ? [r[0], r[2] === 'am' ? 'am' : r[2], 'not', ...r[3].split(' '), '.'] : [q[0], q[1], ...q[2].split(' '), '?'];
    return wordsQ(key, neg2 ? 'Собери предложение-отрицание' : 'Собери вопрос', pic(r[1]) + sent(`${esc(r[0])} ${r[2]} ${esc(r[3])}.`) + (neg2 ? yesNo(0) : '<p class="ru">❓</p>'), toks, joinT(toks), R_BE);
  }
  if (k === 'typeNeg') {
    const acc = r[2] === 'am' ? ["'m not", 'am not'] : [neg, r[2] + ' not'];
    return typeQ(key, 'Напиши отрицание сама', pic(r[1]) + yesNo(0) + sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[3])}.`), acc[0], acc, `${r[0]} ${acc[1]} ${r[3]}.`, R_BE);
  }
  const v = vOf(apr);
  const vn = apr === 'I' ? "'m not" : BE_NEG[v];
  return typeQ(key, 'Напиши короткий ответ: No', pic(r[1]) + sent(`${esc(q[0])} ${esc(q[1])} ${esc(q[2])}?<br>No, ${apr} <span class="gap">?</span>.`), vn, [vn, apr === 'I' ? 'am not' : v + ' not'], `No, ${apr}${vn[0] === "'" ? '' : ' '}${vn}.`, R_BE);
}

export function genHave(lv: Lv): Q {
  const r = pick(HAVE);
  const neg = HV_NEG[r[2]];
  const qs = qSubj(r[0]);
  const qv = r[0] === 'I' ? 'have' : r[2];
  const apr = ansPr(r[0] === 'I' ? 'you' : r[4]);
  const av = ['he', 'she', 'it'].includes(apr) ? 'has' : 'have';
  const k = pick(lv === 0 ? ['aff', 'aff', 'negR', 'qR'] : lv === 1 ? ['neg', 'quest', 'short', 'shortN', 'negR'] : ['words', 'words', 'typeNeg', 'typeShort', 'quest']);
  const key = 'hv:' + k + ':' + r[0] + r[3];
  const qok = `${cap(qv)} ${qs} got ${r[3]}?`;
  const other = r[2] === 'has' ? 'have' : 'has';
  if (k === 'aff') return choiceQ(key, 'Вставь have или has', pic(r[1]) + sent(`${esc(r[0])} <span class="gap">?</span> got ${esc(r[3])}.`), r[2], [other, 'is'], `${r[0]} ${r[2]} got ${r[3]}.`, R_HV, `${r[0]} → ${r[4]}. he/she/it → has, остальные → have`);
  if (k === 'negR') return choiceQ(key, 'Этого НЕТ! Выбери отрицание', pic(r[1]) + yesNo(0) + sent(`${esc(r[0])} <span class="gap">?</span> got ${esc(r[3])}.`), neg, [r[2] === 'has' ? "haven't" : "hasn't", "isn't"], `${r[0]} ${neg} got ${r[3]}.`, R_HV, "has → hasn't, have → haven't");
  if (k === 'neg') {
    const ok = `${r[0]} ${neg} got ${r[3]}.`;
    return choiceQ(key, 'Как сказать: нет у …? Выбери предложение', pic(r[1]) + sent(`${esc(r[0])} ${r[2]} got ${esc(r[3])}.`) + yesNo(0), ok, [`${r[0]} ${r[2]} not ${r[3]}.`, `${r[0]} ${r[2] === 'has' ? "haven't" : "hasn't"} got ${r[3]}.`], ok, R_HV, "not ставим после has / have: hasn't got");
  }
  if (k === 'quest' || k === 'qR')
    return choiceQ(key, 'Задай вопрос: какой правильный?', pic(r[1]) + sent(`${esc(r[0])} ${r[2]} got ${esc(r[3])}.`), qok, [`${cap(qs)} ${qv} got ${r[3]}?`, `${qv === 'has' ? 'Have' : 'Has'} ${qs} got ${r[3]}?`], qok, R_HV, 'Вопрос: Has / Have — первым, got остаётся после подлежащего');
  if (k === 'short' || k === 'shortN') {
    const yes = k === 'short';
    const ans = yes ? av : HV_NEG[av];
    return choiceQ(key, 'Закончи короткий ответ', pic(r[1]) + sent(`${esc(qok)}<br>${yes ? 'Yes' : 'No'}, ${apr} <span class="gap">?</span>.`), ans, yes ? [av === 'has' ? 'have' : 'has', 'is'] : [av === 'has' ? "haven't" : "hasn't", "isn't"], `${yes ? 'Yes' : 'No'}, ${apr} ${ans}.`, R_HV, `${apr} → ${av}`);
  }
  if (k === 'words') {
    const neg2 = Math.random() < 0.4;
    const toks = neg2 ? [r[0], neg, 'got', ...r[3].split(' '), '.'] : [cap(qv), qs, 'got', ...r[3].split(' '), '?'];
    return wordsQ(key, neg2 ? 'Собери предложение: НЕТ у …' : 'Собери вопрос', pic(r[1]) + sent(`${esc(r[0])} ${r[2]} got ${esc(r[3])}.`) + (neg2 ? yesNo(0) : '<p class="ru">❓</p>'), toks, joinT(toks), R_HV);
  }
  if (k === 'typeNeg') return typeQ(key, 'Напиши отрицание сама', pic(r[1]) + yesNo(0) + sent(`${esc(r[0])} <span class="gap">?</span> got ${esc(r[3])}.`), neg, [neg, r[2] + ' not'], `${r[0]} ${neg} got ${r[3]}.`, R_HV);
  return typeQ(key, 'Напиши короткий ответ: No', pic(r[1]) + sent(`${esc(qok)}<br>No, ${apr} <span class="gap">?</span>.`), HV_NEG[av], [HV_NEG[av], av + ' not'], `No, ${apr} ${HV_NEG[av]}.`, R_HV);
}

export function genCan(lv: Lv): Q {
  const k = pick(lv === 0 ? ['aff', 'aff', 'aff', 'qR'] : lv === 1 ? ['neg', 'quest', 'short', 'short'] : ['words', 'words', 'typeShort', 'typeAff', 'quest']);
  const r = pick(k === 'neg' ? CAN.filter((x) => !x[3]) : k === 'quest' || k === 'qR' || k === 'words' ? CAN.filter((x) => x[3]) : CAN);
  const v = r[3] ? 'can' : "can't";
  const qs = qSubj(r[0]);
  const apr = ansPr(r[0] === 'I' ? 'you' : r[4]);
  const key = 'can:' + k + ':' + r[0] + r[2];
  const qok = `Can ${qs} ${r[2]}?`;
  const cant = ["can't", 'cannot', 'can not'];
  if (k === 'aff') return choiceQ(key, "Может или не может? can или can't", pic(r[1]) + yesNo(r[3]) + sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[2])}.`), v, [r[3] ? "can't" : 'can', r[3] ? 'cans' : 'not can'], `${r[0]} ${v} ${r[2]}.`, R_CAN, r[3] ? 'Галочка ✅ — может → can' : "Крестик ❌ — не может → can't");
  if (k === 'neg') {
    const ok = `${r[0]} can't ${r[2]}.`;
    return choiceQ(key, 'Скажи, что НЕ может', pic(r[1]) + yesNo(0) + sent(`${esc(r[0])} … ${esc(r[2])}?`), ok, [`${r[0]} can ${r[2]} not.`, `${r[0]} don't can ${r[2]}.`], ok, R_CAN, "can't ставим перед действием: can't swim");
  }
  if (k === 'quest' || k === 'qR') return choiceQ(key, 'Задай вопрос: какой правильный?', pic(r[1]) + sent(`${esc(r[0])} can ${esc(r[2])}.`), qok, [`${cap(qs)} can ${r[2]}?`, `Does ${qs} can ${r[2]}?`], qok, R_CAN, 'Вопрос: Can — на первом месте');
  if (k === 'short')
    return choiceQ(key, 'Закончи короткий ответ', pic(r[1]) + yesNo(r[3]) + sent(`${esc(qok)}<br>${r[3] ? 'Yes' : 'No'}, ${apr} <span class="gap">?</span>.`), v, [r[3] ? "can't" : 'can', r[3] ? 'is' : "isn't"], `${r[3] ? 'Yes' : 'No'}, ${apr} ${v}.`, R_CAN, r[3] ? 'Yes → can' : "No → can't");
  if (k === 'words') {
    const toks = ['Can', qs, ...r[2].split(' '), '?'];
    return wordsQ(key, 'Собери вопрос', pic(r[1]) + sent(`${esc(r[0])} can ${esc(r[2])}.`) + '<p class="ru">❓</p>', toks, joinT(toks), R_CAN);
  }
  if (k === 'typeAff') return typeQ(key, "Напиши can или can't", pic(r[1]) + yesNo(r[3]) + sent(`${esc(r[0])} <span class="gap">?</span> ${esc(r[2])}.`), v, r[3] ? ['can'] : cant, `${r[0]} ${v} ${r[2]}.`, R_CAN);
  return typeQ(key, 'Напиши короткий ответ', pic(r[1]) + yesNo(r[3]) + sent(`${esc(qok)}<br>${r[3] ? 'Yes' : 'No'}, ${apr} <span class="gap">?</span>.`), v, r[3] ? ['can'] : cant, `${r[3] ? 'Yes' : 'No'}, ${apr} ${v}.`, R_CAN);
}

export function genQ(topic: string, lv: Lv, canSpeak: boolean): Q {
  return topic === 'pron' ? genPron(lv) : topic === 'be' ? genBe(lv) : topic === 'have' ? genHave(lv) : topic === 'can' ? genCan(lv) : genUnit(topic, lv, canSpeak);
}
