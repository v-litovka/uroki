import { Pack } from '../../../../core/models';
import { CityGame, cityTopics } from '../../../common/city-legacy';
import { DICT_LEVELS_RU, RU4 } from '../../../common/city-texts';
import { G } from './legacy';

/** «Город Слов 4» — 4 класс, русский (Антипова): падежи, склонения, окончания, словарные слова. */
export const PACK: Pack = {
  id: 'ru4-slova',
  grade: 4,
  subject: 'ru',
  title: 'Город Слов 4',
  desc: 'Улицы — темы учебника: падежи, склонения, окончания. Ошибёшься — откроется правило, потом то же задание заново.',
  color: '#7A4FE0',
  mascot: 'pets',
  bookIds: ['ru4-antipova'],
  legacyStorageKey: 'gorod-slov4-v1',
  leitner: true,
  topics: cityTopics(G as unknown as CityGame, RU4, {
    levels: { dict: DICT_LEVELS_RU },
    play: 'Играть',
    mix: { title: '⭐ Занятие: всё вперемешку', desc: 'Задания со всех улиц, чаще — то, что ещё не получается.', rule: '<p>Задания со всех улиц вперемешку. Ошибёшься — прочитай правило и реши ещё раз.</p>', mode: 'Все улицы вперемешку' },
  }),
};
