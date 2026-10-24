import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { shuffle } from '../../utils/random';

/**
 * «Собери по порядку»: плитки перемешаны, нужно нажимать в правильной последовательности.
 * Верная плитка переезжает в собранное, неверная трясётся. Одинаковые плитки (две «p» в apple) взаимозаменяемы.
 * extra — лишние плитки; inline — в строку (буквы слова / слова предложения).
 */
@Component({
  selector: 'app-order-tiles',
  templateUrl: './order-tiles.html',
  styleUrl: './order-tiles.scss',
})
export class OrderTiles {
  /** элементы в правильном порядке */
  readonly items = input.required<string[]>();
  readonly extra = input<string[]>([]);
  readonly inline = input(false);
  /** чем склеивать собранное в строку */
  readonly joiner = input(' ');
  /** ошибка: pos — сколько уже собрано */
  readonly wrong = output<{ pos: number }>();
  readonly done = output<void>();

  protected readonly order = computed(() => shuffle([...this.items(), ...this.extra()].map((t, k) => ({ t, k }))));
  protected readonly pos = linkedSignal({ source: this.items, computation: () => 0 });
  protected readonly used = linkedSignal<string[], Set<number>>({ source: this.items, computation: () => new Set() });
  protected readonly shake = signal<number | null>(null);
  protected readonly built = computed(() => this.items().slice(0, this.pos()));
  protected readonly line = computed(() => this.built().join(this.joiner()));

  protected tap(o: { t: string; k: number }) {
    if (this.used().has(o.k)) return;
    if (o.t === this.items()[this.pos()]) {
      this.used.update((s) => new Set(s).add(o.k));
      this.pos.update((p) => p + 1);
      if (this.pos() === this.items().length) this.done.emit();
    } else {
      this.shake.set(o.k);
      setTimeout(() => this.shake.set(null), 500);
      this.wrong.emit({ pos: this.pos() });
    }
  }
}
