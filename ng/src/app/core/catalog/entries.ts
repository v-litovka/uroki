import { CatalogEntry, ExtraLink } from '../models';

/**
 * Все плитки хаба. Порядок = порядок в хабе.
 * kind 'legacy' — готовый HTML из public/legacy/<path>;
 * kind 'pack'   — пак из content/registry.ts (играется Angular-движком).
 */
export const ENTRIES: CatalogEntry[] = [
  // ---------- 3 класс ----------
  { kind: 'legacy', id: 'ulica', grade: 3, subject: 'math', title: 'Улица Домиков', desc: 'Таблица умножения и деления', color: '#E8452C', path: 'ulica/' },
  { kind: 'pack', id: 'stih', grade: 3, subject: 'math', title: 'Стишок умножения', desc: 'Таблица умножения в стихах с Вирой и Венди', color: '#13A3A0', packId: 'math3-stih' },
  { kind: 'legacy', id: 'zadachi', grade: 3, subject: 'math', title: 'Город Задач', desc: 'Схемы к задачам, К1 · К = ОК', color: '#2D6CDF', path: 'zadachi/', bookIds: ['math3-muravyova'] },
  { kind: 'legacy', id: 'domashka', grade: 3, subject: 'math', title: 'Домашка', desc: 'Решаем ДЗ по шагам: тетрадь и учебник', color: '#D9480F', path: 'domashka/', bookIds: ['math3-wb', 'math3-muravyova'] },
  { kind: 'legacy', id: 'english', grade: 3, subject: 'en', title: 'English с Вирой и Венди', desc: 'Magic Box 3: слова, he/she/they, грамматика', color: '#E2557A', path: 'english/', bookIds: ['en3-magicbox'] },
  { kind: 'legacy', id: 'slova', grade: 3, subject: 'ru', title: 'Город Слов', desc: 'Правила, члены предложения, лексика', color: '#7A4FE0', path: 'slova/', bookIds: ['ru3-antipova-1'] },
  { kind: 'pack', id: 'rabota', grade: 3, subject: 'ru', title: 'Работа над ошибками', desc: '-тся и -ться, окончания, разделительный ь, слова из диктанта', color: '#E2557A', packId: 'ru3-rabota' },
  { kind: 'legacy', id: 'slovy', grade: 3, subject: 'by', title: 'Горад Слоў', desc: 'Правілы, члены сказа, лексіка', color: '#3D8B3A', path: 'slovy/', bookIds: ['by3-svirydzenka-1'] },
  // ---------- 4 класс ----------
  { kind: 'legacy', id: 'zadachi4', grade: 4, subject: 'math', title: 'Город Задач 4', desc: 'Движение, цена, доли, уравнения, единицы', color: '#2D6CDF', path: '4klass/zadachi/', bookIds: ['math4-muravyova'] },
  { kind: 'legacy', id: 'slova4', grade: 4, subject: 'ru', title: 'Город Слов 4', desc: 'Падежи, склонения, окончания', color: '#7A4FE0', path: '4klass/slova/', bookIds: ['ru4-antipova'] },
  { kind: 'legacy', id: 'slovy4', grade: 4, subject: 'by', title: 'Горад Слоў 4', desc: 'Склоны, скланенні, канчаткі, коскі', color: '#3D8B3A', path: '4klass/slovy/', bookIds: ['by4-svirydzenka-1'] },
];

export const EXTRA_LINKS: ExtraLink[] = [{ grade: 3, title: 'Шпаргалка по схемам', path: 'zadachi/shpargalka.html' }];

/** Старая HTML-версия пака (на всякий случай, пока Angular-версия проверяется). */
export const LEGACY_FALLBACK: Record<string, string> = { 'ru3-rabota': 'rabota/', 'math3-stih': 'stih/' };
