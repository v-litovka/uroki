/* Общий набор для игр-«городов» (улицы-темы: Город Слов, Горад Слоў, …):
 * HTML-кусочки сцен, второстепенные члены, «Верно + правило», урок после ошибки. Только данные/строки — без Angular. */
import { Exercise, Mode, Step } from '../../core/models';
import { shuffle } from '../../shared/utils/random';

/* ---------- HTML-кусочки (классы — shared/ui/rich-html) ---------- */
export const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const fillGap = (w: string, l: string, cls = 'ok') => w.replace('_', `<span class="${cls}">${l}</span>`);
export const plain = (w: string, l: string) => w.replace('_', l);
export const word = (inner: string) => `<div class="word">${inner}</div>`;
export const sent = (inner: string) => `<div class="sent">${inner}</div>`;
export const why = (inner: string) => `<p class="why">${inner}</p>`;
export const words = (s: string) => s.split(' ');
export const bare = (w: string) => w.replace(/[.,!?…]/g, '');
export const noAccent = (s: string) => s.replace(/́/g, '');
/** слово по частям, часть hl выделена */
export const partShow = (parts: string[], hl = -1) => word(parts.map((p, i) => `<span class="seg${i === hl ? ' hl' : ''}">${p}</span>`).join(''));

/* ---------- второстепенные члены ---------- */
export interface SecItem {
  s: string;
  subj: string;
  pred: string;
  /** [от слова, вопрос, слово, предлог] */
  sec: string[][];
}
export const secWords = (x: string[]) => (x[3] ? [x[3], x[2]] : [x[2]]);

/** предложение с подчёркнутыми главными и первыми `upto` второстепенными; hl — подсветить */
export function secSent(it: SecItem, upto: number, hl?: string[]) {
  const marks: Record<string, string> = { [it.pred]: 'u2', [it.subj]: 'u1' };
  it.sec.slice(0, upto).forEach((x) => secWords(x).forEach((w) => (marks[w] = 'u3')));
  return sent(
    words(it.s)
      .map((w) => {
        const b = bare(w);
        let h = marks[b] ? `<span class="${marks[b]}">${w}</span>` : w;
        if (hl?.includes(b)) h = `<span class="hlw">${h}</span>`;
        return h;
      })
      .join(' '),
  );
}

/** два неверных вопроса из других групп (QCAT: группа → вопросы, QREP: группа → представитель) */
export const qWrongFrom = (QCAT: Record<string, string[]>, QREP: Record<string, string>) => (q: string) => {
  const c = Object.keys(QCAT).find((k) => QCAT[k].includes(q));
  return shuffle(Object.keys(QREP).filter((k) => k !== c).map((k) => QREP[k])).slice(0, 2);
};

/* ---------- шаги ---------- */
export interface Spec {
  ask: string;
  show?: string;
  note?: string;
}
export const scene = (sp: Spec) => ({ ask: sp.ask, html: sp.show || undefined, hint: sp.note || undefined });

/** выбор: letters — узкие плитки, long — фразы столбиком; accept — ещё верные */
export const choice = (sp: Spec, opts: string[], ans: string, o: { letters?: boolean; long?: boolean; accept?: string[] } = {}): Step => ({
  kind: 'choice',
  options: opts,
  answer: ans,
  accept: o.accept,
  shuffle: false,
  layout: o.letters ? 'small' : o.long || opts.some((x) => x.length > 11) ? 'list' : 'grid',
  prompt: scene(sp),
});

type Mark = 'u1' | 'u2' | 'u3' | 'hl';
export interface MainLabels {
  pred: string;
  subj: string;
  /** «Задай вопрос: {f} ({q}) … — нажми на это слово» */
  tapSec: (f: string, q: string) => string;
  /** «Какой вопрос задаём от слова «{f}» к слову «{w}»?» */
  askSec: (f: string, w: string) => string;
}

/** сказуемое → подлежащее (нажми на слово) */
export function mainMembers(it: { s: string; pred: string; subj: string }, L: MainLabels): Step[] {
  return [
    { kind: 'tap', words: words(it.s), accept: [it.pred], markAs: 'u2', prompt: scene({ ask: L.pred }) },
    { kind: 'tap', words: words(it.s), accept: [it.subj], markAs: 'u1', marked: { [it.pred]: 'u2' }, prompt: scene({ ask: L.subj }) },
  ];
}

/** главные + второстепенные: нажми на слово или выбери вопрос (как в старых городах) */
export function secondaryMembers(it: SecItem, L: MainLabels, qWrong: (q: string) => string[]): Step[] {
  const out = mainMembers(it, L);
  const marked: Record<string, Mark> = { [it.pred]: 'u2', [it.subj]: 'u1' };
  it.sec.forEach((x, k) => {
    const ww = secWords(x);
    if (k % 2 === 0 || Math.random() < 0.3)
      out.push({ kind: 'tap', words: words(it.s), accept: [x[2]], markWords: ww, markAs: 'u3', marked: { ...marked }, prompt: scene({ ask: L.tapSec(x[0].toLowerCase(), x[1]) }) });
    else out.push(choice({ ask: L.askSec(x[0].toLowerCase(), ww.join(' ').toLowerCase()), show: secSent(it, k, [x[0], ...ww]) }, shuffle([x[1], ...qWrong(x[1])]), x[1]));
    ww.forEach((w) => (marked[w] = 'u3'));
  });
  return out;
}

/* ---------- упражнение целиком ---------- */
export interface StreetTexts {
  /** «Верно! +1 ⭐» */
  correct: string;
  next: string;
  /** «Смотри, как это работает» */
  examples: string;
  /** «Запомни это слово» */
  remember: string;
}

export interface Rule {
  title: string;
  text: string;
}

/** урок после ошибки: правило + примеры (решённые задания) или «запомни это слово» */
export function lessonOf(rule: Rule, T: StreetTexts, examples: string[], memo?: string) {
  const ex = memo
    ? `<p class="sub">${T.remember}</p><div class="memo">${memo}</div>`
    : examples.length
      ? `<p class="sub">${T.examples}</p><div class="exs">${examples.map((e) => `<div class="ex">${e}</div>`).join('')}</div>`
      : '';
  return { title: rule.title, html: `<p>${rule.text}</p>${ex}` };
}

/** шаги задания + «Верно + правило» (3 с) + урок на случай ошибки */
export function streetExercise(
  it: { id: string; label?: string },
  steps: Step[],
  solvedHtml: string,
  rule: Rule,
  lesson: { title: string; html: string },
  T: StreetTexts,
): Exercise {
  return {
    itemId: it.id,
    label: it.label,
    prompt: {},
    steps: [
      ...steps,
      {
        kind: 'note',
        html: `<p class="verdict">${T.correct}</p>${solvedHtml}<div class="rulebox"><b>${rule.title}</b><p>${rule.text}</p></div>`,
        button: T.next,
        lockSec: 3,
        prompt: { ask: undefined, html: undefined, hint: undefined },
      },
    ],
    lesson,
  };
}

export const streetMode = <T>(id: string, title: string, icon: string, desc: string, build: (it: T) => Exercise): Mode<T> => ({ id, title, icon, desc, build });
