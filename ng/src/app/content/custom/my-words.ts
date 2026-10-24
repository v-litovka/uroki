/* «Мои словарные слова» — пак, который собирается из слов, добавленных взрослым в кабинете. */
import { CustomWord, Grade, Mode, Pack, Seg } from '../../core/models';
import { pick, shuffle } from '../../shared/utils/random';
import { Why, writeModes } from '../common/word-modes';

export const MY_WORDS_PACK_ID = 'my-words';

/** с чем путают букву */
const ALT: Record<string, string[]> = {
  а: ['о'], о: ['а'], е: ['и', 'я'], и: ['е'], я: ['е', 'и'], ё: ['о', 'е'], э: ['е'], у: ['ю'], ю: ['у'], ы: ['и'],
  б: ['п'], п: ['б'], в: ['ф'], ф: ['в'], г: ['к'], к: ['г'], д: ['т'], т: ['д'], ж: ['ш'], ш: ['ж'], з: ['с'], с: ['з'],
  ь: ['ъ', ''], ъ: ['ь', ''], й: ['и'],
};
const VOWELS = ['а', 'о', 'е', 'и'];

export interface MyWordItem {
  id: string;
  w: string;
  /** трудные места: [начало, конец) — соседние трудные буквы склеены («кк») */
  segs: [number, number][];
  check?: string;
}

function segments(tricky: number[]): [number, number][] {
  const s = [...tricky].sort((a, b) => a - b);
  const out: [number, number][] = [];
  for (const i of s) {
    const last = out[out.length - 1];
    if (last && last[1] === i) last[1] = i + 1;
    else out.push([i, i + 1]);
  }
  return out;
}

/** неверные варианты для куска слова */
export function alternatives(part: string): string[] {
  if (part.length === 2 && part[0] === part[1]) return [part[0]]; // «кк» → «к»
  const alt = ALT[part] ?? (part.length === 1 && !VOWELS.includes(part) ? [part + part] : VOWELS.filter((v) => v !== part));
  return alt.filter((a) => a !== part);
}

const whyOf = (it: MyWordItem): Why =>
  it.check
    ? { ok: `Проверка: ${it.check}`, wrong: ['Пишу, как слышу'] }
    : { ok: 'Словарное слово — его надо запомнить', wrong: ['Проверю ударением'] };

const why = (w: Why) => ({ kind: 'why' as const, ok: w.ok, wrong: w.wrong, prompt: { hint: undefined } });

const modes: Mode<MyWordItem>[] = [
  {
    id: 'letter',
    title: 'Вставь букву',
    icon: '👆',
    desc: 'И объясни почему',
    build: (it) => {
      const [a, b] = pick(it.segs);
      const right = it.w.slice(a, b);
      const wrong = alternatives(right).slice(0, 2).map((x) => (x === '' ? '—' : x));
      const gap: Seg[] = [it.w.slice(0, a), { t: '_', cls: 'gp' }, it.w.slice(b)];
      return {
        itemId: it.id,
        label: it.w,
        prompt: { sentence: gap, hint: 'Какая буква пропущена?' },
        steps: [
          {
            kind: 'choice',
            options: [right, ...wrong],
            answer: right,
            layout: 'small',
            hints: [it.check ? 'Подбери проверочное слово.' : 'Это словарное слово. Вспомни, как оно выглядит.'],
            after: { sentence: [it.w] },
          },
          why(whyOf(it)),
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
      const variants = new Set<string>();
      for (const [a, b] of shuffle(it.segs)) {
        for (const alt of alternatives(it.w.slice(a, b))) variants.add(it.w.slice(0, a) + alt + it.w.slice(b));
      }
      variants.delete(it.w);
      const wrong = shuffle([...variants]).slice(0, 2);
      return {
        itemId: it.id,
        label: it.w,
        prompt: { hint: 'Как написать правильно?' },
        steps: [{ kind: 'choice', options: [it.w, ...wrong], answer: it.w, hints: ['Посмотри внимательно на каждую букву.'] }, why(whyOf(it))],
      };
    },
  },
  ...writeModes<MyWordItem>(whyOf),
];

export function myWordItems(words: CustomWord[]): MyWordItem[] {
  return words.map((w) => ({ id: w.id, w: w.word, segs: segments(w.tricky), check: w.check }));
}

/** Собрать пак из слов ребёнка. */
export function buildMyWordsPack(words: CustomWord[], grade: Grade): Pack {
  return {
    id: MY_WORDS_PACK_ID,
    grade,
    subject: 'ru',
    title: 'Мои словарные слова',
    desc: 'Слова, которые добавил взрослый. Трудные буквы — те, где чаще всего ошибаются.',
    color: '#0CA678',
    mascot: 'pets',
    topics: [
      {
        id: 'words',
        title: 'Мои слова',
        desc: words.slice(0, 6).map((w) => w.word).join(', ') + (words.length > 6 ? '…' : ''),
        color: '#0CA678',
        ruleHtml: `<p>Слова для запоминания (${words.length}). Трудные буквы выделены:</p><p>${words
          .map((w) => [...w.word].map((ch, i) => (w.tricky.includes(i) ? `<b>${ch}</b>` : ch)).join(''))
          .join(', ')}</p>`,
        items: myWordItems(words),
        modes,
      },
    ],
  };
}
