import { Pack } from '../../../../core/models';
import { CityGame, cityTopics } from '../../../common/city-legacy';
import { RU4 } from '../../../common/city-texts';
import { G } from './legacy';

/** «Город Задач 4» — 4 класс, математика (Муравьёва): движение, цена, доли, уравнения, единицы. */
export const PACK: Pack = {
  id: 'math4-zadachi',
  grade: 4,
  subject: 'math',
  title: 'Город Задач 4',
  desc: 'Улицы — типы задач из учебника. Выбери схему или формулу, потом действие, потом посчитай. Ошибёшься — откроется правило.',
  color: '#2D6CDF',
  mascot: 'pets',
  bookIds: ['math4-muravyova'],
  legacyStorageKey: 'gorod-zadach4-v1',
  leitner: true,
  topics: cityTopics(G as unknown as CityGame, { ...RU4, examples: 'Смотри, как решается похожая задача' }, {
    play: 'Решать',
    mix: { title: '⭐ Занятие: всё вперемешку', desc: 'Задачи со всех улиц, чаще — те, что ещё не получаются.', rule: '<p>Прочитай задачу два раза. Что известно? Что надо найти? Выбери схему или формулу, потом действие, потом посчитай.</p>', mode: 'Все улицы вперемешку' },
  }),
};
