/* Переходник для игр на старом движке «городов» (4 класс: Город Слов 4, Горад Слоў 4, Город Задач 4).
 * Логика каждой игры перенесена как есть (legacy.ts под @ts-nocheck): mainSpecs(it) → «спеки» шагов, solved, lessonHTML, ruleFor.
 * Здесь спеки превращаются в шаги движка, а задание — в упражнение «шаги → Верно + правило → урок при ошибке». */
import { Exercise, Mode, Step, Topic } from '../../core/models';
import { StreetTexts, choice, scene, streetExercise } from './streets';

/** шаг старого движка */
export interface CitySpec {
  ask: string;
  show?: string;
  opts?: string[];
  ans: string;
  /** ещё верные */
  okv?: string[];
  note?: string;
  long?: boolean | number;
  letters?: boolean | number;
  /** напечатать букву */
  typeL?: boolean;
  /** всё слово по памяти */
  spell?: boolean;
  word?: string;
  /** число */
  num?: boolean;
  /** схемы-картинки: v — значение, html — SVG */
  cards?: { v: string; html: string }[];
}

export interface CityItem {
  id: string;
  street: string;
  type: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any;
}

/** что нужно от legacy.ts игры */
export interface CityGame {
  STREETS: { id: string; name: string; c: string; desc: string }[];
  RULES: Record<string, { title: string; text: string }>;
  ITEMS: CityItem[];
  mainSpecs(it: CityItem): CitySpec[];
  solved(it: CityItem): string;
  lessonHTML(it: CityItem): { title: string; text: string; ex: string };
  ruleFor(it: CityItem): { title: string; text: string };
  /** новые числа задачи (Город Задач): text — условие */
  makeInst?(it: CityItem): { text: string };
  /** уровни улиц: S.lv[street] = 0 | 1 | 2 */
  S: { lv: Record<string, number> };
}

export interface CityTexts extends StreetTexts {
  /** «буква» — подсказка в поле */
  letterPh: string;
  /** «Пишу слово!» */
  readyBtn: string;
  /** «Посмотри на слово и запомни…» */
  ready: string;
  /** «Красные буквы — неверные…» */
  wrongCells: string;
  /** «Не так. Пересчитай ещё раз внимательно.» */
  recount: string;
}

const strip = (h: string) => h.replace(/<[^>]+>/g, '');

/** спеки → шаги; head — то, что всегда над сценой (условие задачи) */
export function citySteps(specs: CitySpec[], T: CityTexts, head = ''): Step[] {
  const out: Step[] = [];
  for (const sp of specs) {
    const extra = /<[a-z]/.test(sp.ask) ? `<p class="why">${sp.ask}</p>` : '';
    const show = head + (sp.show ?? '') + extra;
    const ask = strip(sp.ask);
    if (sp.spell && sp.word) {
      out.push(
        { kind: 'memorize', word: sp.word, button: T.readyBtn, prompt: { ask, html: head + `<div class="word">${sp.word}</div>`, hint: T.ready }, after: { html: head + '<div class="word">• • •</div>', hint: undefined } },
        { kind: 'input', answer: sp.word, placeholder: '…', showDiff: 'always', hints: [T.wrongCells] },
      );
    } else if (sp.typeL) {
      out.push({ kind: 'input', answer: sp.ans, placeholder: T.letterPh, prompt: scene({ ask, show, note: sp.note }) });
    } else if (sp.num) {
      out.push({ kind: 'input', numeric: true, answer: sp.ans, placeholder: '?', prompt: scene({ ask, show, note: sp.note }), hints: [T.recount], lessonAfter: 2 });
    } else if (sp.cards) {
      out.push({
        kind: 'choice',
        options: sp.cards.map((c) => c.v),
        optionHtml: Object.fromEntries(sp.cards.map((c) => [c.v, c.html])),
        answer: sp.ans,
        shuffle: false,
        layout: 'cards',
        prompt: scene({ ask, show, note: sp.note }),
      });
    } else {
      out.push(choice({ ask, show, note: sp.note ? strip(sp.note) : undefined }, sp.opts!, sp.ans, { letters: !!sp.letters, long: !!sp.long, accept: sp.okv }));
    }
  }
  return out;
}

/** задание → упражнение (lv — уровень улицы, если есть) */
export function cityExercise(G: CityGame, it: CityItem, T: CityTexts, lv = 0): Exercise {
  G.S.lv[it.street] = lv;
  if (G.makeInst) it['inst'] = G.makeInst(it);
  const text: string = it['inst']?.text ?? '';
  const head = text ? `<p class="task">${text}</p>` : '';
  const steps = citySteps(G.mainSpecs(it), T, head);
  const ls = G.lessonHTML(it);
  const lesson = { title: ls.title, html: `<p>${ls.text}</p>${ls.ex ?? ''}`, task: text ? `<p class="task sm">${text}</p>` : undefined };
  return streetExercise({ id: it.id, label: it.label ?? (text ? text.slice(0, 60) + '…' : undefined) }, steps, G.solved(it), G.ruleFor(it), lesson, T);
}

export interface Level {
  id: string;
  title: string;
  icon: string;
  desc: string;
}

/** темы-улицы + «всё вперемешку»; levels — режимы-уровни для улиц с уровнями (словарные слова) */
export function cityTopics(G: CityGame, T: CityTexts, opt: { levels?: Record<string, Level[]>; play: string; mix: { title: string; desc: string; rule: string; mode: string } }): Topic[] {
  const ruleHtml = (street: string) =>
    [...new Set(G.ITEMS.filter((x) => x.street === street).map((x) => G.ruleFor(x)))]
      .filter(Boolean)
      .map((r) => `<p><b>${r.title}.</b> ${r.text}</p>`)
      .join('');
  const mode = (id: string, title: string, icon: string, desc: string, lv = 0): Mode<CityItem> => ({ id, title, icon, desc, build: (it) => cityExercise(G, it, T, lv) });
  const topics: Topic[] = G.STREETS.map((st) => ({
    id: st.id,
    title: st.name,
    desc: st.desc,
    color: st.c,
    ruleHtml: ruleHtml(st.id),
    items: G.ITEMS.filter((x) => x.street === st.id),
    modes: (opt.levels?.[st.id]?.map((l, i) => mode(l.id, l.title, l.icon, l.desc, i)) ?? [mode('play', opt.play, '▶️', st.desc)]) as Topic['modes'],
  }));
  topics.push({
    id: 'mix',
    title: opt.mix.title,
    desc: opt.mix.desc,
    color: '#26224F',
    ruleHtml: opt.mix.rule,
    items: G.ITEMS,
    roundSize: 20,
    modes: [mode('play', opt.play, '▶️', opt.mix.mode)] as Topic['modes'],
  });
  return topics;
}
