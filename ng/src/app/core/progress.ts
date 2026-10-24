import { Injectable, signal, computed } from '@angular/core';

/**
 * Общая система наград (как во всех играх):
 * звёзды никогда не сгорают; уровень n открывается при lvlAt(n) звёзд:
 * 20, 50, 90, 140, 200 … (каждая ступень на 10 больше предыдущей).
 */
export const lvlAt = (n: number) => 5 * n * (n + 3);
export const levelOf = (stars: number) => {
  let n = 0;
  while (lvlAt(n + 1) <= stars) n++;
  return n;
};

/** Безопасный localStorage: в приватном режиме / превью он может бросать исключения. */
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* игнорируем */
    }
  },
};

/** Прогресс одной игры: звёзды + произвольные флаги пройденного. */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private cache = new Map<string, ReturnType<typeof this.make>>();

  /** progress.for('stih').stars() / .add(3) / .level() */
  for(gameKey: string) {
    if (!this.cache.has(gameKey)) this.cache.set(gameKey, this.make(gameKey));
    return this.cache.get(gameKey)!;
  }

  private make(gameKey: string) {
    const key = 'ng-' + gameKey;
    const state = signal(store.get(key, { stars: 0, done: {} as Record<string, number> }));
    const save = () => store.set(key, state());
    return {
      stars: computed(() => state().stars),
      level: computed(() => levelOf(state().stars)),
      done: computed(() => state().done),
      /** возвращает true, если получен новый уровень */
      add(n: number) {
        const before = levelOf(state().stars);
        state.update((s) => ({ ...s, stars: s.stars + n }));
        save();
        return levelOf(state().stars) > before;
      },
      mark(id: string) {
        state.update((s) => ({ ...s, done: { ...s.done, [id]: 1 } }));
        save();
      },
    };
  }
}
