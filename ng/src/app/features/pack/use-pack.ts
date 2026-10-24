import { Signal, computed, effect, inject, signal } from '@angular/core';
import { Pack } from '../../core/models';
import { PackLoader } from '../../core/catalog/pack-loader.service';
import { CatalogService } from '../../core/catalog/catalog.service';
import { LangService } from '../../core/i18n/lang.service';

/** Загрузить пак по параметрам маршрута /:grade/:subject/:slug (вызывать в конструкторе компонента). */
export function usePack(grade: Signal<string>, subject: Signal<string>, slug: Signal<string>) {
  const loader = inject(PackLoader);
  const catalog = inject(CatalogService);
  const lang = inject(LangService);
  const pack = signal<Pack | null>(null);
  const error = signal<string | null>(null);
  const entry = computed(() => catalog.findPack(grade(), subject(), slug()));
  effect(() => {
    const e = entry();
    // компонент может переиспользоваться при переходе между играми — старый пак сбрасываем сразу
    pack.set(null);
    error.set(null);
    if (!e) {
      error.set('Такой игры нет');
      return;
    }
    loader.load(e.packId).then(
      (p) => {
        if (entry()?.packId === p.id) {
          lang.lang.set(p.lang ?? 'ru');
          pack.set(p);
        }
      },
      (err) => error.set(String(err)),
    );
  });
  return { pack, error, entry };
}
