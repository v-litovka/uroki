import { Component, computed, effect, inject, input, linkedSignal, output } from '@angular/core';
import { Exercise, Lesson, Pet, Prompt, Step } from '../../core/models';
import { AnswerInput, Card, ConfirmButton, Feedback, Hint, LetterDiff, OptionGrid, OrderTiles, Picked, RichHtml, TapWords, Typed, WhyStepView } from '../../shared/ui';
import { PromptView } from '../prompt-view/prompt-view';
import { SfxService } from '../../core/audio/sfx.service';
import { diffLetters, lev, matches, norm } from '../../shared/utils/text';
import { pick } from '../../shared/utils/random';
import { petPhrase } from '../phrases';
import { LangService } from '../../core/i18n/lang.service';

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
  imports: [Card, PromptView, OptionGrid, AnswerInput, WhyStepView, Feedback, LetterDiff, ConfirmButton, OrderTiles, Hint, RichHtml, TapWords],
  styleUrl: './exercise-player.scss',
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
  protected readonly i18n = inject(LangService);

  /* Всё состояние привязано к упражнению: пришло новое — сбросилось само (linkedSignal). */
  protected readonly stepIdx = linkedSignal({ source: this.exercise, computation: () => 0 });
  private readonly overlay = linkedSignal<Exercise, Partial<Prompt>>({
    source: this.exercise,
    computation: (ex) => ({ ...(ex.steps[0]?.prompt ?? {}) }),
  });
  private readonly run = computed(() => ({ ex: this.exercise(), wrong: 0, mistakes: 0, missed: false, finished: false, unknown: 0 }));
  /** урок после ошибки (если у упражнения есть lesson) */
  protected readonly lesson = linkedSignal<Exercise, Lesson | null>({ source: this.exercise, computation: () => null });
  protected readonly lessonAgain = linkedSignal({ source: this.exercise, computation: () => false });
  private retried = false;
  protected readonly fb = linkedSignal<Exercise, { ok: boolean; text: string; pet: Pet | null } | null>({ source: this.exercise, computation: () => null });
  protected readonly diff = linkedSignal<Exercise, { ch: string; bad: boolean }[] | null>({ source: this.exercise, computation: () => null });
  protected readonly praise = linkedSignal<Exercise, { text: string; pet: Pet | null } | null>({ source: this.exercise, computation: () => null });

  /** шаги упражнения; урок с «реши сама» вставляет свои шаги вместо ошибочного */
  private readonly steps = linkedSignal<Exercise, Step[]>({ source: this.exercise, computation: (ex) => ex.steps });
  /** идут шаги урока: с какого места и какой урок */
  private readonly practice = linkedSignal<Exercise, { lesson: Lesson; start: number } | null>({ source: this.exercise, computation: () => null });
  protected readonly step = computed<Step | undefined>(() => this.steps()[this.stepIdx()]);
  /** «Задача: …» над уроком */
  protected readonly lessonTask = computed(() => this.lesson()?.task ?? this.exercise().prompt.html);
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
    return { ok, pet, text: text ?? (own ? pick(ok ? own.ok : own.bad) : petPhrase(pet, ok, this.i18n.lang())) };
  }

  constructor() {
    // Хук для e2e-тестов (tools/e2e.mjs): виден, только если тест выставил window.__E2E__.
    effect(() => {
      const w = globalThis as unknown as { __E2E__?: boolean; __STEP__?: unknown };
      if (w.__E2E__) w.__STEP__ = this.lesson() ? { kind: 'lesson' } : (this.step() ?? null);
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
    if (this.steps()[nextIdx]?.kind !== 'why') this.praise.set(null);
    this.stepIdx.set(nextIdx);
    const np = this.steps()[nextIdx]?.prompt;
    if (np) this.overlay.update((o) => ({ ...o, ...np }));
    if (nextIdx >= this.steps().length && !run.finished) {
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
    const next = this.steps()[this.stepIdx() + 1];
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
    const ls = st.lesson ?? this.exercise().lesson;
    if (ls) {
      // как в Городе Слов: правило + примеры, потом то же задание заново
      this.lessonAgain.set(ls.steps ? this.practice()?.lesson === ls : this.retried);
      setTimeout(() => this.lesson.set(ls), 900);
      this.fb.set(this.say(false, this.i18n.t('trap')));
      return;
    }
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

  /** после урока — шаги урока («реши сама») или задание с начала */
  protected retry() {
    const ls = this.lesson();
    this.retried = true;
    this.lesson.set(null);
    if (ls?.steps?.length) return this.startPractice(ls);
    this.fb.set(null);
    this.diff.set(null);
    this.praise.set(null);
    this.run().wrong = 0;
    this.overlay.set({ ...(this.exercise().steps[0]?.prompt ?? {}) });
    this.stepIdx.set(-1);
    setTimeout(() => this.stepIdx.set(0)); // шаги пересоздаются с чистым состоянием
  }

  private startPractice(ls: Lesson) {
    this.fb.set(null);
    this.diff.set(null);
    this.praise.set(null);
    this.run().wrong = 0;
    const i = this.stepIdx();
    if (this.practice()?.lesson !== ls) {
      // заменить ошибочный шаг шагами урока (у каждого — этот же урок на случай ошибки)
      const own = ls.steps!.map((s) => ({ ...s, lesson: ls }) as Step);
      this.steps.update((a) => [...a.slice(0, i), ...own, ...a.slice(i + 1)]);
      this.practice.set({ lesson: ls, start: i });
    }
    const start = this.practice()!.start;
    this.overlay.set({ ...(this.steps()[start]?.prompt ?? {}) });
    this.stepIdx.set(-1);
    setTimeout(() => this.stepIdx.set(start));
  }

  protected onTap(correct: boolean) {
    const st = this.step()!;
    if (correct) this.right(st);
    else this.wrong(st);
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
    if (st.kind === 'input') {
      const answers = Array.isArray(st.answer) ? st.answer : [st.answer];
      if (t.correct) {
        // засчитано, но есть ответ лучше
        if (st.bestNote && norm(t.value) !== norm(answers[0])) st.okMsg = st.okMsg ?? st.bestNote;
        return this.right(st);
      }
      const v = norm(t.value);
      if (st.typo && !(st.reject ?? []).some((r) => norm(r) === v)) {
        const near = answers.find((a) => lev(v, norm(a)) <= (norm(a).length > 5 ? 2 : 1));
        if (near) {
          this.sfx.play('bad');
          this.fb.set(this.say(false, this.i18n.t('typo', { w: near })));
          return;
        }
      }
      if (st.unknownMsg && !(st.reject ?? []).some((r) => matches(t.value, r))) {
        const run = this.run();
        run.unknown++;
        if (!st.unknownLimit || run.unknown < st.unknownLimit) {
          this.sfx.play('bad');
          this.fb.set(this.say(false, st.unknownMsg));
          return;
        }
      }
    } else if (t.correct) return this.right(st);
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
