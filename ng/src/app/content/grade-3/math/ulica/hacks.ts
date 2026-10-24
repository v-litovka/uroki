/* Хитрости Улицы Домиков (как в старой игре): правило + шаги «реши сама».
 * Шаг — [текст с {} на месте ответа, ответ]. samples — на каких числах показать 2 примера. */
import { BASE, BLOCKS, Block, RHYME, RHYME_NOTE, SPECIAL } from './data';

export type HackStep = [string, number];
export interface Hack {
  title: string;
  rule: string;
  samples: number[];
  steps(v: number): HackStep[];
  res(v: number): string;
  /** «трудные» домики: стишок вместо хитрости */
  rhyme?: string;
  note?: string;
}

export interface Card {
  id: string;
  x: number;
  y: number;
  n: number;
  block: Block;
  label: string;
}

export const CARDS: Card[] = BLOCKS.flatMap((block) => block.cards.map(([x, y]) => ({ id: `${x}x${y}`, x, y, n: x * y, block, label: `${x} × ${y} = ${x * y}` })));
export const BY_ID: Record<string, Card> = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export const MH: Record<string, Hack> = {
  dbl: { title: 'Удвоение', rule: 'Умножить на 2 — значит сложить число с самим собой.', samples: [3, 4, 6, 7, 8, 9], steps: (x) => [[`${x} + ${x} = {}`, 2 * x]], res: (x) => `2 × ${x} = ${2 * x}` },
  five: {
    title: 'Через десятку',
    rule: 'Умножь на 10 — просто припиши ноль. Потом раздели пополам.',
    samples: [3, 4, 6, 7, 8, 9],
    steps: (x) => [[`${x} × 10 = {}`, 10 * x], [`половина от ${10 * x} = {}`, 5 * x]],
    res: (x) => `5 × ${x} = ${5 * x}`,
  },
  four: {
    title: 'Двойное удвоение',
    rule: 'Умножить на 4 — значит удвоить, а потом ещё раз удвоить.',
    samples: [3, 5, 6, 7, 8, 9],
    steps: (x) => [[`${x} + ${x} = {}`, 2 * x], [`${2 * x} + ${2 * x} = {}`, 4 * x]],
    res: (x) => `4 × ${x} = ${4 * x}`,
  },
  nine: {
    title: 'Десятка без одного',
    rule: '9 — это 10 без одного. Умножь число на 10 (припиши ноль) и отними само число. Можно и на пальцах: загни нужный палец — слева десятки, справа единицы.',
    samples: [3, 4, 5, 6, 7, 8],
    steps: (x) => [[`${x} × 10 = {}`, 10 * x], [`${10 * x} − ${x} = {}`, 9 * x]],
    res: (x) => `9 × ${x} = ${9 * x}`,
  },
  three: {
    title: 'Удвой и прибавь',
    rule: 'Умножить на 3 — удвой число и прибавь его ещё раз.',
    samples: [4, 5, 6, 7, 8, 9],
    steps: (x) => [[`${x} + ${x} = {}`, 2 * x], [`${2 * x} + ${x} = {}`, 3 * x]],
    res: (x) => `3 × ${x} = ${3 * x}`,
  },
  sixEven: {
    title: 'Шестёрка на чётное',
    rule: '6 на чётное число: сначала пишем половину этого числа, а потом само число. 6 × 4 → 2 и 4 → 24.',
    samples: [2, 4, 6, 8],
    steps: (x) => [[`половина от ${x} = {}`, x / 2], [`6 × ${x} = {}`, 6 * x]],
    res: (x) => `6 × ${x} = ${6 * x}`,
  },
  sixPlus: {
    title: 'Пять и ещё один',
    rule: 'Шесть раз по числу — это пять раз и ещё один раз.',
    samples: [3, 4, 8, 9],
    steps: (x) => [[`5 × ${x} = {}`, 5 * x], [`${5 * x} + ${x} = {}`, 6 * x]],
    res: (x) => `6 × ${x} = ${6 * x}`,
  },
  sevenSplit: {
    title: 'Пять и ещё два',
    rule: 'Семь раз по числу — это пять раз и ещё два раза.',
    samples: [3, 4, 6, 8],
    steps: (x) => [[`5 × ${x} = {}`, 5 * x], [`2 × ${x} = {}`, 2 * x], [`${5 * x} + ${2 * x} = {}`, 7 * x]],
    res: (x) => `7 × ${x} = ${7 * x}`,
  },
  eight: {
    title: 'Три удвоения',
    rule: 'Восемь — это три удвоения: удвой, ещё раз удвой и ещё раз удвой.',
    samples: [3, 4, 5, 6],
    steps: (x) => [[`${x} + ${x} = {}`, 2 * x], [`${2 * x} + ${2 * x} = {}`, 4 * x], [`${4 * x} + ${4 * x} = {}`, 8 * x]],
    res: (x) => `8 × ${x} = ${8 * x}`,
  },
  seq5678: {
    title: '5 · 6 · 7 · 8',
    rule: 'Выпиши подряд четыре цифры: 5, 6, 7, 8. Первые две — это ответ, последние две — сам пример: 56 = 7 × 8.',
    samples: [],
    steps: () => [[`5, 6, 7, 8 → первые две цифры: {}`, 56], [`7 × 8 = {}`, 56]],
    res: () => '7 × 8 = 56',
  },
};

