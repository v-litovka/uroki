import { Pack } from '../core/models';

/**
 * Реестр паков контента. Новый пак = папка content/grade-N/<предмет>/<имя>/
 * с файлом pack.ts (export const PACK: Pack) + строчка здесь + плитка в core/catalog/entries.ts.
 * Пак грузится лениво — отдельным чанком.
 */
export const PACKS: Record<string, () => Promise<Pack>> = {
  'ru3-rabota': () => import('./grade-3/ru/rabota/pack').then((m) => m.PACK),
};
