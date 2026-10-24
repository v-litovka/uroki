import { Injectable, computed, inject } from '@angular/core';
import { CatalogEntry, PackEntry } from '../models';
import { ENTRIES } from './entries';
import { FamilyService } from '../family/family.service';
import { WordsService } from '../words/words.service';
import { MY_WORDS_PACK_ID } from '../../content/custom/my-words';

/** Каталог = статичные плитки + плитки, которые зависят от ребёнка («Мои слова»). */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private family = inject(FamilyService);
  private words = inject(WordsService);

  readonly all = computed<CatalogEntry[]>(() => {
    const n = this.words.current().length;
    const child = this.family.current();
    const mine: CatalogEntry[] = n
      ? [{ kind: 'pack', id: 'moi-slova', grade: child.grade, subject: 'ru', title: 'Мои словарные слова', desc: `${n} ${n === 1 ? 'слово' : n < 5 ? 'слова' : 'слов'} от взрослого`, color: '#0CA678', packId: MY_WORDS_PACK_ID }]
      : [];
    return [...mine, ...ENTRIES];
  });

  /** плитки для хаба текущего ребёнка (без скрытых взрослым) */
  readonly visible = computed(() => {
    const hidden = new Set(this.family.current().settings.hiddenGames);
    return this.all().filter((e) => !e.hidden && !hidden.has(e.id));
  });

  /** все Angular-паки (для заданий и статистики) */
  readonly packs = computed(() => this.all().filter((e): e is PackEntry => e.kind === 'pack'));

  findPack(grade: string, subject: string, slug: string): PackEntry | undefined {
    return this.packs().find((e) => String(e.grade) === grade && e.subject === subject && e.id === slug);
  }
}
