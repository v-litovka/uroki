import { Component, computed, input } from '@angular/core';
import { Cat } from '../cat/cat';
import { Mascot } from '../../../core/models';

/** Плашка «верно / подумай ещё» с кошкой (3 класс) или без (4 класс). */
@Component({
  selector: 'app-feedback',
  imports: [Cat],
  template: `
    <div class="fb" [class.bad]="!ok()" role="status">
      @if (mascot() === 'cats') {
        <app-cat [who]="who()" [mood]="ok() ? 'happy' : who() === 'vira' ? 'sad' : 'sly'" [size]="who() === 'vira' ? 52 : 46" />
      } @else {
        <span class="ico">{{ ok() ? '✅' : '🤔' }}</span>
      }
      <p>{{ text() }}</p>
    </div>
  `,
  styles: `
    .fb{display:flex;align-items:center;gap:12px;border:3px solid var(--good);background:#eaf8ef;border-radius:16px;padding:8px 12px}
    .fb.bad{border-color:var(--trap);background:#fff1ec}
    p{margin:0;font-weight:800}
    .ico{font-size:34px}
  `,
})
export class Feedback {
  readonly ok = input(true);
  readonly text = input('');
  readonly mascot = input<Mascot>('cats');
  /** какая кошка — меняется случайно при создании */
  readonly who = computed<'vira' | 'wendy'>(() => (Math.random() < 0.5 ? 'vira' : 'wendy'));
}
