import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CatMood, viraSvg, wendySvg } from './cat-svg';

/** <app-cat who="vira" mood="happy" [size]="52" /> — ТОЛЬКО 3 класс */
@Component({
  selector: 'app-cat',
  template: '<span class="svg" [innerHTML]="svg()"></span>',
  styleUrl: './cat.scss',
})
export class Cat {
  readonly who = input<'vira' | 'wendy'>('vira');
  readonly mood = input<CatMood>('happy');
  readonly size = input(60);
  private san = inject(DomSanitizer);
  // SVG — наш статичный код, поэтому доверяем.
  readonly svg = computed(() =>
    this.san.bypassSecurityTrustHtml((this.who() === 'vira' ? viraSvg : wendySvg)(this.mood(), this.size())),
  );
}
