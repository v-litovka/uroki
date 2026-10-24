import { Component, computed, input, linkedSignal, output } from '@angular/core';

type Mark = 'u1' | 'u2' | 'u3' | 'hl';
const bare = (w: string) => w.replace(/[.,!?…:;«»"]/g, '');

/**
 * Предложение словами-кнопками: нажми на нужное слово (сказуемое, подлежащее, обращение…).
 * Верное — подчёркивается (markAs), неверное краснеет.
 */
@Component({
  selector: 'app-tap-words',
  templateUrl: './tap-words.html',
  styleUrl: './tap-words.scss',
})
export class TapWords {
  readonly words = input.required<string[]>();
  readonly accept = input.required<string[]>();
  readonly markWords = input<string[] | undefined>(undefined);
  readonly markAs = input<Mark>('u1');
  /** подчёркнутое на прошлых шагах */
  readonly marked = input<Record<string, Mark>>({});
  readonly picked = output<{ word: string; correct: boolean }>();

  protected readonly solved = linkedSignal({ source: this.words, computation: () => false });
  protected readonly bad = linkedSignal<string[], number[]>({ source: this.words, computation: () => [] });
  protected readonly view = computed(() => {
    const done = this.solved() ? new Set(this.markWords() ?? this.accept()) : new Set<string>();
    return this.words().map((w, i) => {
      const b = bare(w);
      return { w: b, i, mark: done.has(b) ? this.markAs() : this.marked()[b] ?? '', bad: this.bad().includes(i) };
    });
  });

  protected tap(i: number) {
    if (this.solved()) return;
    const w = bare(this.words()[i]);
    const correct = this.accept().includes(w);
    if (correct) this.solved.set(true);
    else this.bad.update((b) => [...b, i]);
    this.picked.emit({ word: w, correct });
  }
}
