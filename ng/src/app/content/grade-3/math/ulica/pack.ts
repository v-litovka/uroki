import { Pack, Topic } from '../../../../core/models';
import { BLOCKS } from './data';
import { CARDS, Card } from './hacks';
import { visitMode } from './modes';

const ruleHtml =
  '<p>В каждом домике живут три числа: на <b>чердаке</b> — ответ, в <b>окошках</b> — множители. ' +
  'Пустой чердак — <b>умножай</b>, пустое окошко — <b>дели</b>. Ошибёшься — покажу хитрость, а потом решишь сама по шагам.</p>';

const blockTopic = (b: (typeof BLOCKS)[number]): Topic<Card> => {
  const items = CARDS.filter((c) => c.block === b);
  return { id: `b${b.id}`, title: `${b.name} · ${b.tag}`, desc: items.map((c) => `${c.x}×${c.y}`).join(', '), color: b.color, ruleHtml, items, modes: [visitMode] };
};

/** «Улица Домиков» — 3 класс, таблица умножения и деления. Хитрости и стишок — hacks.ts / data.ts. */
export const PACK: Pack = {
  id: 'math3-ulica',
  grade: 3,
  subject: 'math',
  title: 'Улица Домиков',
  desc: 'В каждом домике живут три числа. Пустой чердак — умножай, пустое окошко — дели. Домики, которые знаешь, попадаются реже.',
  color: '#E8452C',
  mascot: 'pets',
  bookIds: ['math3-muravyova'],
  legacyStorageKey: 'ulica-domikov-v1',
  leitner: true,
  topics: [
    ...BLOCKS.map(blockTopic),
    {
      id: 'all',
      title: '⭐ Вся улица',
      desc: 'Все 36 домиков вперемешку, чаще — те, что ещё не знаешь.',
      color: '#26224F',
      ruleHtml,
      items: CARDS,
      roundSize: 20,
      modes: [visitMode],
    },
  ] as Topic[],
};
