/** Прогресс ребёнка по одному паку. */
export interface PackProgress {
  stars: number;
  /** 'topicId:modeId' → 1, если режим пройден хотя бы раз */
  done: Record<string, 1>;
}

/**
 * Одна попытка — основа будущих отчётов для родителей
 * («в каких словах ошибается», «сколько занималась на неделе»).
 */
export interface Attempt {
  /** время, мс */
  t: number;
  pack: string;
  topic: string;
  mode: string;
  item: string;
  /** верно с первого раза */
  ok: boolean;
}
