import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Button } from '../button/button';
import { LangService } from '../../../core/i18n/lang.service';

/** Отметить несколько вариантов (фишки) и нажать «Проверить». options — доверенный HTML. */
@Component({
  selector: 'app-multi-pick',
  imports: [Button],
  templateUrl: './multi-pick.html',
  styleUrl: './multi-pick.scss',
})
export class MultiPick {
  readonly options = input.required<string[]>();
  readonly solved = input(false);
  readonly submitted = output<number[]>();
  protected readonly i18n = inject(LangService);
  private san = inject(DomSanitizer);
  protected readonly html = computed(() => this.options().map((o) => this.san.bypassSecurityTrustHtml(o)));
  protected readonly on = linkedSignal<string[], Set<number>>({ source: this.options, computation: () => new Set() });

  protected toggle(i: number) {
    this.on.update((s) => {
      const n = new Set(s);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  }
  protected check() {
    this.submitted.emit([...this.on()].sort((a, b) => a - b));
  }
}
