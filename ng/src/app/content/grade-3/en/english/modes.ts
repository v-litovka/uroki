/* English: вопрос генератора (gen.ts) → шаги движка. Режимы темы = уровни (лёгкий / средний / сложный).
 * Ошибка 1 — подсказка, ошибка 2 — урок «Правильно: … + правило», потом то же задание заново. */
import { Exercise, Mode, Prompt, Step } from '../../../../core/models';
import { Lv, Q, esc, genQ } from './gen';

/** есть ли английский голос (для «послушай и выбери картинку») */
const canSpeak = () => {
  try {
    return globalThis.speechSynthesis?.getVoices().some((v) => /^en/i.test(v.lang)) ?? false;
  } catch {
    return false;
  }
};
const apos = (s: string) => [s, s.replace(/'/g, '’')];

function scene(q: { ask: string; show?: string; listen?: string }): Partial<Prompt> {
  return { ask: q.ask, html: q.show || undefined, say: q.listen, sayLang: 'en', hint: undefined };
}
/** после верного ответа — озвучить фразу целиком */
const after = (q: Q): Partial<Prompt> | undefined => (q.say ? { say: q.say, sayLang: 'en', sayAuto: true } : undefined);
const layout = (opts: string[], pics?: boolean, small?: boolean) => (pics ? 'pics' : small ? 'small' : opts.some((o) => o.length > 14) ? 'list' : 'grid');

export function steps(q: Q): Step[] {
  const hints = q.hint ? [q.hint] : undefined;
  switch (q.kind) {
    case 'choice':
      return [{ kind: 'choice', options: q.opts, answer: q.ans, shuffle: false, layout: layout(q.opts, q.pics, q.small), prompt: scene(q), hints, after: after(q) }];
    case 'steps':
      return q.steps.map((s, i) => ({
        kind: 'choice',
        options: s.opts,
        answer: s.ans,
        shuffle: false,
        layout: layout(s.opts, false, s.small),
        prompt: scene(s),
        after: i === q.steps.length - 1 ? after(q) : undefined,
      }));
    case 'type':
      return [{ kind: 'input', answer: q.accept.flatMap(apos), placeholder: 'слово', prompt: scene(q), hints: ['Подумай ещё. Посмотри на правило в таблице выше.'], after: after(q) }];
    case 'tiles': {
      const letters = q.word.split('');
      const pool = 'abcdefghiklmnoprstuwy'.split('').filter((c) => !q.word.toLowerCase().includes(c));
      const extra = q.extra ? pool.sort(() => Math.random() - 0.5).slice(0, q.extra) : [];
      return [
        {
          kind: 'order',
          items: letters,
          extra,
          inline: true,
          joiner: '',
          hintFirst: 'Какая буква первая? Послушай слово 🔊',
          hintAfter: 'Не эта буква. Какая идёт после «{prev}»?',
          prompt: { ...scene(q), say: q.word, sayAuto: false },
          after: after(q),
        },
      ];
    }
    case 'words':
      return [
        {
          kind: 'order',
          items: q.tokens,
          inline: true,
          joiner: ' ',
          hintFirst: 'Какое слово первое? В вопросе is, are, has, have, can ставим вперёд.',
          hintAfter: 'Не это слово. Какое идёт после «{prev}»?',
          prompt: scene(q),
          after: after(q),
        },
      ];
    case 'spell':
      return [
        {
          kind: 'memorize',
          word: q.word,
          button: 'Готова! Пишу',
          prompt: { ...scene(q), html: (q.show ?? '') + `<div class="word">${esc(q.word)}</div>`, say: q.word, hint: 'Посмотри и запомни. Сейчас слово спрячется — напишешь его сама.' },
          after: { html: q.show, hint: undefined },
        },
        { kind: 'input', answer: q.word, placeholder: 'слово', showDiff: 'always', hints: ['Красные буквы — неверные. Исправь их.'], after: after(q) },
      ];
  }
}

const answerOf = (q: Q) => (q.kind === 'choice' || q.kind === 'type' ? q.ans : q.kind === 'tiles' || q.kind === 'spell' ? q.word : q.kind === 'words' ? q.say ?? q.tokens.join(' ') : q.steps.at(-1)!.ans);

export function exercise(q: Q): Exercise {
  const ans = answerOf(q);
  return {
    itemId: q.key,
    label: q.say ?? ans,
    prompt: {},
    steps: steps(q),
    lessonAfter: q.kind === 'type' ? 3 : 2,
    lesson: { title: 'Правило', html: `<p class="verdict" style="color:var(--trap)">Правильно: ${esc(ans)}</p>${q.rule ?? ''}`, lockSec: 5 },
  };
}

/** не повторять одно и то же задание подряд (как R.seen в старой игре) */
const recent: string[] = [];
function fresh(topic: string, lv: Lv): Q {
  let q = genQ(topic, lv, canSpeak());
  for (let k = 0; k < 12 && recent.includes(q.key); k++) q = genQ(topic, lv, canSpeak());
  recent.push(q.key);
  if (recent.length > 30) recent.shift();
  return q;
}

export const LEVEL_DESC: Record<string, string[]> = {
  be: ['am / is / are, узнать отрицание', 'Сделай «не…», вопрос, короткий ответ', 'Собери вопрос из слов, напиши сама'],
  have: ["have или has, узнать hasn't", '«Нет у…», вопрос Has…got?, короткий ответ', 'Собери вопрос из слов, напиши сама'],
  can: ["can или can't по картинке", '«Не может», вопрос Can…?, короткий ответ', 'Собери вопрос из слов, напиши сама'],
  pron: ['Кто это? he, she, it, they — с картинками', 'Замени в предложении: he → his, she → her', 'Два шага: кто это → чей? Все местоимения'],
  unit: ['Картинка → слово, слушай → картинка', 'Слово с перепутанными буквами, собери из букв', 'Собери из букв с лишними, напиши сама'],
};
const LV_TITLE = ['Лёгкий', 'Средний', 'Сложный'];
const LV_ICON = ['🙂', '💪', '🔥'];

/** элемент темы — «место в раунде»: задание каждый раз генерируется заново */
export interface Slot {
  id: string;
}
export const slots = (topic: string, n = 10): Slot[] => Array.from({ length: n }, (_, i) => ({ id: `${topic}#${i}` }));

export function levelModes(topic: string): Mode<Slot>[] {
  const desc = LEVEL_DESC[topic] ?? LEVEL_DESC['unit'];
  return ([0, 1, 2] as Lv[]).map((lv) => ({
    id: ['easy', 'mid', 'hard'][lv],
    title: LV_TITLE[lv],
    icon: LV_ICON[lv],
    desc: desc[lv],
    build: () => exercise(fresh(topic, lv)),
  }));
}
