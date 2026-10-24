import { Signal, computed, effect, inject, signal } from '@angular/core';
import { CatalogEntry, Pack, PackEntry } from '../../core/models';
import { ENTRIES } from '../../core/catalog/entries';
import { PackLoader } from '../../core/catalog/pack-loader.service';

/** Плитка каталога по адресу /:grade/:subject/:slug */
export function findPackEntry(grade: string, subject: string, slug: string): PackEntry | undefined {
  return ENTRIES.find(
    (e: CatalogEntry): e is PackEntry => e.kind === 'pack' && String(e.grade) === grade && e.subject === subject && e.id === slug,
  );
}

/** Загрузить пак по параметрам маршрута (вызывать в конструкторе компонента). */
export function usePack(grade: Signal<string>, subject: Signal<string>, slug: Signal<string>) {
  const loader = inject(PackLoader);
  const pack = signal<Pack | null>(null);
  const error = signal<string | null>(null);
  const entry = computed(() => findPackEntry(grade(), subject(), slug()));
  effect(() => {
    const e = entry();
    if (!e) {
      error.set('Такой игры нет');
      return;
    }
    loader.load(e.packId).then(
      (p) => pack.set(p),
      (err) => error.set(String(err)),
    );
  });
  return { pack, error, entry };
}
