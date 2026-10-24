import { Component, computed, effect, inject, input, linkedSignal, output } from '@angular/core';
import { Exercise, Mascot, Prompt, Step } from '../core/models';
import { AnswerInput, Feedback, OptionGrid, Picked, Typed, WhyStepView } from '../shared/ui';
import { PromptView } from './prompt-view';
import { SfxService } from '../core/audio/sfx.service';
import { diffLetters } from '../shared/utils/text';
import { pick } from '../shared/utils/random';

export interface ExerciseResult {
  /** была ли хоть одна ошибка */
  missed: boolean;
}

const DEFAULT_PHRASES: Record<Mascot, { ok: string[]; bad: string[] }> = {
  cats: {
    ok: ['Вира от радости покаталась по полу! 🐾', 'Венди гордо подняла хвост!', 'Мур-р! Правильно!', 'Умница! 😺'],
    bad: ['Ой! Вира легла на ответ… Попробуй ещё 🙀', 'Венди смотрит с подозрением 🤨', 'Почти! Подумай ещё.'],
  },
  none: { ok: ['Верно!', 'Отлично!', 'Так держать!'], bad: ['Почти! Подумай ещё.', 'Не совсем. Попробуй ещё раз.'] },
};

/**
 * Проигрывает одно упражнение: сцена + шаги по очереди.
 * Новый тип шага = новый @case здесь + тип в content.model.ts.
 */
@Component({
  selector: 'app-exercise-player',
  imports: [PromptView, OptionGrid, AnswerInput, WhyStepView, Feedback],
  template: `
    <div class="card">
      <app-prompt-view [prompt]="scene()" />

      @if (step(); as st) {
          @switch (st.kind) {
            @case ('choice') {
              <app-option-grid [options]="st.options" [answer]="st.answer" [layout]="st.layout ?? 'grid'"
                [doShuffle]="st.shuffle !== false" [lockSec]="st.lockSec ?? 0" (picked)="onPick($event)" />
            }
            @case ('input') {
              <app-answer-input [answer]="st.answer" [placeholder]="st.placeholder ?? ''" (typed)="onType($event)" />
            }
            @case ('why') {
              @if (praise()) { <app-feedback [ok]="true" [text]="praise()!" [mascot]="mascot()" /> }
              <app-why-step-view [ok]="st.ok" [wrong]="st.wrong" (answered)="onWhy($event)" />
            }
            @case ('memorize') {
              <button type="button" class="btn" (click)="memorized()">{{ st.button }}</button>
            }
          }
      }

      @if (fb(); as f) {
        <app-feedback [ok]="f.ok" [text]="f.text" [mascot]="mascot()" />
      }
      @if (diff(); as d) {
        <p class="diff">@for (c of d; track $index) {@if (c.bad) {<b>{{ c.ch }}</b>} @else {{{ c.ch }}}}</p>
      }
    </div>
  `,
  styles: `.diff{font-family:var(--display);font-size:34px;text-align:center;margin:0}.diff b{color:var(--trap);text-decoration:underline}`,
})
export class ExercisePlayer {
  readonly exercise = input.required<Exercise>();
  readonly mascot = input<Mascot>('cats');
  readonly phrases = input<{ ok: string[]; bad: string[] } | undefined>(undefined);
  readonly finished = output<ExerciseResult>();

  private sfx = inject(SfxService);
  /* Всё состояние привязано к упражнению: пришло новое — сбросилось само (linkedSignal). */
  protected readonly stepIdx = linkedSignal({ source: this.exercise, computation: () => 0 });
  private readonly overlay = linkedSignal<Exercise, Partial<Prompt>>({ source: this.exercise, computation: (ex) => ({ ...(ex.steps[0]?.prompt ?? {}) }) });
  private readonly run = computed(() => ({ ex: this.exercise(), wrong: 0, missed: false, finished: false }));
  protected readonly fb = linkedSignal<Exercise, { ok: boolean; text: string } | null>({ source: this.exercise, computation: () => null });
  protected readonly diff = linkedSignal<Exercise, { ch: string; bad: boolean }[] | null>({ source: this.exercise, computation: () => null });
  protected readonly praise = linkedSignal<Exercise, string | null>({ source: this.exercise, computation: () => null });

