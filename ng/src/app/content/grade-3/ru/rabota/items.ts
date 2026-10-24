/* Превращение сырых данных в элементы тем (без UI). */
import { shuffle } from '../../../../shared/utils/random';
import { ADJ_RAW, CASES, DICT_WORDS, GQ, NOUNS, QPAIR, SOFT_RAW, TSA_RAW, Why } from './data';

/** Элемент «предложение с глаголом/словом, где надо выбрать вопрос и окончание». */
export interface SentItem {
  id: string;
  /** предложение с {} на месте слова */
  s: string;
  /** основа (видна ребёнку) */
  b: string;
  /** окончание */
  e: string;
  /** слово целиком */
  w: string;
  /** верный вопрос */
  q: string;
  /** варианты вопроса */
  qs: string[];
  /** варианты окончания */
  es: string[];
  /** задание к первому шагу */
  qh: string;
  /** подсказка после ошибки в вопросе */
  h1: string;
  /** подсказка после ошибки в окончании */
  h2: string;
  why: Why;
}

export interface SoftItem {
  id: string;
  w: string;
  bad: string[];
}

export interface DictItem {
  id: string;
  w: string;
  sp: [string, string, string, Why][];
}

const whyTsa = (q: string, e: string): Why =>
  e === 'ться'
    ? { ok: `В вопросе «${q}» есть ь — и в слове есть ь`, wrong: ['ь пишется, если слово длинное'] }
    : { ok: `В вопросе «${q}» нет ь — и в слове нет ь`, wrong: ['ь не пишется, если слово короткое'] };

export const TSA: SentItem[] = TSA_RAW.map(([s, b, e, q], i) => ({
  id: 't' + i,
  s,
  b,
  e,
  w: b + e,
  q,
  qs: [q, QPAIR[q]],
  es: ['тся', 'ться'],
  qh: 'Задай вопрос к выделенному слову',
  h1: 'Подставь вопрос в предложение — какой звучит правильно?',
  h2: `Есть ли ь в вопросе «${q}»? Если есть — пиши ь и в слове.`,
  why: whyTsa(q, e),
}));

export const ADJ: SentItem[] = ADJ_RAW.map(([s, b, e, n, g], i) => {
  const [q, pr] = GQ[g];
  const soft = /^(ий|яя|ее|ие)$/.test(e);
  const others = shuffle(Object.values(GQ).map((x) => x[0]).filter((x) => x !== q)).slice(0, 2);
  return {
    id: 'a' + i,
    s,
    b,
    e,
    w: b + e,
    q,
    qs: [...others, q],
    es: soft ? ['ий', 'яя', 'ее', 'ие'] : ['ый', 'ая', 'ое', 'ые'],
    qh: `Задай вопрос от слова «${n}» к выделенному слову`,
    h1: `Подставь: ${n} — ${pr}? Или по-другому?`,
    h2: `Вопрос «${q}» — какое окончание звучит так же, как в вопросе?`,
    why: { ok: `${n} — ${pr} → ${q} → -${e}`, wrong: ['Пишу, как слышу', 'У всех слов окончание -ый'] },
  };
});

export const NOUN: SentItem[] = CASES.flatMap((c, ci) =>
  c.s.flatMap((s, si) =>
    NOUNS.map(([b, nom]) => {
      const e = c.e === 'ы' && /[кгхжшчщ]$/.test(b) ? 'и' : c.e;
      return {
        id: `n${ci}${si}${b}`,
        s,
        b,
        e,
        w: b + e,
        q: c.q,
        qs: [...shuffle(CASES.map((x) => x.q).filter((x) => x !== c.q)).slice(0, 2), c.q],
        es: ['а', e === 'и' ? 'и' : 'ы', 'е', 'у', 'ой'],
        qh: `Задай вопрос к выделенному слову (${nom})`,
        h1: 'Подставь вопрос в предложение — какой подходит?',
        h2: `Подставь помощника: «${c.h} ${b}…» — как скажешь?`,
        why: { ok: `«${c.q}» — ${c.h} ${b + e}`, wrong: ['Пишу, как слышу', `Окончание всегда как в слове «${nom}»`] },
      };
    }),
  ),
);

export const SOFT: SoftItem[] = SOFT_RAW.map(([w, a, b], i) => ({ id: 's' + i, w, bad: [a, b] }));

export const DW: DictItem[] = DICT_WORDS.map((x, i) => ({ id: 'd' + i, ...x }));
