import { Component, input } from '@angular/core';
import { Cat } from '../cat/cat';
import { Mascot } from '../../../core/models';

/** Плашка «верно / подумай ещё» с кошкой (3 класс) или значком (4 класс). */
@Component({
  selector: 'app-feedback',
  imports: [Cat],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
  host: { role: 'status', '[class.bad]': '!ok()' },
})
export class Feedback {
  readonly ok = input(true);
  readonly text = input('');
  readonly mascot = input<Mascot>('cats');
  /** какая кошка — выбирается случайно при создании */
  protected readonly who: 'vira' | 'wendy' = Math.random() < 0.5 ? 'vira' : 'wendy';
}
