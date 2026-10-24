import { Component, input } from '@angular/core';

/** 🏆 Новый уровень N! */
@Component({
  selector: 'app-level-up',
  template: '🏆 <b>Новый уровень {{ level() }}!</b>',
  styleUrl: './level-up.scss',
  host: { role: 'status' },
})
export class LevelUp {
  readonly level = input.required<number>();
}
