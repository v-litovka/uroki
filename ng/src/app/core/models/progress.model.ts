/** Прогресс ребёнка по одному паку. */
export interface PackProgress {
  stars: number;
  /** 'topicId:modeId' → 1, если режим пройден хотя бы раз */
  done: Record<string, 1>;
}

/** Одна попытка (одно задание в раунде) — основа «трудных мест». */
export interface Attempt {
  /** время, мс */
  t: number;
  pack: string;
  topic: string;
  mode: string;
  item: string;
  /** человекочитаемо: слово / пример */
  label?: string;
  /** верно с первого раза */
  ok: boolean;
}

/** Пройденный раунд — история для кабинетов и статус заданий. */
export interface RoundRecord {
  t: number;
  pack: string;
  topic: string;
  mode: string;
  /** подписи на момент прохождения */
  packTitle: string;
  topicTitle: string;
  modeTitle: string;
  firstTry: number;
  total: number;
  stars: number;
}
