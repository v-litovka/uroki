import { Component, computed, input } from '@angular/core';
import { Cat } from '../cat/cat';
import { Mascot } from '../../../core/models';

/** Вира + Венди рядом (для «шапок» и итогов). Для mascot 'none' ничего не рисует. */
@Component({
  selector: 'app-mascot-pair',
  imports: [Cat],
  templateUrl: './mascot-pair.html',
  styleUrl: './mascot-pair.scss',
})
export class MascotPair {
  readonly mascot = input<Mascot>('cats');
  readonly size = input<'md' | 'lg'>('md');
  protected readonly px = computed(() => (this.size() === 'lg' ? [88, 78] : [74, 64]));
}
