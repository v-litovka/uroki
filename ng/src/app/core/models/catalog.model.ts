/** Класс. Расширяется добавлением числа: 1 | 2 | 3 | 4 | 5 … */
export type Grade = 3 | 4;

export type SubjectId = 'math' | 'ru' | 'by' | 'en';

export interface Subject {
  id: SubjectId;
  title: string;
  color: string;
}

/** Учебник / рабочая тетрадь. Один пак контента может ссылаться на книгу и страницы. */
export interface Book {
  id: string; // 'ru3-antipova-1'
  grade: Grade;
  subject: SubjectId;
  title: string; // 'Русский язык 3 класс, часть 1'
  authors?: string;
  kind: 'textbook' | 'workbook';
}

/**
 * Плитка в хабе. Либо legacy-игра (готовый HTML в public/legacy),
 * либо пак контента, который играется Angular-движком.
 */
interface EntryBase {
  id: string;
  grade: Grade;
  subject: SubjectId;
  title: string;
  desc: string;
  color: string;
  bookIds?: string[];
  /** скрыть из хаба (черновик) */
  hidden?: boolean;
}
export interface LegacyEntry extends EntryBase {
  kind: 'legacy';
  /** путь внутри public/legacy/ */
  path: string;
  /** ключ localStorage старой игры — чтобы показать её звёзды взрослому */
  storageKey?: string;
}
export interface PackEntry extends EntryBase {
  kind: 'pack';
  /** id пака из content/registry.ts */
  packId: string;
}
export type CatalogEntry = LegacyEntry | PackEntry;

export interface ExtraLink {
  grade: Grade;
  title: string;
  path: string;
}
