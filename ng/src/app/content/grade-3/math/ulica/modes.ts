/* Улица Домиков: домик → шаги. Спрятано число на чердаке (умножай) или в окошке (дели).
 * Ошибка → хитрость (правило + 2 примера, 15 с) → «реши сама» по шагам. Верно → стишок домика (5 с) → двойник. */
import { Exercise, Lesson, Mode, Step } from '../../../../core/models';
import { shuffle } from '../../../../shared/utils/random';
import { RHYME, RHYME_NOTE, TWINS } from './data';
import { BY_ID, Card, Hack, divLesson, hackFor } from './hacks';

type Hide = 'top' | 'x' | 'y';

/* ---------- HTML-кусочки (классы — shared/ui/rich-html) ---------- */
export function house(c: Card, hide: Hide | null, small = false): string {
  const v = (k: Hide, val: number) => (hide === k ? '<span class="slot live">?</span>' : String(val));
  return `<div class="house${small ? ' small' : ''}" style="--roof:${c.block.color}">
    <div class="roof"><svg viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden="true"><polygon points="150,6 294,118 6,118"/></svg>
    <div class="attic">${v('top', c.n)}</div></div>
    <div class="walls"><div class="win">${v('x', c.x)}</div><span class="op">×</span><div class="win">${v('y', c.y)}</div></div></div>`;
}
const facts = (c: Card) => {
  const f = [`${c.x} × ${c.y} = ${c.n}`, `${c.n} : ${c.x} = ${c.y}`];
  if (c.x !== c.y) f.push(`${c.n} : ${c.y} = ${c.x}`);
  return `<p class="facts">${f.join(' &nbsp;·&nbsp; ')}</p>`;
};
const rhymeBox = (rhyme: string, note?: string) => `<div class="rhyme"><span class="tag">📖 Прочитай вслух</span><p>${rhyme}</p>${note ? `<div class="rnote">${note}</div>` : ''}</div>`;
/** «{}» → число в клеточке */
const lab = (t: string, val: number | string, cls = '') => t.replace(/\{\}/g, `<span class="slot ${cls}">${val}</span>`);
const bigeq = (s: string) => `<div class="bigeq">${s}</div>`;

/* ---------- урок-хитрость и «реши сама» ---------- */
function lessonOf(h: Hack, v: number, task: string): Lesson {
  const steps = h.steps(v);
  const ex = shuffle(h.samples.filter((x) => x !== v)).slice(0, 2);
  const exHtml = ex.length
    ? `<p class="sub">Смотри, как это работает</p><div class="exs">${ex
        .map((x) => `<div class="ex">${h.steps(x).map((s) => `<div>${lab(s[0], s[1])}</div>`).join('')}<div class="exres">${h.res(x)}</div></div>`)
        .join('')}</div>`
    : '';
  const solve = (i: number) =>
    `<ol class="steps">${steps
      .map((s, j) => (j < i ? `<li class="done">${lab(s[0], s[1])}</li>` : j === i ? `<li class="cur">${lab(s[0], '?', 'live')}</li>` : '<li class="todo">• • •</li>'))
      .join('')}</ol>`;
  return {
    title: h.title,
    task: bigeq(task),
    html: (h.rhyme ? rhymeBox(h.rhyme, h.note) : '') + `<p>${h.rule}</p>` + exHtml,
    lockSec: 15,
    steps: steps.map(
      (s, i): Step => ({
        kind: 'input',
        numeric: true,
        answer: String(s[1]),
        placeholder: '?',
        prompt: { ask: 'Реши сама', html: `<p class="taskline">Задача: <b>${task}</b></p>${solve(i)}`, hint: undefined },
        okMsg: i === steps.length - 1 ? `Получилось! ${h.res(v)}` : undefined,
      }),
    ),
  };
}

/* ---------- двойник: то же число в другом домике ---------- */
function twinSteps(c: Card): Step[] {
  const pair = TWINS[c.n];
  if (!pair) return [];
  const t = BY_ID[pair.find((k) => k !== c.id)!];
  const d = Math.random() < 0.5 ? t.x : t.y;
  const ans = c.n / d;
  const L = divLesson(t, d);
  return [
    {
      kind: 'input',
      numeric: true,
      answer: String(ans),
      placeholder: '?',
      lesson: lessonOf(L.h, L.v, `${c.n} : ${d} = ?`),
      prompt: {
        ask: `🔴 Двойник: число ${c.n} живёт в двух домиках`,
        html: `<p class="why">Один домик ты уже знаешь: ${c.x} × ${c.y}. Вот задача из второго. Не перепутай!</p>${bigeq(`${c.n} : ${d} = <span class="slot live">?</span>`)}`,
        hint: undefined,
      },
    },
    {
      kind: 'note',
      html: `<p class="verdict">Верно!</p><div class="pair">${house(c, null, true)}${house(t, null, true)}</div><p class="facts">${c.n} = ${c.x} × ${c.y} &nbsp;и&nbsp; ${c.n} = ${t.x} × ${t.y}</p>`,
      button: 'Следующий домик',
      prompt: { ask: undefined, html: undefined, hint: undefined },
    },
  ];
}

/** один домик: спрятать ответ (45 %) или множитель */
export function exercise(c: Card, hide: Hide = pickHide()): Exercise {
  let ans: number, d: number | undefined, eq: string;
  if (hide === 'top') {
    ans = c.n;
    eq = `${c.x} × ${c.y}`;
  } else if (hide === 'x') {
    ans = c.x;
    d = c.y;
    eq = `${c.n} : ${c.y}`;
  } else {
    ans = c.y;
    d = c.x;
    eq = `${c.n} : ${c.x}`;
  }
  const L = hackFor(c, hide, d);
  const rhyme = RHYME[c.id];
  const twin = !!TWINS[c.n];
  return {
    itemId: c.id,
    label: c.label,
    prompt: {},
    lesson: lessonOf(L.h, L.v, `${eq} = ?`),
    steps: [
      {
        kind: 'input',
        numeric: true,
        answer: String(ans),
        placeholder: '?',
        prompt: { ask: hide === 'top' ? 'Чердак пустой — умножай!' : 'Кто спрятался в окошке? Дели!', html: house(c, hide) + bigeq(`${eq} = <span class="slot live">?</span>`) },
      },
      {
        kind: 'note',
        html:
          `<p class="verdict">Верно!</p>${house(c, null, true)}${facts(c)}` +
          (rhyme ? rhymeBox(rhyme, RHYME_NOTE[c.id]) : '') +
          (twin ? `<p class="twinnote">🔴 У числа ${c.n} есть двойник — сейчас проверим!</p>` : ''),
        button: twin ? 'Задача-двойник' : 'Следующий домик',
        lockSec: rhyme ? 5 : 0,
        prompt: { ask: undefined, html: undefined, hint: undefined },
      },
      ...twinSteps(c),
    ],
  };
}

const pickHide = (): Hide => {
  const r = Math.random();
  return r < 0.45 ? 'top' : r < 0.725 ? 'x' : 'y';
};

export const visitMode: Mode<Card> = {
  id: 'play',
  title: 'В гости',
  icon: '🏠',
  desc: 'Спрятано число на чердаке или в окошке. Ошибёшься — покажу хитрость.',
  clock: true,
  build: (c) => exercise(c),
};
