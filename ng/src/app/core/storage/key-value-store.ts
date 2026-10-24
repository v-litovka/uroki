import { InjectionToken } from '@angular/core';

/**
 * Хранилище «ключ → JSON». Сейчас localStorage.
 * Для админки/синхронизации подменяется реализацией с сервером
 * (через провайдер KV_STORE в app.config.ts) — остальной код не меняется.
 */
export interface KeyValueStore {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
}

/** localStorage, обёрнутый в try/catch: в приватном режиме/превью он может бросать. */
export class LocalKeyValueStore implements KeyValueStore {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* нет места / запрещено — не падаем */
    }
  }
  remove(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

/** Память — для тестов. */
export class MemoryKeyValueStore implements KeyValueStore {
  private m = new Map<string, string>();
  get<T>(key: string, fallback: T): T {
    const v = this.m.get(key);
    return v ? (JSON.parse(v) as T) : fallback;
  }
  set(key: string, value: unknown) {
    this.m.set(key, JSON.stringify(value));
  }
  remove(key: string) {
    this.m.delete(key);
  }
}

export const KV_STORE = new InjectionToken<KeyValueStore>('KV_STORE', {
  providedIn: 'root',
  factory: () => new LocalKeyValueStore(),
});
