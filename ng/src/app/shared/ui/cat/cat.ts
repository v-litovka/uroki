import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { CatMood, viraSvg, wendySvg } from './cat-svg';

/** <app-cat who="vira" mood="happy" [size]="52" /> */
@Component({
  selector: 'app-cat',
  template: `<span class="cat-wrap" [innerHTML]="svg()"></span>`,
  styles: `:host{display:inline-block;line-height:0} .cat-wrap{display:block}`,
})
export class Cat {
  readonly who = input<'vira' | 'wendy'>('vira');
  readonly mood = input<CatMood>('happy');
  readonly size = input(60);
  private san = inject(DomSanitizer);
  // SVG — наш собственный статичный код, поэтому доверяем.
  readonly svg = computed(() =>
    this.san.bypassSecurityTrustHtml((this.who() === 'vira' ? viraSvg : wendySvg)(this.mood(), this.size())),
  );
}
