/* Режимы «Стишка»: Читаем → Допиши ответ → Найди пару → Собери стишок; отдельно — Экзамен. */
import { Mode, PoemLine, Step } from '../../../../core/models';
import { shuffle } from '../../../../shared/utils/random';
import { ALL_FACTS, Block, Fact, catLine, pairOf } from './items';

const poem = (b: Block, o: { gap?: number; good?: number; hl?: number[]; only?: number[] } = {}): PoemLine[] =>
  b.L.map((l, i) => ({ l, i }))
    .filter(({ i }) => !o.only || o.only.includes(i))
    .map(({ l, i }) => ({
      t: l.t,
      mul: !!l.x,
      hl: !!o.hl?.includes(i),
      gap: o.gap === i ? l.g : undefined,
      good: o.good === i ? l.g : undefined,
    }));

const NUM = (f: Fact) => `${f.x} × ${f.y} = ?`;

export const readMode = (b: Block): Mode<Block> => ({
  id: 'read',
  title: 'Читаем',
  icon: '📖',
  desc: 'Прочитай вслух и запомни',
  items: [b],
  shuffle: false,
  build: (blk) => ({
    itemId: blk.id,
    prompt: {
      poem: poem(blk),
      say: blk.L.map((l) => l.t.replace(/\s*\([^)]*\)/g, '')).join(' '),
      sayAuto: false,
      hint: 'Прочитай стишок вслух 2 раза. Цветные строчки — это таблица умножения.',
    },
    steps: [{ kind: 'memorize', button: 'Прочитала!', lockSec: 8, okMsg: 'Молодец!' }],
  }),
});

export const gapMode: Mode<Fact> = {
  id: 'gap',
  title: 'Допиши ответ',
  icon: '✏️',
  desc: 'Какое число спряталось?',
  build: (f) => ({
    itemId: f.id,
    prompt: { poem: poem(f.block, { gap: f.i, hl: pairOf(f.block, f.i) }), big: NUM(f) },
    steps: [
      {
        kind: 'input',
        answer: String(f.v),
        numeric: true,
        placeholder: 'ответ',
        okMsg: `${f.x} × ${f.y} = ${f.v}`,
        hints: ['Прочитай выделенные строчки вслух — рифма подскажет.', `В стишке это: «${f.w}». Запиши цифрами.`],
        after: { poem: poem(f.block, { good: f.i, hl: pairOf(f.block, f.i) }) },
      },
    ],
  }),
};

export const pairMode: Mode<Fact> = {
  id: 'pair',
  title: 'Найди пару',
  icon: '🐾',
  desc: 'Какая строчка про кошек подходит?',
  build: (f) => {
    const right = catLine(f)!;
    const together = pairOf(f.block, f.i).map((j) => f.block.L[j].t).join(' / ');
    let step: Step;
    if (Math.random() < 0.5) {
      // по примеру → строчка про кошек
      const wrong = [...new Set(shuffle(ALL_FACTS.filter((o) => o.v !== f.v).map(catLine)).filter((t): t is string => !!t && t !== right))].slice(0, 2);
      step = { kind: 'choice', options: [right, ...wrong], answer: right, layout: 'list', okMsg: together, prompt: { big: `${f.x} × ${f.y} = ${f.v}`, hint: 'Какая строчка про кошек к этому примеру?' } };
    } else {
      // по строчке → ответ примера
      const near = [...new Set(shuffle([f.v + f.x, f.v - f.x, f.v + 1, f.v - 1, f.v + 10].filter((v) => v > 0 && v !== f.v)))].slice(0, 2);
      step = {
        kind: 'choice',
        options: [String(f.v), ...near.map(String)],
        answer: String(f.v),
        layout: 'small',
        okMsg: together,
        prompt: { poem: [{ t: right }], hint: `Какой пример идёт с этой строчкой? ${f.x} × ${f.y} = ?` },
      };
    }
    return { itemId: f.id, prompt: {}, steps: [step] };
  },
};

export const orderMode = (b: Block): Mode<Block> => ({
  id: 'order',
  title: 'Собери стишок',
  icon: '🧩',
  desc: 'Расставь строчки по порядку',
  items: [b],
  shuffle: false,
  // как в исходной игре: 3 звезды, минус одна за каждые 2 ошибки, минимум 1
  stars: (r) => Math.max(1, 3 - Math.floor(r.mistakes / 2)),
  build: (blk) => ({
    itemId: blk.id,
    prompt: {},
    steps: [
      {
        kind: 'order',
        items: blk.L.map((l) => l.t),
        note: 'Нажимай на строчки по порядку — с первой до последней.',
        hintFirst: 'Это не первая строчка. С чего начинается стишок?',
        hintAfter: 'После «{prev}» идёт другая строчка.',
      },
    ],
  }),
});

export const examMode: Mode<Fact> = {
  id: 'exam',
  title: 'Экзамен',
  icon: '⭐',
  desc: '12 примеров из всей таблицы',
  roundSize: 12,
  build: (f) => {
    const P = pairOf(f.block, f.i);
    return {
      itemId: f.id,
      prompt: { big: NUM(f) },
      steps: [
        {
          kind: 'input',
          answer: String(f.v),
          numeric: true,
          placeholder: 'ответ',
          hints: ['Вспомни стишок:'],
          // 1-я ошибка — кусочек стиха с «?» на месте ответа, 2-я — целиком
          wrongPrompt: [{ poem: poem(f.block, { only: P, gap: f.i }) }, { poem: poem(f.block, { only: P }) }],
          after: { poem: poem(f.block, { only: P, good: f.i }) },
        },
      ],
    };
  },
};
