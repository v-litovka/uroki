import { Component, ElementRef, afterRenderEffect, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { matches } from '../../utils/text';

export interface Typed {
  value: string;
  correct: boolean;
}

/** Поле ввода + «Проверить». Сравнение без регистра, ё = е. */
@Component({
  selector: 'app-answer-input',
  template: `
    <form class="inrow" (submit)="check($event)">
      <input
        #inp
        class="inp"
        [class.right]="done()"
        [class.bad]="shake()"
        [disabled]="done()"
        [placeholder]="placeholder()"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="ответ"
      />
      <button class="btn" [disabled]="done()">Проверить</button>
    </form>
  `,
})
export class AnswerInput {
  readonly answer = input.required<string | string[]>();
  readonly placeholder = input('');
  readonly typed = output<Typed>();
  /** сброс при новом ответе (новый шаг) */
  protected readonly done = linkedSignal({ source: this.answer, computation: () => false });
  protected readonly shake = signal(false);
  private inp = viewChild.required<ElementRef<HTMLInputElement>>('inp');

  constructor() {
    // после отрисовки: очистить поле и поставить фокус, когда пришёл новый ответ (новый шаг)
    afterRenderEffect(() => {
      this.answer();
      const el = this.inp().nativeElement;
      el.value = '';
      setTimeout(() => {
        try {
          el.focus({ preventScroll: true });
        } catch {
          /* ignore */
        }
      }, 60);
    });
  }

  check(e: Event) {
    e.preventDefault();
    const el = this.inp().nativeElement;
    const v = el.value;
    if (!v.trim()) return;
    const correct = matches(v, this.answer());
    if (correct) this.done.set(true);
    else {
      this.shake.set(true);
      setTimeout(() => this.shake.set(false), 500);
      el.select();
    }
    this.typed.emit({ value: v, correct });
  }
}
