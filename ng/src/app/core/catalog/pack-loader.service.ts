import { Injectable } from '@angular/core';
import { Pack } from '../models';
import { PACKS } from '../../content/registry';

/** Ленивая загрузка паков контента (каждый пак — отдельный JS-чанк). */
@Injectable({ providedIn: 'root' })
export class PackLoader {
  private cache = new Map<string, Promise<Pack>>();

  load(id: string): Promise<Pack> {
    const loader = PACKS[id];
    if (!loader) return Promise.reject(new Error('Нет пака ' + id));
    if (!this.cache.has(id)) this.cache.set(id, loader());
    return this.cache.get(id)!;
  }

  has(id: string) {
    return id in PACKS;
  }
}
