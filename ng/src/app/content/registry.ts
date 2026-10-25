import { Pack } from '../core/models';

/**
 * Реестр паков контента. Новый пак = папка content/grade-N/<предмет>/<имя>/
 * с файлом pack.ts (export const PACK: Pack) + строчка здесь + плитка в core/catalog/entries.ts.
 * Пак грузится лениво — отдельным чанком.
 */
export const PACKS: Record<string, () => Promise<Pack>> = {
  'ru3-rabota': () => import('./grade-3/ru/rabota/pack').then((m) => m.PACK),
  'ru3-slova': () => import('./grade-3/ru/slova/pack').then((m) => m.PACK),
  'by3-slovy': () => import('./grade-3/by/slovy/pack').then((m) => m.PACK),
  'math3-ulica': () => import('./grade-3/math/ulica/pack').then((m) => m.PACK),
  'en3-english': () => import('./grade-3/en/english/pack').then((m) => m.PACK),
  'math3-zadachi': () => import('./grade-3/math/zadachi/pack').then((m) => m.PACK),
  'math3-domashka': () => import('./grade-3/math/domashka/pack').then((m) => m.PACK),
  'ru4-slova': () => import('./grade-4/ru/slova4/pack').then((m) => m.PACK),
  'by4-slovy': () => import('./grade-4/by/slovy4/pack').then((m) => m.PACK),
  'math4-zadachi': () => import('./grade-4/math/zadachi4/pack').then((m) => m.PACK),
  'math3-stih': () => import('./grade-3/math/stih/pack').then((m) => m.PACK),
};
