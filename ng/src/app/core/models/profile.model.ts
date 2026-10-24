import { Grade } from './catalog.model';

/* =====================================================================
 * Семья: дети, питомцы, родительский PIN. Всё хранится на устройстве (KV_STORE).
 * ===================================================================== */

export type Role = 'child' | 'parent';

/** Настройки ребёнка, которые задаёт взрослый («уровни»). */
export interface ChildSettings {
  /** заданий в раунде (если режим не задаёт своё число) */
  roundSize: number;
  /** id плиток хаба, которые этому ребёнку не показываем */
  hiddenGames: string[];
}

export interface Profile {
  id: string;
  name: string;
  role: Role;
  grade: Grade;
  /** эмодзи-аватар */
  avatar: string;
  /** питомцы, которые «играют» с этим ребёнком (хвалят, подсказывают) */
  petIds: string[];
  settings: ChildSettings;
}

export type PetKind = 'cat' | 'dog';
export type PetBuild = 'fat' | 'normal' | 'thin';
export type PetPattern = 'plain' | 'spots' | 'stripes';

export interface PetLook {
  /** цвет шерсти/кожи */
  body: string;
  /** цвет пятен/полосок */
  marks: string;
  pattern: PetPattern;
  build: PetBuild;
}

export interface Pet {
  id: string;
  name: string;
  kind: PetKind;
  /** для фраз: «Вира покаталась» / «Барсик покатался» */
  sex: 'f' | 'm';
  look: PetLook;
  /** если выбрана иконка вместо рисунка */
  emoji?: string;
}

/** Словарное слово от взрослого. */
export interface CustomWord {
  id: string;
  word: string;
  /** индексы трудных букв */
  tricky: number[];
  /** проверочное слово (если есть) — для шага «Почему?» */
  check?: string;
  addedAt: number;
}

/** Задание от взрослого: пройти режим N раз. */
export interface Assignment {
  id: string;
  childId: string;
  /** плитка хаба (slug в адресе) и пак */
  entryId: string;
  packId: string;
  subject: string;
  grade: Grade;
  topicId: string;
  /** '*' — любой режим темы */
  modeId: string;
  /** подпись для ребёнка: «-тся и -ться · Выбери» */
  title: string;
  rounds: number;
  createdAt: number;
  /** срок, YYYY-MM-DD */
  due?: string;
}
