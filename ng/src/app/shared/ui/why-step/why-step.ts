import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { shuffle } from '../../utils/random';
import { OptionGrid, Picked } from '../option-grid/option-grid';
import { LangService } from '../../../core/i18n/lang.service';

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
  protected readonly i18n = inject(LangService);
  protected readonly options = computed(() => shuffle([this.ok(), ...this.wrong()]));
  protected readonly msg = linkedSignal({ source: this.options, computation: () => '' });

  protected onPick(p: Picked) {
    this.msg.set(p.correct ? '' : this.i18n.t('whyWrong'));
    this.answered.emit(p.correct);
  }
}
