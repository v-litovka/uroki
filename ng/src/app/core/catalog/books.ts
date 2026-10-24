import { Book } from '../models';

/** Учебники и тетради. Пак/игра ссылается на книгу через bookIds. */
export const BOOKS: Book[] = [
  { id: 'math3-muravyova', grade: 3, subject: 'math', kind: 'textbook', title: 'Математика 3 класс', authors: 'Муравьёва, Урбан' },
  { id: 'math3-wb', grade: 3, subject: 'math', kind: 'workbook', title: 'Математика 3 класс, печатная тетрадь' },
  { id: 'ru3-antipova-1', grade: 3, subject: 'ru', kind: 'textbook', title: 'Русский язык 3 класс, часть 1', authors: 'Антипова, Верниковская, Грабчикова' },
  { id: 'by3-svirydzenka-1', grade: 3, subject: 'by', kind: 'textbook', title: 'Беларуская мова 3 клас, частка 1', authors: 'Свірыдзенка' },
  { id: 'en3-magicbox', grade: 3, subject: 'en', kind: 'textbook', title: 'Magic Box 3', authors: 'Седунова' },
  { id: 'math4-muravyova', grade: 4, subject: 'math', kind: 'textbook', title: 'Математика 4 класс', authors: 'Муравьёва, Урбан' },
  { id: 'ru4-antipova', grade: 4, subject: 'ru', kind: 'textbook', title: 'Русский язык 4 класс', authors: 'Антипова и др.' },
  { id: 'by4-svirydzenka-1', grade: 4, subject: 'by', kind: 'textbook', title: 'Беларуская мова 4 клас, частка 1', authors: 'Свірыдзенка' },
];
