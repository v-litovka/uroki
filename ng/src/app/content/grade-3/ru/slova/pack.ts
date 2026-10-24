import { Pack, Topic } from '../../../../core/models';
import { ITEMS, RULES, STREETS } from './data';
import { MODES_BY_STREET, playMode } from './modes';

/** Короткое правило темы — правила всех типов заданий этой улицы. */
const ruleHtml = (street: string) => {
  const types = [...new Set(ITEMS.filter((x) => x.street === street).map((x) => (x.type === 'err' ? 'err' : x.type)))];
  return types
    .map((t) => RULES[t])
    .filter(Boolean)
    .map((r) => `<p><b>${r.title}.</b> ${r.text}</p>`)
    .join('');
};

const streetTopics: Topic[] = STREETS.map((st) => ({
  id: st.id,
  title: st.name,
  desc: st.desc,
  color: st.c,
  ruleHtml: ruleHtml(st.id),
  items: ITEMS.filter((x) => x.street === st.id),
  modes: MODES_BY_STREET[st.id] ?? playMode(st.desc),
}));

/** «Город Слов» — 3 класс, русский (Антипова и др., ч. 1). Улицы = темы учебника. */
export const PACK: Pack = {
  id: 'ru3-slova',
  grade: 3,
  subject: 'ru',
  title: 'Город Слов',
  desc: 'Улицы — это темы учебника. Ошибёшься — откроется правило, а потом решишь сама. Задания, которые знаешь, попадаются реже.',
  color: '#7A4FE0',
  mascot: 'pets',
  bookIds: ['ru3-antipova-1'],
  legacyStorageKey: 'gorod-slov-v1',
  leitner: true,
  topics: [
    ...streetTopics,
    {
      id: 'mix',
      title: '⭐ Занятие: всё вперемешку',
      desc: 'Задания со всех улиц, чаще — то, что ещё не знаешь.',
      color: '#26224F',
      ruleHtml: '<p>Задания со всех улиц вперемешку. Ошибёшься — прочитай правило и реши ещё раз.</p>',
      items: ITEMS,
      roundSize: 20,
      modes: playMode('Все улицы вперемешку, лёгкий уровень'),
    },
  ],
};
