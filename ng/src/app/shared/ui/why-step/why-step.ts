import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { shuffle } from '../../utils/random';
import { OptionGrid, Picked } from '../option-grid/option-grid';

/** Шаг «Почему?»: одна верная причина и 1–2 неверные (столбиком). */
@Component({
  selector: 'app-why-step-view',
  imports: [OptionGrid],
  templateUrl: './why-step.html',
  styleUrl: './why-step.scss',
})
export class WhyStepView {
  readonly ok = input.required<string>();
  readonly wrong = input.required<string[]>();
  readonly answered = output<boolean>();
  protected readonly options = computed(() => shuffle([this.ok(), ...this.wrong()]));
  protected readonly msg = linkedSignal({ source: this.options, computation: () => '' });

  protected onPick(p: Picked) {
    this.msg.set(p.correct ? '' : 'Нет, это не так. Подумай ещё.');
    this.answered.emit(p.correct);
  }
}
