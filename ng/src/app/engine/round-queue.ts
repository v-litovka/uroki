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
  /** всего ошибок за раунд (для своих правил звёзд) */
  mistakes = 0;

  /**
   * weight — вес элемента (коробки знаний: «не знаю» 6, «почти» 3, «знаю» 1):
   * выбор без повторов, но незнакомое попадает чаще.
   */
  constructor(items: readonly T[], size = 10, random = true, weight?: (item: T) => number) {
    const src = !random ? items.slice() : weight ? RoundQueue.weighted(items, size, weight) : shuffle(items);
    this.q = src.slice(0, size).map((item) => ({ item, again: false }));
    this.total = this.q.length;
  }

  static weighted<T>(items: readonly T[], n: number, weight: (item: T) => number): T[] {
    const pool = items.map((item) => ({ item, w: Math.max(0.0001, weight(item)) }));
    const out: T[] = [];
    while (out.length < n && pool.length) {
      let r = Math.random() * pool.reduce((s, x) => s + x.w, 0);
      const k = pool.findIndex((x) => (r -= x.w) <= 0);
      out.push(pool.splice(k < 0 ? pool.length - 1 : k, 1)[0].item);
    }
    return out;
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
  complete(missed: boolean, mistakes = missed ? 1 : 0) {
    const cur = this.q[this.i];
    if (!cur) return;
    this.mistakes += mistakes;
    if (!missed && !cur.again) this.firstTry++;
    if (missed && !cur.again) this.q.push({ item: cur.item, again: true });
    this.i++;
  }
}
