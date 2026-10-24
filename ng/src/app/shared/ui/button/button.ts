import { Component, input } from '@angular/core';

/**
 * Кнопка/ссылка-кнопка в фирменном стиле.
 *   <button app-btn>Проверить</button>
 *   <a app-btn variant="ghost" routerLink="..">К теме</a>
 */
@Component({
  selector: 'button[app-btn], a[app-btn]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  host: { '[class.ghost]': "variant() === 'ghost'", '[class.lg]': "size() === 'lg'" },
})
export class Button {
  readonly variant = input<'primary' | 'ghost'>('primary');
  readonly size = input<'md' | 'lg'>('md');
}
