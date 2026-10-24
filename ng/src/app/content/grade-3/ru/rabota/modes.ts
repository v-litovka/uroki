/* Режимы: как элемент превращается в упражнение (последовательность шагов). */
import { Exercise, Mode, Prompt, Seg, Step } from '../../../../core/models';
import { pick, shuffle } from '../../../../shared/utils/random';
import { DictItem, SentItem, SoftItem } from './items';
import { Why } from './data';
import { WS } from './data';

/* ---------- сцены ---------- */
const sentGap = (it: SentItem): Seg[] => {
  const [a, z] = it.s.split('{}');
  return [a, { t: it.b, cls: 'vb' }, { t: '…', cls: 'gp' }, z];
};
const sentWord = (it: SentItem, word = it.w): Seg[] => {
  const [a, z] = it.s.split('{}');
  return [a, { t: word, cls: 'vb' }, z];
};
const gapWord = (pattern: string): Seg[] => {
  const k = pattern.indexOf('_');
  return [pattern.slice(0, k), { t: '_', cls: 'gp' }, pattern.slice(k + 1)];
};
const why = (w: Why): Step => ({ kind: 'why', ok: w.ok, wrong: w.wrong, prompt: { hint: undefined } });

/* ---------- шаги ---------- */
const askQuestion = (it: SentItem): Step => ({
  kind: 'choice',
  options: it.qs,
  answer: it.q,
  prompt: { hint: it.qh },
  okMsg: `Вопрос: «${it.q}»`,
  hints: [it.h1],
});

/* ---------- режимы для «предложенческих» тем (тся/ться, окончания) ---------- */
export const sentenceModes = (withDictation = false): Mode<SentItem>[] => {
  const list: Mode<SentItem>[] = [
    {
      id: 'choose',
      title: 'Выбери',
      icon: '👆',
      desc: 'Вопрос, потом окончание',
      build: (it) => ({
        itemId: it.id,
        prompt: { sentence: sentGap(it) },
        steps: [
          askQuestion(it),
          {
            kind: 'choice',
            options: it.es,
            answer: it.e,
            shuffle: false,
            layout: 'small',
            prompt: { hint: `Вопрос «${it.q}». Какое окончание?` },
            hints: [it.h2],
            after: { sentence: sentWord(it) },
          },
          why(it.why),
        ],
      }),
    },
    {
      id: 'type',
      title: 'Напечатай окончание',
      icon: '⌨️',
      desc: 'Вопрос, потом окончание сама',
      build: (it) => ({
        itemId: it.id,
        prompt: { sentence: sentGap(it) },
        steps: [
          askQuestion(it),
          {
            kind: 'input',
            answer: it.e,
            placeholder: 'окончание',
            prompt: { hint: `Вопрос «${it.q}». Напечатай окончание` },
            hints: [it.h2],
            after: { sentence: sentWord(it) },
          },
          why(it.why),
        ],
      }),
    },
    {
      id: 'word',
      title: 'Напиши слово',
      icon: '✏️',
      desc: 'Всё слово с клавиатуры',
      build: (it) => ({
        itemId: it.id,
        prompt: { sentence: sentGap(it), hint: 'Напиши выделенное слово целиком' },
        steps: [
          { kind: 'input', answer: it.w, placeholder: 'слово', hints: [it.qh + '.', `Вопрос «${it.q}». ${it.h2}`], after: { sentence: sentWord(it) } },
          why(it.why),
        ],
      }),
    },
    {
      id: 'err',
      title: 'Найди ошибку',
      icon: '🔍',
      desc: 'Верно ли написано?',
      build: (it) => {
        const bad = Math.random() < 0.5;
        const shown = bad ? it.b + pick(it.es.filter((x) => x !== it.e)) : it.w;
        const steps: Step[] = [
          {
            kind: 'choice',
            options: ['Верно', 'Есть ошибка'],
            answer: bad ? 'Есть ошибка' : 'Верно',
            shuffle: false,
            layout: 'small',
            hints: [`Задай вопрос: «${it.q}». Подходит окончание?`],
            okMsg: bad ? 'Да, тут ошибка! Напиши слово правильно.' : undefined,
          },
        ];
        if (bad)
          steps.push({
            kind: 'input',
            answer: it.w,
            placeholder: 'слово',
            prompt: { hint: 'Напиши слово правильно' },
            hints: [`Вопрос «${it.q}». ${it.h2}`],
            after: { sentence: sentWord(it) },
          });
        steps.push(why(it.why));
        return { itemId: it.id, prompt: { sentence: sentWord(it, shown), hint: 'Слово написано верно?' }, steps };
      },
    },
  ];
  if (withDictation)
    list.push({
      id: 'dict',
      title: 'Диктант',
      icon: '🎧',
      desc: 'Слушай и пиши',
      needs: ['tts-ru'],
      build: (it) => ({
        itemId: it.id,
        prompt: { say: it.s.replace('{}', it.w), hint: 'Послушай предложение. Напиши глагол на -тся или -ться.' },
        steps: [
          {
            kind: 'input',
            answer: it.w,
            placeholder: 'слово',
            hints: ['Задай вопрос к этому слову: есть ли в вопросе ь?', `Это слово «${it.b}…», вопрос «${it.q}».`],
            after: { say: undefined, hint: undefined, sentence: sentWord(it) },
          },
          why(it.why),
        ],
      }),
    });
  return list;
};

