/* «Город Задач»: задача (шаблон + новые числа) → шаги движка.
 * Шаги как в старой игре (legacy.ts → mainSpecs): у кого больше? → выбери схему → каким действием → вычисли.
 * Ошибка → урок (правило + похожая решённая задача) → та же задача заново. В «Вычисли» первая ошибка — «пересчитай». */
import { Exercise, Mode, Step } from '../../../../core/models';
import { shuffle } from '../../../../shared/utils/random';
import { StreetTexts, lessonOf, streetExercise } from '../../../common/streets';
import { ZD } from './legacy';

const { ITEMS, RULES, makeInst, mainSpecs, solved } = ZD;

/** задача-шаблон из legacy.ts (TPL + улица и id) */
export interface TaskItem {
  id: string;
  street: string;
  type: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

interface Spec {
  ask: string;
  show?: string;
  opts?: string[];
  ans: string;
  long?: boolean;
  num?: boolean;
  cards?: { v: string; html: string }[];
}

const TX: StreetTexts = { correct: 'Верно! +1 ⭐', next: 'Дальше', examples: 'Смотри, как решается похожая задача', remember: '' };
const task = (text: string, sm = false) => `<p class="task${sm ? ' sm' : ''}">${text}</p>`;

function toStep(sp: Spec, text: string): Step {
  const prompt = { ask: sp.ask.replace(/<[^>]+>/g, ''), html: task(text) + (sp.show ?? '') + (/<b/.test(sp.ask) ? `<p class="why">${sp.ask}</p>` : ''), hint: undefined };
  if (sp.num)
    return { kind: 'input', numeric: true, answer: sp.ans, placeholder: 'ответ', prompt, hints: ['Не так. Пересчитай ещё раз внимательно.'], lessonAfter: 2 };
  if (sp.cards)
    return {
      kind: 'choice',
      options: sp.cards.map((c) => c.v),
      optionHtml: Object.fromEntries(sp.cards.map((c) => [c.v, c.html])),
      answer: sp.ans,
      shuffle: false,
      layout: 'cards',
      prompt,
    };
  const opts = sp.opts!;
  return { kind: 'choice', options: opts, answer: sp.ans, shuffle: false, layout: sp.long || opts.some((o) => o.length > 11) ? 'list' : 'grid', prompt };
}

/** «Число 6 — это что?»: вопрос с выделенным числом остаётся в ask как текст */
function fixAsk(sp: Spec): Spec {
  return { ...sp, ask: sp.ask.replace(/<b class="big">(\d+)<\/b>/, '«$1»') };
}

export function exercise(it: TaskItem): Exercise {
  it['inst'] = makeInst(it);
  const text: string = it['inst'].text;
  const steps = (mainSpecs(it) as Spec[]).map(fixAsk).map((sp) => toStep(sp, text));
  const rule = RULES[it.type];
  const same = ITEMS.filter((x) => x.type === it.type && x.id !== it.id);
  const other = same.length ? shuffle(same)[0] : it;
  const ex = solved(other, makeInst(other));
  const lesson = { ...lessonOf(rule, TX, [ex]), task: task(text, true) };
  return { ...streetExercise({ id: it.id, label: `${rule.title}: ${text.slice(0, 50)}…` }, steps, solved(it), rule, lesson, TX) };
}

export const playMode = (desc: string): Mode<TaskItem>[] => [{ id: 'play', title: 'Решать', icon: '▶️', desc, build: exercise }];
