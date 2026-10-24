import { Pack, Topic } from '../../../../core/models';
import { UNITS } from './data';
import { PRON_RULE, R_BE, R_CAN, R_HV } from './gen';
import { levelModes, slots } from './modes';

const grammar = (id: string, title: string, desc: string, color: string, ruleHtml: string): Topic => ({
  id,
  title,
  desc,
  color,
  ruleHtml,
  items: slots(id),
  modes: levelModes(id) as Topic['modes'],
});

/** «English с Вирой и Венди» — 3 класс, Magic Box 3. Темы: местоимения (главное!), грамматика, слова по юнитам. */
export const PACK: Pack = {
  id: 'en3-english',
  grade: 3,
  subject: 'en',
  title: 'English с Вирой и Венди',
  desc: 'Учебник Magic Box 3. Выбери тему и уровень. Ошибёшься — подскажу, ошибёшься ещё раз — покажу правило.',
  color: '#E2557A',
  mascot: 'pets',
  bookIds: ['en3-magicbox'],
  legacyStorageKey: 'english3',
  topics: [
    grammar('pron', '★ Главное! He, she, they…', 'Местоимения: мой папа → he', '#E2557A', PRON_RULE),
    grammar('be', '★ am / is / are', 'Глагол to be: не…, вопросы', '#2D6CDF', R_BE),
    grammar('have', '★ have got / has got', 'У меня есть… / нет…, вопросы', '#13A3A0', R_HV),
    grammar('can', "★ can / can't", 'Могу, не могу, вопросы', '#FF8A1C', R_CAN),
    ...UNITS.map((u) =>
      grammar(u.id, `Unit ${u.n} · ${u.en}`, u.ru, u.c, `<p>${u.pic} Слова юнита: ${u.words.slice(0, 8).map((w) => w[0]).join(', ')}…</p>`),
    ),
  ],
};
