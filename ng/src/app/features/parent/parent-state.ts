import { Injectable, computed, inject, signal } from '@angular/core';
import { FamilyService } from '../../core/family/family.service';

/** Чьи данные смотрит взрослый в кабинете (по умолчанию — текущий игрок). */
@Injectable({ providedIn: 'root' })
export class ParentState {
  private family = inject(FamilyService);
  private picked = signal<string | null>(null);
  readonly childId = computed(() => {
    const id = this.picked();
    return id && this.family.children().some((c) => c.id === id) ? id : this.family.current().id;
  });
  readonly child = computed(() => this.family.children().find((c) => c.id === this.childId())!);
  pick(id: string) {
    this.picked.set(id);
  }
}
