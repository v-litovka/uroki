import { Injectable, computed, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';
import { Grade, Profile } from '../models';

const KEY = 'ng-profiles';
const DEFAULT: Profile = { id: 'me', name: 'Я', role: 'child' };

/**
 * Текущий профиль. Сейчас всегда один ребёнок «me».
 * Админка добавит: список детей, выбор профиля, родительский вход (PIN),
 * привязку к аккаунту. Все ключи прогресса уже содержат profileId.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private kv = inject(KV_STORE);
  private state = signal(this.kv.get<{ list: Profile[]; current: string; grade?: Grade }>(KEY, { list: [DEFAULT], current: 'me' }));

  readonly profiles = computed(() => this.state().list);
  readonly current = computed(() => this.state().list.find((p) => p.id === this.state().current) ?? DEFAULT);
  /** последний открытый класс в хабе */
  readonly lastGrade = computed<Grade>(() => this.state().grade ?? 3);

  setLastGrade(g: Grade) {
    if (this.state().grade === g) return;
    this.state.update((s) => ({ ...s, grade: g }));
    this.kv.set(KEY, this.state());
  }
}
