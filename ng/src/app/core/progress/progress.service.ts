import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';
import { FamilyService } from '../family/family.service';
import { Attempt, PackProgress, RoundRecord } from '../models';
import { levelOf } from './levels';

const ATTEMPTS_CAP = 3000;
const ROUNDS_CAP = 1000;

export interface PackProgressHandle {
  stars: Signal<number>;
  level: Signal<number>;
  done: Signal<Record<string, 1>>;
  isDone(topic: string, mode: string): boolean;
  /** +звёзды; вернёт true, если открылся новый уровень */
  addStars(n: number): boolean;
  markDone(topic: string, mode: string): void;
  /** коробка знаний элемента: 0 / 1 / 2 */
  box(itemId: string): number;
  /** верно с первого раза → коробка +1, ошибка → 0 */
  setBox(itemId: string, ok: boolean): number;
}

/**
 * Прогресс ребёнка: звёзды по пакам, журнал попыток, история раундов.
 * Ключи: ng:<childId>:pack:<packId>, ng:<childId>:attempts, ng:<childId>:rounds.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private kv = inject(KV_STORE);
  private family = inject(FamilyService);
  private handles = new Map<string, PackProgressHandle>();
  /** растёт при каждой записи — чтобы списки в кабинетах обновлялись */
  readonly version = signal(0);

  private key(childId: string, ...parts: string[]) {
    return ['ng', childId, ...parts].join(':');
  }

  /**
   * Прогресс по паку для ребёнка (по умолчанию — текущего).
   * legacyKey — ключ старой HTML-версии: звёзды переносятся один раз и только первому ребёнку ('me').
   */
  pack(packId: string, legacyKey?: string, childId = this.family.current().id): PackProgressHandle {
    const k = this.key(childId, 'pack', packId);
    const cached = this.handles.get(k);
    if (cached) return cached;

    let initial = this.kv.get<PackProgress | null>(k, null);
    if (!initial) {
      const old = legacyKey && childId === 'me' ? this.kv.get<Partial<PackProgress> | null>(legacyKey, null) : null;
      const box = Object.fromEntries(Object.entries(old?.box ?? {}).filter(([, v]) => typeof v === 'number'));
      // «решено» из старой Домашки: 'wb30-1' → тема p30, режим e1
      const done = Object.fromEntries(Object.entries(old?.done ?? {}).map(([key, v]) => [key.replace(/^wb(\d+)-(\d+)$/, 'p$1:e$2'), v])) as Record<string, 1>;
      initial = { stars: old?.stars ?? 0, done, box };
      this.kv.set(k, initial);
    }
    const state = signal<PackProgress>(initial);
    const save = () => {
      this.kv.set(k, state());
      this.version.update((v) => v + 1);
    };

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
      box: (id) => state().box?.[id] ?? 0,
      setBox(id, ok) {
        const b = ok ? Math.min(2, (state().box?.[id] ?? 0) + 1) : 0;
        state.update((s) => ({ ...s, box: { ...(s.box ?? {}), [id]: b } }));
        save();
        return b;
      },
    };
    this.handles.set(k, h);
    return h;
  }

  logAttempt(a: Omit<Attempt, 't'>, childId = this.family.current().id) {
    const k = this.key(childId, 'attempts');
    const list = this.kv.get<Attempt[]>(k, []);
    list.push({ ...a, t: Date.now() });
    this.kv.set(k, list.slice(-ATTEMPTS_CAP));
    this.version.update((v) => v + 1);
  }

  logRound(r: Omit<RoundRecord, 't'>, childId = this.family.current().id) {
    const k = this.key(childId, 'rounds');
    const list = this.kv.get<RoundRecord[]>(k, []);
    list.push({ ...r, t: Date.now() });
    this.kv.set(k, list.slice(-ROUNDS_CAP));
    this.version.update((v) => v + 1);
  }

  /** попытки ребёнка (последние сверху) */
  attempts(childId = this.family.current().id): Attempt[] {
    this.version();
    return this.kv.get<Attempt[]>(this.key(childId, 'attempts'), []).slice().reverse();
  }

  /** пройденные раунды (последние сверху) */
  rounds(childId = this.family.current().id): RoundRecord[] {
    this.version();
    return this.kv.get<RoundRecord[]>(this.key(childId, 'rounds'), []).slice().reverse();
  }

  /** «Трудные места»: где чаще всего ошибка с первого раза. */
  hardItems(childId: string, limit = 10) {
    const m = new Map<string, { label: string; pack: string; wrong: number; total: number }>();
    for (const a of this.attempts(childId)) {
      const key = `${a.pack}|${a.item}`;
      const e = m.get(key) ?? { label: a.label ?? a.item, pack: a.pack, wrong: 0, total: 0 };
      e.total++;
      if (!a.ok) e.wrong++;
      m.set(key, e);
    }
    return [...m.values()].filter((e) => e.wrong > 0).sort((x, y) => y.wrong - x.wrong || y.total - x.total).slice(0, limit);
  }

  /** все звёзды ребёнка по пакам нового движка */
  totalStars(childId: string, packIds: string[]) {
    this.version();
    return packIds.reduce((sum, id) => sum + (this.kv.get<PackProgress | null>(this.key(childId, 'pack', id), null)?.stars ?? 0), 0);
  }
}
