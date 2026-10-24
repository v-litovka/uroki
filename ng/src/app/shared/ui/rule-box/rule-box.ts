import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Рамка с коротким правилом. HTML — статичный, из кода контента (не из пользовательского ввода). */
@Component({
  selector: 'app-rule-box',
  template: '<div class="box" [innerHTML]="safe()"></div>',
  styleUrl: './rule-box.scss',
  host: { '[style.--accent]': 'color()' },
})
export class RuleBox {
  readonly html = input.required<string>();
  readonly color = input<string | null>(null);
  private san = inject(DomSanitizer);
  readonly safe = computed(() => this.san.bypassSecurityTrustHtml(this.html()));
}
