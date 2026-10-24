import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/** Рамка с коротким правилом. HTML — статичный, из кода контента (не из пользовательского ввода). */
@Component({
  selector: 'app-rule-box',
  template: `<div class="rbox" [innerHTML]="safe()"></div>`,
  styles: `.rbox{border:3px dashed var(--accent);border-radius:16px;background:#f6f1ff;padding:10px 14px}
    :host ::ng-deep .rbox p{margin:4px 0} :host ::ng-deep .rbox b{color:var(--accent)}`,
})
export class RuleBox {
  readonly html = input.required<string>();
  private san = inject(DomSanitizer);
  readonly safe = computed(() => this.san.bypassSecurityTrustHtml(this.html()));
}