/* ---------- «запомни и напиши» и диктант по слову (общие для ь и словарных) ---------- */
const lookWrite = (id: string, w: string, wy: Why): Exercise => ({
  itemId: id,
  prompt: {},
  steps: [
    { kind: 'memorize', word: w, button: 'Запомнила — спрятать', prompt: { big: w, hint: 'Посмотри на слово и запомни. Потом оно спрячется.' }, after: { big: '• • •', hint: 'Напиши слово по памяти' } },
    { kind: 'input', answer: w, placeholder: 'слово', showDiff: 'always', hints: ['Красные буквы — с ошибкой:'], after: { big: w } },
    why(wy),
  ],
});
const sayWrite = (id: string, w: string, wy: Why): Exercise => ({
  itemId: id,
  prompt: { say: w, hint: 'Послушай слово и напиши его' },
  steps: [
    { kind: 'input', answer: w, placeholder: 'слово', showDiff: 'second', hints: ['Послушай ещё раз и проверь каждую букву.', 'Правильно так:'], after: { say: undefined, hint: undefined, big: w } },
    why(wy),
  ],
});
const writeModes = <T extends { id: string; w: string }>(wy: (it: T) => Why): Mode<T>[] => [
  { id: 'write', title: 'Запомни и напиши', icon: '✏️', desc: 'Слово спрячется — напиши его', build: (it) => lookWrite(it.id, it.w, wy(it)) },
  { id: 'dict', title: 'Диктант', icon: '🎧', desc: 'Слушай и пиши', needs: ['tts-ru'], build: (it) => sayWrite(it.id, it.w, wy(it)) },
];

/* ---------- разделительный ь ---------- */
export const softModes = (whySoft: Why): Mode<SoftItem>[] => [
  {
    id: 'gap',
    title: 'Нужен ли ь?',
    icon: '👆',
    desc: 'ь, и или ничего',
    build: (it) => {
      const k = it.w.indexOf('ь');
      return {
        itemId: it.id,
        prompt: { sentence: gapWord(it.w.slice(0, k) + '_' + it.w.slice(k + 1)), hint: 'Что пропущено?' },
        steps: [
          { kind: 'choice', options: ['ь', 'и', 'ничего'], answer: 'ь', layout: 'small', hints: ['Скажи слово медленно. Слышишь [й] перед гласной?'], after: { sentence: [it.w] } },
          why(whySoft),
        ],
      };
    },
  },
  {
    id: 'pick',
    title: 'Как правильно?',
    icon: '🔍',
    desc: 'Выбери верное слово',
    build: (it) => ({
      itemId: it.id,
      prompt: { hint: 'Как написать правильно?' },
      steps: [{ kind: 'choice', options: [it.w, ...it.bad], answer: it.w, hints: ['Где слышится [й] — там нужен ь.'] }, why(whySoft)],
    }),
  },
  ...writeModes<SoftItem>(() => whySoft),
];

/* ---------- слова из диктанта ---------- */
export const dictModes = (): Mode<DictItem>[] => [
  {
    id: 'letter',
    title: 'Вставь букву',
    icon: '👆',
    desc: 'И объясни почему',
    build: (it) => {
      const [g, ok, bad, wy] = pick(it.sp);
      return {
        itemId: it.id,
        prompt: { sentence: gapWord(g), hint: 'Какая буква пропущена?' },
        steps: [
          {
            kind: 'choice',
            options: [ok, bad],
            answer: ok,
            layout: 'small',
            hints: [wy === WS ? 'Это словарное слово. Вспомни, как оно выглядит.' : 'Подумай, как проверить.'],
            after: { sentence: [it.w] },
          },
          why(wy),
        ],
      };
    },
  },
  {
    id: 'pick',
    title: 'Как правильно?',
    icon: '🔍',
    desc: 'Выбери верное слово',
    build: (it) => {
      const wr = shuffle(it.sp.map(([g, , bad]) => g.replace('_', bad === '—' ? '' : bad))).slice(0, 2);
      if (wr.length < 2) wr.push(it.w.length > 6 ? it.w.slice(0, -1) : it.w + 'ь');
      return {
        itemId: it.id,
        prompt: { hint: 'Как написать правильно?' },
        steps: [{ kind: 'choice', options: [it.w, ...wr], answer: it.w, hints: ['Посмотри внимательно на каждую букву.'] }, why(it.sp[0][3])],
      };
    },
  },
  ...writeModes<DictItem>((it) => it.sp[0][3]),
];

export type { Prompt };
