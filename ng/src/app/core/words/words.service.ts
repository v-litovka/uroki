import { Injectable, computed, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';
import { FamilyService } from '../family/family.service';
import { CustomWord } from '../models';

const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Словарные слова, которые добавил взрослый. У каждого ребёнка свой список.
 * Формат быстрого ввода: заглавные буквы = трудные («кОрова», «пАльтО»), через «—» проверочное («горы — гора»).
 */
@Injectable({ providedIn: 'root' })
export class WordsService {
  private kv = inject(KV_STORE);
  private family = inject(FamilyService);
  private version = signal(0);

  private key(childId: string) {
    return `ng:${childId}:words`;
  }

  list(childId: string): CustomWord[] {
    this.version();
    return this.kv.get<CustomWord[]>(this.key(childId), []);
  }

  /** слова текущего ребёнка (реактивно) */
  readonly current = computed(() => this.list(this.family.current().id));

  add(childId: string, w: Omit<CustomWord, 'id' | 'addedAt'>) {
    const word = w.word.trim().toLowerCase();
    if (!word || !w.tricky.length) return;
    const list = this.list(childId).filter((x) => x.word !== word);
    list.push({ ...w, word, id: uid(), addedAt: Date.now() });
    this.kv.set(this.key(childId), list);
    this.version.update((v) => v + 1);
  }

  remove(childId: string, id: string) {
    this.kv.set(this.key(childId), this.list(childId).filter((x) => x.id !== id));
    this.version.update((v) => v + 1);
  }

  /** «кОрова — коровы» → { word: 'корова', tricky: [1], check: 'коровы' }; null, если нет заглавных */
  static parse(line: string): Omit<CustomWord, 'id' | 'addedAt'> | null {
    const [raw, check] = line.split(/\s+[—–-]\s+/);
    const w = (raw ?? '').trim();
    if (!w || !/^[а-яёА-ЯЁ-]+$/.test(w)) return null;
    const tricky = [...w].flatMap((ch, i) => (ch !== ch.toLowerCase() ? [i] : []));
    if (!tricky.length) return null;
    return { word: w.toLowerCase(), tricky, check: check?.trim() || undefined };
  }
}