export function divHack(d: number): Hack {
  if (d === 2)
    return {
      title: 'Половинка',
      rule: 'Разделить на 2 — значит найти половину: число, которое плюс оно же даёт нужное число.',
      samples: [3, 4, 5, 6, 7, 8, 9],
      steps: (q) => [[`{} + {} = ${2 * q}`, q]],
      res: (q) => `${2 * q} : 2 = ${q}`,
    };
  if (d === 5)
    return {
      title: 'Умножь на 2 и убери ноль',
      rule: 'Разделить на 5: умножь число на 2 и зачеркни ноль в конце.',
      samples: [3, 4, 6, 7, 8, 9],
      steps: (q) => [[`${5 * q} × 2 = {}`, 10 * q], [`${10 * q} без нуля = {}`, q]],
      res: (q) => `${5 * q} : 5 = ${q}`,
    };
  if (d === 4)
    return {
      title: 'Пополам дважды',
      rule: 'Разделить на 4: раздели пополам, а потом ещё раз пополам.',
      samples: [3, 5, 6, 7, 8, 9],
      steps: (q) => [[`половина от ${4 * q} = {}`, 2 * q], [`половина от ${2 * q} = {}`, q]],
      res: (q) => `${4 * q} : 4 = ${q}`,
    };
  if (d === 9)
    return {
      title: 'Первая цифра + 1',
      rule: 'Разделить на 9: возьми первую цифру числа и прибавь к ней 1.',
      samples: [3, 4, 5, 6, 7, 8],
      steps: (q) => [[`первая цифра в ${9 * q} = {}`, q - 1], [`${q - 1} + 1 = {}`, q]],
      res: (q) => `${9 * q} : 9 = ${q}`,
    };
  return {
    title: 'Опора на пятёрку',
    rule: `Деление — это умножение наоборот: ищем, сколько раз по ${d} помещается в числе. Сначала берём удобный кусок — 5 раз по ${d} (или 2 раза, если число маленькое), потом смотрим, сколько ещё раз по ${d} поместится в остатке.`,
    samples: [3, 4, 6, 7, 8, 9],
    steps: (q) => {
      const a = q >= 5 ? 5 : 2;
      if (q === a) return [[`${a} × ${d} = {}`, a * d], [`значит ${q * d} : ${d} = {}`, q]];
      return [[`${a} × ${d} = {}`, a * d], [`${q * d} − ${a * d} = {}`, (q - a) * d], [`${(q - a) * d} : ${d} = {}`, q - a], [`${a} + ${q - a} = {}`, q]];
    },
    res: (q) => `${q * d} : ${d} = ${q}`,
  };
}

/** трудные домики (6, 7, 8): вместо хитрости — стишок */
export function rhymeHack(c: Card, d: number | null): Hack {
  return {
    title: 'Вспомни стишок',
    rhyme: RHYME[c.id],
    note: RHYME_NOTE[c.id],
    rule: 'Прочитай стишок вслух и запомни. Потом реши задачу без подсказки.',
    samples: [],
    steps: () => (d ? [[`${d} × {} = ${c.n}`, c.n / d], [`значит ${c.n} : ${d} = {}`, c.n / d]] : [[`${c.x} × ${c.y} = {}`, c.n]]),
    res: () => (d ? `${c.n} : ${d} = ${c.n / d}` : `${c.x} × ${c.y} = ${c.n}`),
  };
}

/** урок для деления: на 2, 4, 5, 9 — своя хитрость; на 3, 6, 7, 8 — стишок домика или умножение наоборот */
export function divLesson(c: Card, d: number): { h: Hack; v: number } {
  const q = c.n / d;
  if ([2, 4, 5, 9].includes(d)) return { h: divHack(d), v: q };
  const nine = c.x === 9 || c.y === 9;
  if (RHYME[c.id] && !nine) return { h: rhymeHack(c, d), v: q };
  const t = nine ? 'nine' : c.block.mh!;
  const x = c.x === BASE[t] ? c.y : c.x;
  const h0 = MH[t];
  return {
    v: x,
    h: {
      title: h0.title,
      rule: h0.rule + ' Деление — это умножение наоборот: сначала умножь, потом раздели.',
      samples: h0.samples,
      steps: (s) => (s === x ? [...h0.steps(x), [`значит ${c.n} : ${d} = {}`, q] as HackStep] : h0.steps(s)),
      res: (s) => (s === x ? `${c.n} : ${d} = ${q}` : h0.res(s)),
    },
  };
}

/** хитрость для ошибки в домике: hide — что спрятано (top — ответ, x/y — множитель), d — делитель */
export function hackFor(c: Card, hide: 'top' | 'x' | 'y', d?: number): { h: Hack; v: number } {
  if (hide !== 'top') return divLesson(c, d!);
  if (c.block.id === 6 && RHYME[c.id]) return { h: rhymeHack(c, null), v: c.n };
  const t = SPECIAL[c.id] || c.block.mh!;
  return { h: MH[t], v: c.x === BASE[t] ? c.y : c.x };
}
