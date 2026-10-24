import { Pack, Topic } from '../../../../core/models';
import { ITEMS, RULES, STREETS } from './data';
import { MODES_BY_STREET, playMode } from './modes';

/** Кароткае правіла тэмы — правілы ўсіх тыпаў заданняў гэтай вуліцы. */
const ruleHtml = (street: string) =>
  [...new Set(ITEMS.filter((x) => x.street === street).map((x) => x.type))]
    .map((t) => RULES[t])
    .filter(Boolean)
    .map((r) => `<p><b>${r.title}.</b> ${r.text}</p>`)
    .join('');

const streetTopics: Topic[] = STREETS.map((st) => ({
  id: st.id,
  title: st.name,
  desc: st.desc,
  color: st.c,
  ruleHtml: ruleHtml(st.id),
  items: ITEMS.filter((x) => x.street === st.id),
  modes: MODES_BY_STREET[st.id] ?? playMode(st.desc),
}));

/** «Горад Слоў» — 3 класс, белорусский (Свірыдзенка, ч. 1). Улицы = темы учебника. Интерфейс — по-белорусски (lang: 'by'). */
export const PACK: Pack = {
  id: 'by3-slovy',
  grade: 3,
  subject: 'by',
  lang: 'by',
  title: 'Горад Слоў',
  desc: 'Вуліцы — гэта тэмы падручніка. Памылішся — адкрыецца правіла, а потым вырашыш сама. Заданні, якія ведаеш, трапляюцца радзей.',
  color: '#3D8B3A',
  mascot: 'pets',
  bookIds: ['by3-svirydzenka-1'],
  legacyStorageKey: 'horad-slou-v1',
  leitner: true,
  topics: [
    ...streetTopics,
    {
      id: 'mix',
      title: '⭐ Занятак: усё ўперамешку',
      desc: 'Заданні з усіх вуліц, часцей — тое, што яшчэ не ведаеш.',
      color: '#26224F',
      ruleHtml: '<p>Заданні з усіх вуліц уперамешку. Памылішся — прачытай правіла і рашы яшчэ раз.</p>',
      items: ITEMS,
      roundSize: 20,
      modes: playMode('Усе вуліцы ўперамешку, лёгкі ўзровень'),
    },
  ],
};
