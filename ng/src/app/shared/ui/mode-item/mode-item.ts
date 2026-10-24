import { Component, input } from '@angular/core';

/** Строка режима: иконка, «1. Выбери», описание, ✓ если пройден. */
@Component({
  selector: 'a[app-mode-item]',
  templateUrl: './mode-item.html',
  styleUrl: './mode-item.scss',
  host: { '[class.done]': 'done()' },
})
export class ModeItem {
  readonly icon = input('');
  readonly title = input.required<string>();
  readonly desc = input('');
  readonly done = input(false);
}
