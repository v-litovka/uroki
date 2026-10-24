import { Component, computed, input, linkedSignal, output } from '@angular/core';
import { shuffle } from '../../utils/random';

/** Шаг «Почему?»: одна верная причина и 1–2 неверные. */
@Component({
  selector: 'app-why-step-view',
  template: `
    <div class="why">
      <b>Почему?</b>
      <div class="opts list">
        @for (o of opts(); track o.t) {
          <button type="button" class="opt" [class.right]="st()[o.t] === 'right'" [class.bad]="st()[o.t] === 'bad'"
            [disabled]="solved() || st()[o.t] === 'bad'" (click)="pick(o)">{{ o.t }}</button>
        }
      </div>
      <p class="msg">{{ msg() }}</p>
    </div>
  `,
  styles: `.why{display:grid;gap:10px}.why>b{font-size:20px}.msg{min-height:1.2em;color:var(--trap);font-weight:700;margin:0}`,
})
export class WhyStepView {
  readonly ok = input.required<string>();
  readonly wrong = input.required<string[]>();
  readonly answered = output<boolean>();
  protected readonly opts = computed(() => shuffle([{ t: this.ok(), ok: true }, ...this.wrong().map((t) => ({ t, ok: false }))]));
  protected readonly st = linkedSignal<unknown, Record<string, 'right' | 'bad'>>({ source: this.opts, computation: () => ({}) });
  protected readonly solved = linkedSignal({ source: this.opts, computation: () => false });
  protected readonly msg = linkedSignal({ source: this.opts, computation: () => '' });

  pick(o: { t: string; ok: boolean }) {
    this.st.update((s) => ({ ...s, [o.t]: o.ok ? 'right' : 'bad' }));
    if (o.ok) this.solved.set(true);
    else this.msg.set('Нет, это не так. Подумай ещё.');
    this.answered.emit(o.ok);
  }
}
