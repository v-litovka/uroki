import { Component, computed, input } from '@angular/core';

/** Полоска прогресса 0…1. */
@Component({
  selector: 'app-progress-bar',
  template: '<i [style.width.%]="pct()"></i>',
  styleUrl: './progress-bar.scss',
  host: { role: 'progressbar', '[attr.aria-valuenow]': 'pct()', 'aria-valuemin': '0', 'aria-valuemax': '100' },
})
export class ProgressBar {
  readonly value = input(0);
  protected readonly pct = computed(() => Math.round(Math.max(0, Math.min(1, this.value())) * 100));
}
