import { Component, input, linkedSignal, output, effect } from '@angular/core';
import { Button } from '../button/button';

/**
 * Кнопка-подтверждение, которая включается через lockSec секунд
 * (полоска заполняется — ребёнок видит, что надо дочитать).
 */
@Component({
  selector: 'app-confirm-button',
  imports: [Button],
  templateUrl: './confirm-button.html',
  styleUrl: './confirm-button.scss',
})
export class ConfirmButton {
  readonly label = input.required<string>();
  readonly lockSec = input(0);
  readonly confirmed = output<void>();
  /** в автотестах (window.__E2E_FAST__) кнопки не ждут */
  private readonly fast = !!(globalThis as unknown as { __E2E_FAST__?: boolean }).__E2E_FAST__;
  protected readonly locked = linkedSignal({ source: this.lockSec, computation: (s) => s > 0 && !this.fast });

  constructor() {
    effect(() => {
      const s = this.fast ? 0 : this.lockSec();
      if (s > 0) setTimeout(() => this.locked.set(false), s * 1000);
    });
  }
}