  protected readonly step = computed<Step | undefined>(() => this.exercise().steps[this.stepIdx()]);
  /** сцена = базовая + всё, что шаги добавили (prompt при активации, after при успехе) */
  protected readonly scene = computed<Prompt>(() => ({ ...this.exercise().prompt, ...this.overlay() }));
  private ph = computed(() => this.phrases() ?? DEFAULT_PHRASES[this.mascot()]);

  constructor() {
    // Хук для e2e-тестов (tools/e2e.mjs): виден, только если тест выставил window.__E2E__.
    effect(() => {
      const w = globalThis as unknown as { __E2E__?: boolean; __STEP__?: unknown };
      if (w.__E2E__) w.__STEP__ = this.step() ?? null;
    });
  }

  private hint(st: Step) {
    const h = st.hints ?? [];
    return h.length ? h[Math.min(this.run().wrong - 1, h.length - 1)] : pick(this.ph().bad);
  }

  /** перейти к следующему шагу; после последнего — завершить упражнение */
  private goNext() {
    const run = this.run();
    run.wrong = 0;
    const nextIdx = this.stepIdx() + 1;
    if (this.exercise().steps[nextIdx]?.kind !== 'why') this.praise.set(null);
    this.stepIdx.set(nextIdx);
    const np = this.exercise().steps[nextIdx]?.prompt;
    if (np) this.overlay.update((o) => ({ ...o, ...np }));
    if (nextIdx >= this.exercise().steps.length && !run.finished) {
      run.finished = true;
      setTimeout(() => {
        if (this.run() === run) this.finished.emit({ missed: run.missed });
      }, 1300);
    }
  }

  private right(st: Step) {
    this.sfx.play('ok');
    if (st.after) this.overlay.update((o) => ({ ...o, ...st.after }));
    this.diff.set(null);
    const next = this.exercise().steps[this.stepIdx() + 1];
    if (next?.kind === 'why') {
      this.fb.set(null);
      this.praise.set(st.okMsg ?? pick(this.ph().ok));
      this.goNext();
    } else if (!next) {
      this.fb.set({ ok: true, text: st.okMsg ?? pick(this.ph().ok) });
      this.goNext();
    } else if (st.okMsg) {
      this.fb.set({ ok: true, text: st.okMsg });
      setTimeout(() => {
        this.fb.set(null);
        this.goNext();
      }, 700);
    } else {
      this.fb.set(null);
      this.goNext();
    }
  }

  private wrong(st: Step) {
    this.sfx.play('bad');
    this.run().missed = true;
    this.run().wrong++;
    this.fb.set({ ok: false, text: this.hint(st) });
  }

  protected memorized() {
    const st = this.step();
    if (st?.after) this.overlay.update((o) => ({ ...o, ...st.after }));
    this.goNext();
  }

  protected onPick(p: Picked) {
    const st = this.step()!;
    if (p.correct) this.right(st);
    else this.wrong(st);
  }

  protected onType(t: Typed) {
    const st = this.step()!;
    if (t.correct) return this.right(st);
    this.wrong(st);
    if (st.kind === 'input') {
      const ans = Array.isArray(st.answer) ? st.answer[0] : st.answer;
      const mode = st.showDiff ?? 'never';
      if (mode === 'always' || (mode === 'second' && this.run().wrong > 1)) this.diff.set(diffLetters(t.value, ans));
    }
  }

  /** «Почему?»: ошибка здесь не считается промахом по заданию (как в legacy), только звук */
  protected onWhy(ok: boolean) {
    this.sfx.play(ok ? 'ok' : 'bad');
    if (ok) this.goNext();
  }
}
