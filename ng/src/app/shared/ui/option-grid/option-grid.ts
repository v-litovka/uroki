import { Component, computed, effect, input, linkedSignal, output, signal } from '@angular/core';
import { shuffle } from '../../utils/random';

export interface Picked {
  value: string;
  correct: boolean;
}

/**
 * Сетка вариантов. Неверный вариант краснеет и блокируется, верный — зеленеет и блокирует всё.
 * Пересоздаётся на каждом шаге (track по ключу шага), поэтому состояние локальное.
 */
@Component({
  selector: 'app-option-grid',
  template: `
    <div class="opts" [class.small]="layout() === 'small'" [class.list]="layout() === 'list'">
      @for (o of order(); track o) {
        <button
          type="button"
          class="opt"
          [class.right]="state()[o] === 'right'"
          [class.bad]="state()[o] === 'bad'"
          [disabled]="locked() || solved() || state()[o] === 'bad'"
          (click)="pick(o)"
        >
          {{ o }}
        </button>
      }
    </div>
  `,
})
export class OptionGrid {
  readonly options = input.required<string[]>();
  readonly answer = input.required<string>();
  readonly layout = input<'grid' | 'small' | 'list'>('grid');
  readonly doShuffle = input(true);
  readonly lockSec = input(0);
  readonly picked = output<Picked>();

  protected readonly order = computed(() => (this.doShuffle() ? shuffle(this.options()) : this.options()));
  /** состояние сбрасывается само, когда приходят новые варианты (новый шаг) */
  protected readonly state = linkedSignal<string[], Record<string, 'right' | 'bad'>>({ source: this.options, computation: () => ({}) });
  protected readonly solved = linkedSignal({ source: this.options, computation: () => false });
  protected readonly locked = signal(false);

  constructor() {
    effect(() => {
      this.options();
      const sec = this.lockSec();
      if (sec > 0) {
        this.locked.set(true);
        setTimeout(() => this.locked.set(false), sec * 1000);
      }
    });
  }

  pick(o: string) {
    const correct = o === this.answer();
    this.state.update((s) => ({ ...s, [o]: correct ? 'right' : 'bad' }));
    if (correct) this.solved.set(true);
    this.picked.emit({ value: o, correct });
  }
}
