import { shuffle } from '../shared/utils/random';

/**
 * Очередь раунда (чистая логика, без Angular — легко тестировать).
 * Берёт N случайных элементов; ошибочный элемент один раз повторяется в конце.
 * «С первого раза» считаются только элементы, решённые без ошибок при первом показе.
 */
export class RoundQueue<T> {
  private q: { item: T; again: boolean }[];
  private i = 0;
  readonly total: number;
  firstTry = 0;

  constructor(items: readonly T[], size = 10, random = true) {
    const src = random ? shuffle(items) : items.slice();
    this.q = src.slice(0, size).map((item) => ({ item, again: false }));
    this.total = this.q.length;
  }

  get done() {
    return this.i >= this.q.length;
  }
  get current() {
    return this.q[this.i];
  }
  get index() {
    return this.i;
  }
  get length() {
    return this.q.length;
  }

  /** закрыть текущий элемент: missed — была ли ошибка */
  complete(missed: boolean) {
    const cur = this.q[this.i];
    if (!cur) return;
    if (!missed && !cur.again) this.firstTry++;
    if (missed && !cur.again) this.q.push({ item: cur.item, again: true });
    this.i++;
  }
}
