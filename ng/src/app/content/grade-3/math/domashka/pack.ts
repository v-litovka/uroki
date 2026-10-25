import { Pack, Topic } from '../../../../core/models';
import { DM } from './legacy';
import { ExItem, copyHTML, exMode } from './modes';

const { PAGES } = DM;
const pages = Object.keys(PAGES['wb'])
  .map(Number)
  .sort((a, b) => a - b);

const pageTopic = (p: number): Topic<ExItem> => {
  const pg = PAGES['wb'][p];
  const items: ExItem[] = pg.ex.map((e) => ({ ...e, id: `p${p}:e${e.n}`, page: p }));
  return {
    id: `p${p}`,
    title: `Стр. ${p} · ${pg.lesson}`,
    desc: `${items.length} упр.`,
    color: '#D9480F',
    ruleHtml: pg.rule,
    items,
    modes: items.map(exMode),
    solutionHtml: pg.ex.map((e) => `<div class="task sol"><p class="kick">Упражнение ${e.n}</p><div class="tt">${e.text}</div>${copyHTML(e)}</div>`).join(''),
  };
};

/** «Домашка» — 3 класс, печатная тетрадь по математике (стр. 28–57). Страница = тема, упражнение = режим. Решения — у взрослого (PIN). */
export const PACK: Pack = {
  id: 'math3-domashka',
  grade: 3,
  subject: 'math',
  title: 'Домашка',
  desc: 'Решаем домашнее задание по шагам. Ответы не подсказываю — только наводящие вопросы. Думать будешь ты!',
  color: '#D9480F',
  mascot: 'pets',
  bookIds: ['math3-wb'],
  legacyStorageKey: 'domashka3',
  topics: pages.map(pageTopic) as Topic[],
};
