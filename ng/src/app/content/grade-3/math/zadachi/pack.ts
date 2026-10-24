import { Pack, Topic } from '../../../../core/models';
import { ZD } from './legacy';
import { TaskItem, playMode } from './modes';

const { ITEMS, RULES, STREETS } = ZD;
const items = ITEMS as TaskItem[];
const ruleHtml = (street: string) =>
  [...new Set(items.filter((x) => x.street === street).map((x) => x.type))]
    .map((t) => RULES[t])
    .map((r) => `<p><b>${r.title}.</b> ${r.text}</p>`)
    .join('');

/** «Город Задач» — 3 класс, Муравьёва (ч. 1). Улицы = типы задач. Главное — выбрать схему, как в учебнике. */
export const PACK: Pack = {
  id: 'math3-zadachi',
  grade: 3,
  subject: 'math',
  title: 'Город Задач',
  desc: 'Улицы — это типы задач из учебника. Главное — выбрать правильную схему, потом действие, потом посчитать. Ошибёшься — откроется правило.',
  color: '#2D6CDF',
  mascot: 'pets',
  bookIds: ['math3-muravyova'],
  legacyStorageKey: 'gorod-zadach-v1',
  leitner: true,
  topics: [
    ...STREETS.map(
      (st): Topic => ({ id: st.id, title: st.name, desc: st.desc, color: st.c, ruleHtml: ruleHtml(st.id), items: items.filter((x) => x.street === st.id), modes: playMode(st.desc) as Topic['modes'] }),
    ),
    {
      id: 'mix',
      title: '⭐ Занятие: всё вперемешку',
      desc: 'Задачи со всех улиц, чаще — те, что ещё не получаются.',
      color: '#26224F',
      ruleHtml: '<p>Прочитай задачу два раза. Что известно? Что надо найти? Если сравнивают двоих — у кого больше? Нарисуй схему, выбери действие, посчитай.</p>',
      items,
      roundSize: 10,
      modes: playMode('Все улицы вперемешку') as Topic['modes'],
    },
  ],
};
