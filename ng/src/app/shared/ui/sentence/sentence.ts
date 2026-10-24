import { Component, computed, input } from '@angular/core';
import { Seg } from '../../../core/models';

/** Предложение из кусков: обычный текст, выделенное слово (vb), пропуск (gp), подсветка (hl). */
@Component({
  selector: 'app-sentence',
  templateUrl: './sentence.html',
  styleUrl: './sentence.scss',
})
export class Sentence {
  readonly segs = input.required<Seg[]>();
  protected readonly parts = computed(() => this.segs().map((s) => (typeof s === 'string' ? { t: s, cls: '' } : s)));
}
