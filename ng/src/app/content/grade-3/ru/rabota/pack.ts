import { Pack } from '../../../../core/models';
import { RULE_ADJ, RULE_DW, RULE_NOUN, RULE_SOFT, RULE_TSA, WHY_SOFT } from './data';
import { ADJ, DW, NOUN, SOFT, TSA } from './items';
import { dictModes, sentenceModes, softModes } from './modes';

/** «Работа над ошибками» — 3 класс, русский. Темы — по ошибкам из диктантов. */
export const PACK: Pack = {
  id: 'ru3-rabota',
  grade: 3,
  subject: 'ru',
  title: 'Работа над ошибками',
  desc: 'Русский язык: то, в чём были ошибки в диктанте. В каждой теме — от выбора ответа до письма с клавиатуры, и всегда вопрос «почему?».',
  color: '#E2557A',
  mascot: 'pets',
  bookIds: ['ru3-antipova-1'],
  legacyStorageKey: 'rabota-oshibki-v1',
  topics: [
    { id: 'tsa', title: '-тся и -ться', color: '#7A4FE0', desc: 'Учится или учиться? Задай вопрос!', ruleHtml: RULE_TSA, items: TSA, modes: sentenceModes(true) },
    { id: 'adj', title: 'Окончания: какой? какая?', color: '#1C7ED6', desc: 'Стройный тополь, сладкая морковь', ruleHtml: RULE_ADJ, items: ADJ, modes: sentenceModes() },
    { id: 'noun', title: 'Окончания: лиса, лисы, лисе', color: '#2B8A3E', desc: 'Задай вопрос — найди окончание', ruleHtml: RULE_NOUN, items: NOUN, modes: sentenceModes() },
    { id: 'soft', title: 'Разделительный ь', color: '#E2557A', desc: 'Соловьи, воробьёв, птичьи', ruleHtml: RULE_SOFT, items: SOFT, modes: softModes(WHY_SOFT) },
    { id: 'dw', title: 'Слова из диктанта', color: '#D9480F', desc: 'аккуратно, муравей, беседа, путешественник…', ruleHtml: RULE_DW, items: DW, modes: dictModes() },
  ],
};
