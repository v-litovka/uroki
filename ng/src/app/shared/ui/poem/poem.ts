import { Component, computed, input } from '@angular/core';
import { PoemLine } from '../../../core/models';

/** Стих построчно: строки-примеры цветом, подсветка, «?» на месте спрятанного, зелёным — вписанное. */
@Component({
  selector: 'app-poem',
  templateUrl: './poem.html',
  styleUrl: './poem.scss',
})
export class Poem {
  readonly lines = input.required<PoemLine[]>();
  protected readonly view = computed(() =>
    this.lines().map((l) => {
      const mark = l.gap ?? l.good;
      const k = mark ? l.t.indexOf(mark) : -1;
      return k < 0
        ? { ...l, pre: l.t, mid: '', post: '', kind: '' }
        : { ...l, pre: l.t.slice(0, k), mid: l.gap ? '?' : mark!, post: l.t.slice(k + mark!.length), kind: l.gap ? 'gap' : 'good' };
    }),
  );
}
