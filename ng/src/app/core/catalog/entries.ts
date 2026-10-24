import { CatalogEntry, ExtraLink } from '../models';

/**
 * Все плитки хаба. Порядок = порядок в хабе.
 * kind 'legacy' — готовый HTML из public/legacy/<path>;
 * kind 'pack'   — пак из content/registry.ts (играется Angular-движком).
 */
export const ENTRIES: CatalogEntry[] = [
  // ---------- 3 класс ----------
  { kind: 'pack', id: 'ulica', grade: 3, subject: 'math', title: 'Улица Домиков', desc: 'Таблица умножения и деления', color: '#E8452C', packId: 'math3-ulica' },
  { kind: 'pack', id: 'stih', grade: 3, subject: 'math', title: 'Стишок умножения', desc: 'Таблица умножения в стихах с Вирой и Венди', color: '#13A3A0', packId: 'math3-stih' },
  { kind: 'legacy', id: 'zadachi', grade: 3, subject: 'math', title: 'Город Задач', desc: 'Схемы к задачам, К1 · К = ОК', color: '#2D6CDF', path: 'zadachi/', storageKey: 'gorod-zadach-v1', bookIds: ['math3-muravyova'] },
  { kind: 'legacy', id: 'domashka', grade: 3, subject: 'math', title: 'Домашка', desc: 'Решаем ДЗ по шагам: тетрадь и учебник', color: '#D9480F', path: 'domashka/', storageKey: 'domashka3', bookIds: ['math3-wb', 'math3-muravyova'] },
  { kind: 'legacy', id: 'english', grade: 3, subject: 'en', title: 'English с Вирой и Венди', desc: 'Magic Box 3: слова, he/she/they, грамматика', color: '#E2557A', path: 'english/', storageKey: 'english3', bookIds: ['en3-magicbox'] },
  { kind: 'pack', id: 'slova', grade: 3, subject: 'ru', title: 'Город Слов', desc: 'Правила, члены предложения, лексика', color: '#7A4FE0', packId: 'ru3-slova', bookIds: ['ru3-antipova-1'] },
  { kind: 'pack', id: 'rabota', grade: 3, subject: 'ru', title: 'Работа над ошибками', desc: '-тся и -ться, окончания, разделительный ь, слова из диктанта', color: '#E2557A', packId: 'ru3-rabota' },
  { kind: 'pack', id: 'slovy', grade: 3, subject: 'by', title: 'Горад Слоў', desc: 'Правілы, члены сказа, лексіка', color: '#3D8B3A', packId: 'by3-slovy', bookIds: ['by3-svirydzenka-1'] },
  // ---------- 4 класс ----------
  { kind: 'legacy', id: 'zadachi4', grade: 4, subject: 'math', title: 'Город Задач 4', desc: 'Движение, цена, доли, уравнения, единицы', color: '#2D6CDF', path: '4klass/zadachi/', storageKey: 'gorod-zadach4-v1', bookIds: ['math4-muravyova'] },
  { kind: 'legacy', id: 'slova4', grade: 4, subject: 'ru', title: 'Город Слов 4', desc: 'Падежи, склонения, окончания', color: '#7A4FE0', path: '4klass/slova/', storageKey: 'gorod-slov4-v1', bookIds: ['ru4-antipova'] },
  { kind: 'legacy', id: 'slovy4', grade: 4, subject: 'by', title: 'Горад Слоў 4', desc: 'Склоны, скланенні, канчаткі, коскі', color: '#3D8B3A', path: '4klass/slovy/', storageKey: 'horad-slou4-v1', bookIds: ['by4-svirydzenka-1'] },
];

export const EXTRA_LINKS: ExtraLink[] = [{ grade: 3, title: 'Шпаргалка по схемам', path: 'zadachi/shpargalka.html' }];

/** Старая HTML-версия пака (на всякий случай, пока Angular-версия проверяется). */
export const LEGACY_FALLBACK: Record<string, string> = { 'ru3-rabota': 'rabota/', 'math3-stih': 'stih/', 'ru3-slova': 'slova/', 'by3-slovy': 'slovy/', 'math3-ulica': 'ulica/' };
