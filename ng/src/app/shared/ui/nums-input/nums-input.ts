import { Component, ElementRef, afterRenderEffect, inject, input, linkedSignal, output, viewChildren } from '@angular/core';
import { Button } from '../button/button';
import { LangService } from '../../../core/i18n/lang.service';

/** Несколько окошек для чисел подряд («__ см + __ см») и одна кнопка «Проверить». Проверку делает родитель. */
@Component({
  selector: 'app-nums-input',
  imports: [Button],
  templateUrl: './nums-input.html',
  styleUrl: './nums-input.scss',
})
export class NumsInput {
  readonly fields = input.required<{ u: string }[]>();
  readonly pre = input('');
  /** верно — заблокировать */
  readonly solved = input(false);
  readonly submitted = output<number[] | null>();
  protected readonly i18n = inject(LangService);
  private inps = viewChildren<ElementRef<HTMLInputElement>>('inp');
  protected readonly done = linkedSignal({ source: this.fields, computation: () => false });

  constructor() {
    afterRenderEffect(() => {
      this.fields();
      const els = this.inps();
      els.forEach((e) => (e.nativeElement.value = ''));
      setTimeout(() => {
        try {
          els[0]?.nativeElement.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
      }, 60);
    });
  }

  protected check(e: Event) {
    e.preventDefault();
    const v = this.inps().map((x) => parseInt(x.nativeElement.value, 10));
    this.submitted.emit(v.some((x) => isNaN(x)) ? null : v);
  }
}
