import { Pack } from '../../../../core/models';
import { CityGame, cityTopics } from '../../../common/city-legacy';
import { BY4, DICT_LEVELS_BY } from '../../../common/city-texts';
import { G } from './legacy';

/** «Горад Слоў 4» — 4 клас, беларуская мова (Свірыдзенка): склоны, скланенні, канчаткі, коскі. Інтэрфейс — па-беларуску. */
export const PACK: Pack = {
  id: 'by4-slovy',
  grade: 4,
  subject: 'by',
  lang: 'by',
  title: 'Горад Слоў 4',
  desc: 'Вуліцы — тэмы падручніка. Памылішся — адкрыецца правіла, потым тое ж заданне яшчэ раз.',
  color: '#3D8B3A',
  mascot: 'pets',
  bookIds: ['by4-svirydzenka-1'],
  legacyStorageKey: 'horad-slou4-v1',
  leitner: true,
  topics: cityTopics(G as unknown as CityGame, BY4, {
    levels: { dict: DICT_LEVELS_BY },
    play: 'Гуляць',
    mix: { title: '⭐ Занятак: усё ўперамешку', desc: 'Заданні з усіх вуліц, часцей — тое, што яшчэ не атрымліваецца.', rule: '<p>Заданні з усіх вуліц уперамешку. Памылішся — прачытай правіла і рашы яшчэ раз.</p>', mode: 'Усе вуліцы ўперамешку' },
  }),
};
