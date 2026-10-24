import { Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  template: `<div class="pbar" role="progressbar" [attr.aria-valuenow]="Math.round(value() * 100)"><i [style.width.%]="value() * 100"></i></div>`,
  styles: `.pbar{height:12px;border:2px solid var(--ink);border-radius:99px;background:var(--ghost);overflow:hidden;margin:6px 0 12px}
    .pbar i{display:block;height:100%;background:var(--good);transition:width .4s}`,
})
export class ProgressBar {
  readonly value = input(0);
  protected readonly Math = Math;
}
