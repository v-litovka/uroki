/**
 * Каталог игр. Источник правды для хаба.
 *
 * status:
 *  - 'legacy'  — игра пока живёт как самодостаточный HTML в public/legacy/<path>/index.html;
 *  - 'angular' — игра переписана на Angular и открывается по маршруту route.
 *
 * Когда переносишь игру на Angular: добавь route, поменяй status на 'angular',
 * а legacy-копию не удаляй, пока новая версия не проверена ребёнком.
 */
export type Grade = 3 | 4;
export type Subject = 'math' | 'ru' | 'by' | 'en';

export interface Game {
  id: string;
  grade: Grade;
  subject: Subject;
  title: string;
  desc: string;
  color: string;
  status: 'legacy' | 'angular';
  /** путь внутри public/legacy/ (для status='legacy') */
  legacy?: string;
  /** маршрут Angular (для status='angular') */
  route?: string;
  /** ключ localStorage, где игра хранит прогресс (для справки и будущей миграции) */
  storageKey?: string;
}

export const SUBJECTS: Record<Subject, string> = {
  math: 'Математика',
  ru: 'Русский',
  by: 'Беларуская',
  en: 'Английский',
};

export const GAMES: Game[] = [
  // ---------- 3 класс ----------
  { id: 'ulica', grade: 3, subject: 'math', title: 'Улица Домиков', desc: 'Таблица умножения и деления', color: '#E8452C', status: 'legacy', legacy: 'ulica/' },
  { id: 'stih', grade: 3, subject: 'math', title: 'Стишок умножения', desc: 'Таблица умножения в стихах с Вирой и Венди', color: '#13A3A0', status: 'legacy', legacy: 'stih/' },
  { id: 'zadachi', grade: 3, subject: 'math', title: 'Город Задач', desc: 'Схемы к задачам, К1 · К = ОК', color: '#2D6CDF', status: 'legacy', legacy: 'zadachi/' },
  { id: 'domashka', grade: 3, subject: 'math', title: 'Домашка', desc: 'Решаем ДЗ по шагам: тетрадь и учебник', color: '#D9480F', status: 'legacy', legacy: 'domashka/' },
  { id: 'english', grade: 3, subject: 'en', title: 'English с Вирой и Венди', desc: 'Magic Box 3: слова, he/she/they, грамматика', color: '#E2557A', status: 'legacy', legacy: 'english/' },
  { id: 'slova', grade: 3, subject: 'ru', title: 'Город Слов', desc: 'Правила, члены предложения, лексика', color: '#7A4FE0', status: 'legacy', legacy: 'slova/' },
  { id: 'rabota', grade: 3, subject: 'ru', title: 'Работа над ошибками', desc: '-тся и -ться, окончания, разделительный ь, слова из диктанта', color: '#E2557A', status: 'legacy', legacy: 'rabota/', storageKey: 'rabota-oshibki-v1' },
  { id: 'slovy', grade: 3, subject: 'by', title: 'Горад Слоў', desc: 'Правілы, члены сказа, лексіка', color: '#3D8B3A', status: 'legacy', legacy: 'slovy/' },
  // ---------- 4 класс ----------
  { id: 'zadachi4', grade: 4, subject: 'math', title: 'Город Задач 4', desc: 'Движение, цена, доли, уравнения, единицы', color: '#2D6CDF', status: 'legacy', legacy: '4klass/zadachi/' },
  { id: 'slova4', grade: 4, subject: 'ru', title: 'Город Слов 4', desc: 'Падежи, склонения, окончания', color: '#7A4FE0', status: 'legacy', legacy: '4klass/slova/' },
  { id: 'slovy4', grade: 4, subject: 'by', title: 'Горад Слоў 4', desc: 'Склоны, скланенні, канчаткі, коскі', color: '#3D8B3A', status: 'legacy', legacy: '4klass/slovy/' },
];

export const EXTRA_LINKS: { grade: Grade; title: string; legacy: string }[] = [
  { grade: 3, title: 'Шпаргалка по схемам', legacy: 'zadachi/shpargalka.html' },
];
