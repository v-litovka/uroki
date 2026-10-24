import { Component, ElementRef, afterRenderEffect, inject, input, linkedSignal, output, signal, viewChild } from '@angular/core';
import { matches } from '../../utils/text';
import { Button } from '../button/button';
import { LangService } from '../../../core/i18n/lang.service';

export interface Typed {
  value: string;
  correct: boolean;
}

/** Поле ввода + «Проверить». Сравнение без регистра, ё = е. */
@Component({
  selector: 'app-answer-input',
  imports: [Button],
  templateUrl: './answer-input.html',
  styleUrl: './answer-input.scss',
})
export class AnswerInput {
  readonly answer = input.required<string | string[]>();
  readonly placeholder = input('');
  /** цифровая клавиатура на планшете */
  readonly numeric = input(false);
  readonly typed = output<Typed>();
  protected readonly i18n = inject(LangService);
  /** сброс при новом ответе (новый шаг) */
  protected readonly done = linkedSignal({ source: this.answer, computation: () => false });
  protected readonly shake = signal(false);
  private inp = viewChild.required<ElementRef<HTMLInputElement>>('inp');

  constructor() {
    // после отрисовки: очистить поле и поставить фокус, когда пришёл новый ответ
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

  protected check(e: Event) {
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
