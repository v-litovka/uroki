import { Component, input } from '@angular/core';

/** Плашка с крупной цифрой: ⭐ 57 / «звёзд всего». */
@Component({
  selector: 'app-stat-card',
  template: '<b>{{ value() }}</b><span>{{ label() }}</span>',
  styleUrl: './stat-card.scss',
})
export class StatCard {
  readonly value = input.required<string | number>();
  readonly label = input('');
}
