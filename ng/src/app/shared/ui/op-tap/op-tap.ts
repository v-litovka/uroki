import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { OpPart } from '../../../core/models';

/**
 * Порядок действий: выражение, знаки действий — кнопки. Нажимаешь по порядку — над знаком появляется номер.
 * Неверный знак трясётся (wrong: pos — сколько уже отмечено), все отмечены — done.
 */
@Component({
  selector: 'app-op-tap',
  templateUrl: './op-tap.html',
  styleUrl: './op-tap.scss',
})
export class OpTap {
  readonly parts = input.required<OpPart[]>();
  readonly order = input.required<number[]>();
  readonly wrong = output<{ pos: number }>();
  readonly done = output<void>();
  private san = inject(DomSanitizer);
  protected readonly view = computed(() =>
    this.parts().map((p) => (p.t === 'txt' ? { t: 'txt' as const, html: this.san.bypassSecurityTrustHtml(p.html) as SafeHtml } : p)),
  );
  /** знак → номер по порядку */
  protected readonly marks = linkedSignal<OpPart[], Record<number, number>>({ source: this.parts, computation: () => ({}) });
  protected readonly shake = signal<number | null>(null);

  protected tap(i: number) {
    const m = this.marks();
    if (m[i]) return;
    const pos = Object.keys(m).length;
    if (this.order()[pos] === i) {
      this.marks.set({ ...m, [i]: pos + 1 });
      if (pos + 1 === this.order().length) this.done.emit();
    } else {
      this.shake.set(i);
      setTimeout(() => this.shake.set(null), 500);
      this.wrong.emit({ pos });
    }
  }
}
