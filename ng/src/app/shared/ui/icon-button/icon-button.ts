import { Component, input } from '@angular/core';

/** Квадратная кнопка с иконкой: <button app-icon-btn aria-label="Звук">🔊</button> */
@Component({
  selector: 'button[app-icon-btn], a[app-icon-btn]',
  template: '<ng-content />',
  styleUrl: './icon-button.scss',
  host: { '[class.muted]': 'muted()' },
})
export class IconButton {
  /** приглушённая (например, звук выключен) */
  readonly muted = input(false);
}
