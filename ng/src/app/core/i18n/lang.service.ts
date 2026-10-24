import { Injectable, signal } from '@angular/core';
import { Lang, STRINGS, StringKey } from './strings';

/** Язык интерфейса текущей игры. Страницы пака выставляют его из Pack.lang; хаб и кабинеты — по-русски. */
@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>('ru');

  /** t('firstTry', { ok: 3, n: 10 }) */
  t(key: StringKey, params: Record<string, string | number> = {}): string {
    let s: string = STRINGS[this.lang()][key] ?? STRINGS.ru[key];
    for (const [k, v] of Object.entries(params)) s = s.replace(`{${k}}`, String(v));
    return s;
  }
}
