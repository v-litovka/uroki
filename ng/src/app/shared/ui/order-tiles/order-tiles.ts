import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { shuffle } from '../../utils/random';

/**
 * «Собери по порядку»: плитки перемешаны, нужно нажимать в правильной последовательности.
 * Верная плитка переезжает в собранный список, неверная трясётся.
 */
@Component({
  selector: 'app-order-tiles',
  templateUrl: './order-tiles.html',
  styleUrl: './order-tiles.scss',
})
export class OrderTiles {
  /** элементы в правильном порядке */
  readonly items = input.required<string[]>();
  /** ошибка: pos — сколько уже собрано */
  readonly wrong = output<{ pos: number }>();
  readonly done = output<void>();

  protected readonly order = computed(() => shuffle(this.items().map((t, k) => ({ t, k }))));
  protected readonly pos = linkedSignal({ source: this.items, computation: () => 0 });
  protected readonly shake = signal<number | null>(null);
  protected readonly built = computed(() => this.items().slice(0, this.pos()));

  protected tap(k: number) {
    if (k === this.pos()) {
      this.pos.update((p) => p + 1);
      if (this.pos() === this.items().length) this.done.emit();
    } else {
      this.shake.set(k);
      setTimeout(() => this.shake.set(null), 500);
      this.wrong.emit({ pos: this.pos() });
    }
  }
}
