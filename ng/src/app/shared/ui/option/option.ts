import { Component, input } from '@angular/core';

export type OptionState = 'idle' | 'right' | 'bad';

/**
 * Один вариант ответа.
 *   <button app-option [state]="'right'">ться</button>
 * variant 'word' — крупно по центру (слова, окончания); 'text' — фраза слева («Почему?»).
 */
@Component({
  selector: 'button[app-option]',
  template: '<ng-content />',
  styleUrl: './option.scss',
  host: {
    type: 'button',
    '[class.right]': "state() === 'right'",
    '[class.bad]': "state() === 'bad'",
    '[class.text]': "variant() === 'text'",
  },
})
export class Option {
  readonly state = input<OptionState>('idle');
  readonly variant = input<'word' | 'text'>('word');
}
