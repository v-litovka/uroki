import { Component, inject, input } from '@angular/core';
import { LangService } from '../../../core/i18n/lang.service';

/** 🏆 Новый уровень N! */
@Component({
  selector: 'app-level-up',
  template: "🏆 <b>{{ i18n.t('newLevel', { n: level() }) }}</b>",
  styleUrl: './level-up.scss',
  host: { role: 'status' },
})
export class LevelUp {
  readonly level = input.required<number>();
  protected readonly i18n = inject(LangService);
}
