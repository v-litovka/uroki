import { Component, computed, effect, input, linkedSignal, output, signal } from '@angular/core';
import { shuffle } from '../../utils/random';
import { Option, OptionState } from '../option/option';
import { RichHtml } from '../rich-html/rich-html';

export interface Picked {
  value: string;
  correct: boolean;
}

/**
 * Сетка вариантов: неверный краснеет и блокируется, верный зеленеет и блокирует всё.
 * Состояние сбрасывается само, когда приходят новые варианты (linkedSignal).
 */
@Component({
  selector: 'app-option-grid',
  imports: [Option, RichHtml],
  templateUrl: './option-grid.html',
  styleUrl: './option-grid.scss',
})
export class OptionGrid {
  readonly options = input.required<string[]>();
  readonly answer = input.required<string>();
  /** ещё верные ответы */
  readonly accept = input<string[]>([]);
  /** grid — плитки; small — узкие плитки (окончания); list — фразы столбиком */
  readonly layout = input<'grid' | 'small' | 'list' | 'pics' | 'cards'>('grid');
  /** вариант → доверенный HTML вместо текста (схемы-картинки в Городе Задач) */
  readonly html = input<Record<string, string>>({});
  readonly doShuffle = input(true);
  /** заблокировать кнопки на N секунд, чтобы ребёнок прочитал */
  readonly lockSec = input(0);
  readonly picked = output<Picked>();

  protected readonly order = computed(() => (this.doShuffle() ? shuffle(this.options()) : this.options()));
  protected readonly state = linkedSignal<string[], Partial<Record<string, OptionState>>>({ source: this.options, computation: () => ({}) });
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

  protected pick(o: string) {
    const correct = o === this.answer() || this.accept().includes(o);
    this.state.update((s) => ({ ...s, [o]: correct ? 'right' : 'bad' }));
    if (correct) this.solved.set(true);
    this.picked.emit({ value: o, correct });
  }
}
