import { Pack, Topic } from '../../../../core/models';
import { ALL_FACTS, BLOCKS, Block, catLine } from './items';
import { examMode, gapMode, orderMode, pairMode, readMode } from './modes';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const poemHtml = (b: Block) => '<p>' + b.L.map((l) => (l.x ? `<b>${esc(l.t)}</b>` : esc(l.t))).join('<br>') + '</p>';

const blockTopic = (b: Block): Topic => ({
  id: b.id,
  title: b.name,
  desc: b.F.map((f) => `${f.x}×${f.y}`).join(', '),
  color: '#13A3A0',
  ruleHtml: poemHtml(b),
  items: b.F,
  roundSize: 20,
  // «Найди пару» — только примеры, у которых есть строчка про кошек
  modes: [readMode(b), gapMode, { ...pairMode, items: b.F.filter((f) => !!catLine(f)) }, orderMode(b)] as Topic['modes'],
});

/** «Стишок умножения» — 3 класс, математика. Стих — в data.ts. */
export const PACK: Pack = {
  id: 'math3-stih',
  grade: 3,
  subject: 'math',
  title: 'Стишок умножения',
  desc: 'Таблица умножения в стихах с Вирой и Венди. Выбери кусочек: сначала прочитай, потом допиши ответы, найди пары и собери стишок.',
  color: '#13A3A0',
  mascot: 'pets',
  bookIds: ['math3-muravyova'],
  legacyStorageKey: 'stih-umnozh-v1',
  topics: [
    ...BLOCKS.map(blockTopic),
    {
      id: 'exam',
      title: '⭐ Экзамен',
      desc: 'Вся таблица вперемешку. Ошибёшься — подскажет стишок.',
      color: '#D9480F',
      ruleHtml: '<p>12 примеров из всей таблицы. Ошибёшься — появится кусочек стишка с подсказкой.</p>',
      items: ALL_FACTS,
      modes: [examMode],
    },
  ],
};
