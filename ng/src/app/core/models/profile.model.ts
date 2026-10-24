import { Grade } from './catalog.model';

/**
 * Профиль. Сейчас один локальный профиль ребёнка.
 * Задел под админку: несколько детей, родитель, синхронизация.
 */
export type Role = 'child' | 'parent';

export interface Profile {
  id: string;
  name: string;
  role: Role;
  grade?: Grade;
  /** родители, которые видят этого ребёнка (будущее) */
  parentIds?: string[];
}
