import { Component, computed, effect, inject, input, linkedSignal, output } from '@angular/core';
import { Exercise, Pet, Prompt, Step } from '../../core/models';
import { AnswerInput, Card, ConfirmButton, Feedback, Hint, LetterDiff, OptionGrid, OrderTiles, Picked, Typed, WhyStepView } from '../../shared/ui';
import { PromptView } from '../prompt-view/prompt-view';
import { SfxService } from '../../core/audio/sfx.service';
import { diffLetters } from '../../shared/utils/text';
import { pick } from '../../shared/utils/random';
import { petPhrase } from '../phrases';

export interface ExerciseResult {
  /** была ли хоть одна ошибка */
  missed: boolean;
  /** сколько всего ошибок */
  mistakes: number;
}

/**
 * Проигрывает одно упражнение: сцена + шаги по очереди.
 * Новый тип шага = тип в content.model.ts + компонент в shared/ui + @case в шаблоне.
 */
@Component({
  selector: 'app-exercise-player',
  imports: [Card, PromptView, OptionGrid, AnswerInput, WhyStepView, Feedback, LetterDiff, ConfirmButton, OrderTiles, Hint],
  templateUrl: './exercise-player.html',
})
export class ExercisePlayer {
  readonly exercise = input.required<Exercise>();
  /** питомцы ребёнка, которые хвалят/подсказывают (пусто — нейтральные фразы) */
  readonly pets = input<Pet[]>([]);
  /** свои фразы пака (вместо фраз с питомцами) */
  readonly phrases = input<{ ok: string[]; bad: string[] } | undefined>(undefined);
  readonly finished = output<ExerciseResult>();

  private sfx = inject(SfxService);

  /* Всё состояние привязано к упражнению: пришло новое — сбросилось само (linkedSignal). */
  protected readonly stepIdx = linkedSignal({ source: this.exercise, computation: () => 0 });
  private readonly overlay = linkedSignal<Exercise, Partial<Prompt>>({
    source: this.exercise,
    computation: (ex) => ({ ...(ex.steps[0]?.prompt ?? {}) }),
  });
  private readonly run = computed(() => ({ ex: this.exercise(), wrong: 0, mistakes: 0, missed: false, finished: false }));
  protected readonly fb = linkedSignal<Exercise, { ok: boolean; text: string; pet: Pet | null } | null>({ source: this.exercise, computation: () => null });
  protected readonly diff = linkedSignal<Exercise, { ch: string; bad: boolean }[] | null>({ source: this.exercise, computation: () => null });
  protected readonly praise = linkedSignal<Exercise, { text: string; pet: Pet | null } | null>({ source: this.exercise, computation: () => null });

  protected readonly step = computed<Step | undefined>(() => this.exercise().steps[this.stepIdx()]);
  /** сцена = базовая + всё, что шаги добавили (prompt при активации, after при успехе) */
  protected readonly scene = computed<Prompt>(() => ({ ...this.exercise().prompt, ...this.overlay() }));
  /** какой питомец говорит (случайный из питомцев ребёнка) */
  private speaker(): Pet | null {
    const p = this.pets();
    return p.length ? pick(p) : null;
  }

  /** сообщение: своё (из шага) или фраза питомца */
  private say(ok: boolean, text?: string) {
    const pet = this.speaker();
    const own = this.phrases();
    return { ok, pet, text: text ?? (own ? pick(ok ? own.ok : own.bad) : petPhrase(pet, ok)) };
  }

  constructor() {
    // Хук для e2e-тестов (tools/e2e.mjs): виден, только если тест выставил window.__E2E__.
    effect(() => {
      const w = globalThis as unknown as { __E2E__?: boolean; __STEP__?: unknown };
      if (w.__E2E__) w.__STEP__ = this.step() ?? null;
    });
  }

  private hint(st: Step): string | undefined {
    const h = st.hints ?? [];
    return h.length ? h[Math.min(this.run().wrong - 1, h.length - 1)] : undefined;
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
        if (this.run() === run) this.finished.emit({ missed: run.missed, mistakes: run.mistakes });
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
      const m = this.say(true, st.okMsg);
      this.praise.set({ text: m.text, pet: m.pet });
      this.goNext();
    } else if (!next) {
      this.fb.set(this.say(true, st.okMsg));
      this.goNext();
    } else if (st.okMsg) {
      this.fb.set(this.say(true, st.okMsg));
      setTimeout(() => {
        this.fb.set(null);
        this.goNext();
      }, 700);
    } else {
      this.fb.set(null);
      this.goNext();
    }
  }

  private wrong(st: Step, text?: string) {
    this.sfx.play('bad');
    const run = this.run();
    run.missed = true;
    run.wrong++;
    run.mistakes++;
    this.fb.set(this.say(false, text ?? this.hint(st)));
    const wp = st.wrongPrompt;
    if (wp?.length) this.overlay.update((o) => ({ ...o, ...wp[Math.min(run.wrong - 1, wp.length - 1)] }));
  }

  protected onOrderWrong(st: Step, pos: number) {
    if (st.kind !== 'order') return;
    const prev = st.items[pos - 1];
    const text = pos === 0 ? st.hintFirst : st.hintAfter?.replace('{prev}', prev ?? '');
    this.wrong(st, text);
  }

  protected onOrderDone() {
    this.right(this.step()!);
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
