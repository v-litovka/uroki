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
  { kind: 'pack', id: 'zadachi', grade: 3, subject: 'math', title: 'Город Задач', desc: 'Схемы к задачам, К1 · К = ОК', color: '#2D6CDF', packId: 'math3-zadachi', bookIds: ['math3-muravyova'] },
  { kind: 'pack', id: 'domashka', grade: 3, subject: 'math', title: 'Домашка', desc: 'Решаем ДЗ по шагам: тетрадь по математике', color: '#D9480F', packId: 'math3-domashka', bookIds: ['math3-wb', 'math3-muravyova'] },
  { kind: 'pack', id: 'english', grade: 3, subject: 'en', title: 'English с Вирой и Венди', desc: 'Magic Box 3: слова, he/she/they, грамматика', color: '#E2557A', packId: 'en3-english', bookIds: ['en3-magicbox'] },
  { kind: 'pack', id: 'slova', grade: 3, subject: 'ru', title: 'Город Слов', desc: 'Правила, члены предложения, лексика', color: '#7A4FE0', packId: 'ru3-slova', bookIds: ['ru3-antipova-1'] },
  { kind: 'pack', id: 'rabota', grade: 3, subject: 'ru', title: 'Работа над ошибками', desc: '-тся и -ться, окончания, разделительный ь, слова из диктанта', color: '#E2557A', packId: 'ru3-rabota' },
  { kind: 'pack', id: 'slovy', grade: 3, subject: 'by', title: 'Горад Слоў', desc: 'Правілы, члены сказа, лексіка', color: '#3D8B3A', packId: 'by3-slovy', bookIds: ['by3-svirydzenka-1'] },
  // ---------- 4 класс ----------
  { kind: 'pack', id: 'zadachi4', grade: 4, subject: 'math', title: 'Город Задач 4', desc: 'Движение, цена, доли, уравнения, единицы', color: '#2D6CDF', packId: 'math4-zadachi', bookIds: ['math4-muravyova'] },
  { kind: 'pack', id: 'slova4', grade: 4, subject: 'ru', title: 'Город Слов 4', desc: 'Падежи, склонения, окончания', color: '#7A4FE0', packId: 'ru4-slova', bookIds: ['ru4-antipova'] },
  { kind: 'pack', id: 'slovy4', grade: 4, subject: 'by', title: 'Горад Слоў 4', desc: 'Склоны, скланенні, канчаткі, коскі', color: '#3D8B3A', packId: 'by4-slovy', bookIds: ['by4-svirydzenka-1'] },
];

export const EXTRA_LINKS: ExtraLink[] = [{ grade: 3, title: 'Шпаргалка по схемам', path: 'zadachi/shpargalka.html' }];

/** Старая HTML-версия пака (на всякий случай, пока Angular-версия проверяется). */
export const LEGACY_FALLBACK: Record<string, string> = { 'ru3-rabota': 'rabota/', 'math3-stih': 'stih/', 'ru3-slova': 'slova/', 'by3-slovy': 'slovy/', 'math3-ulica': 'ulica/', 'en3-english': 'english/', 'math3-zadachi': 'zadachi/', 'math3-domashka': 'domashka/', 'math4-zadachi': '4klass/zadachi/', 'ru4-slova': '4klass/slova/', 'by4-slovy': '4klass/slovy/' };

/** паки с решениями для взрослого (вкладка «Решения» в кабинете взрослого) */
export const SOLUTION_PACKS = ['math3-domashka'];
