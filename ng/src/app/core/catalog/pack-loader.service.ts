import { Injectable, inject } from '@angular/core';
import { Pack } from '../models';
import { PACKS } from '../../content/registry';
import { MY_WORDS_PACK_ID, buildMyWordsPack } from '../../content/custom/my-words';
import { WordsService } from '../words/words.service';
import { FamilyService } from '../family/family.service';

/** Ленивая загрузка паков (каждый пак — отдельный JS-чанк) + паки, собранные из данных ребёнка. */
@Injectable({ providedIn: 'root' })
export class PackLoader {
  private cache = new Map<string, Promise<Pack>>();
  private words = inject(WordsService);
  private family = inject(FamilyService);

  load(id: string): Promise<Pack> {
    if (id === MY_WORDS_PACK_ID) return Promise.resolve(buildMyWordsPack(this.words.current(), this.family.current().grade));
    const loader = PACKS[id];
    if (!loader) return Promise.reject(new Error('Нет пака ' + id));
    if (!this.cache.has(id)) this.cache.set(id, loader());
    return this.cache.get(id)!;
  }

  has(id: string) {
    return id in PACKS || id === MY_WORDS_PACK_ID;
  }
}
