import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';
import { ProfileService } from '../profile/profile.service';
import { Attempt, PackProgress } from '../models';
import { levelOf } from './levels';

const ATTEMPTS_CAP = 2000;

export interface PackProgressHandle {
  stars: Signal<number>;
  level: Signal<number>;
  done: Signal<Record<string, 1>>;
  isDone(topic: string, mode: string): boolean;
  /** +звёзды; вернёт true, если открылся новый уровень */
  addStars(n: number): boolean;
  markDone(topic: string, mode: string): void;
}

/**
 * Прогресс по пакам + журнал попыток.
 * Ключи: ng:<profile>:pack:<packId>, ng:<profile>:attempts.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private kv = inject(KV_STORE);
  private profile = inject(ProfileService);
  private handles = new Map<string, PackProgressHandle>();

  private key(...parts: string[]) {
    return ['ng', this.profile.current().id, ...parts].join(':');
  }

  /** legacyKey — ключ старой HTML-версии игры: прогресс переносится один раз. */
  pack(packId: string, legacyKey?: string): PackProgressHandle {
    const k = this.key('pack', packId);
    const cached = this.handles.get(k);
    if (cached) return cached;

    let initial = this.kv.get<PackProgress | null>(k, null);
    if (!initial) {
      const old = legacyKey ? this.kv.get<Partial<PackProgress> | null>(legacyKey, null) : null;
      initial = { stars: old?.stars ?? 0, done: { ...(old?.done ?? {}) } };
      this.kv.set(k, initial);
    }
    const state = signal<PackProgress>(initial);
    const save = () => this.kv.set(k, state());

    const h: PackProgressHandle = {
      stars: computed(() => state().stars),
      level: computed(() => levelOf(state().stars)),
      done: computed(() => state().done),
      isDone: (t, m) => !!state().done[`${t}:${m}`],
      addStars(n) {
        const before = levelOf(state().stars);
        state.update((s) => ({ ...s, stars: s.stars + n }));
        save();
        return levelOf(state().stars) > before;
      },
      markDone(t, m) {
        state.update((s) => ({ ...s, done: { ...s.done, [`${t}:${m}`]: 1 } }));
        save();
      },
    };
    this.handles.set(k, h);
    return h;
  }

  logAttempt(a: Omit<Attempt, 't'>) {
    const k = this.key('attempts');
    const list = this.kv.get<Attempt[]>(k, []);
    list.push({ ...a, t: Date.now() });
    this.kv.set(k, list.slice(-ATTEMPTS_CAP));
  }

  /** Для будущих отчётов: попытки (последние сверху). */
  attempts(): Attempt[] {
    return this.kv.get<Attempt[]>(this.key('attempts'), []).slice().reverse();
  }
}
