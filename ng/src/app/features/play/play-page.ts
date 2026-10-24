import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { usePack } from '../pack/use-pack';
import { ProgressService } from '../../core/progress/progress.service';
import { HeaderService } from '../../core/layout/header.service';
import { SpeechService } from '../../core/audio/speech.service';
import { SfxService } from '../../core/audio/sfx.service';
import { Exercise, Mode, Topic } from '../../core/models';
import { ExercisePlayer, ExerciseResult, RoundQueue } from '../../engine';
import { levelOf } from '../../core/progress/levels';
import { RoundHeader } from './round-header/round-header';
import { RoundFinish } from './round-finish/round-finish';

interface Fin {
  ok: number;
  n: number;
  levelUp: boolean;
}

/** Раунд: N заданий подряд, ошибки повторяются в конце. #/:grade/:subject/:pack/:topic/:mode */
@Component({
  selector: 'app-play-page',
  imports: [ExercisePlayer, RoundHeader, RoundFinish],
  templateUrl: './play-page.html',
})
export class PlayPage {
  readonly grade = input('3');
  readonly subject = input('');
  readonly pack = input('');
  readonly topic = input('');
  readonly mode = input('');
  protected p = usePack(this.grade, this.subject, this.pack);
  private progress = inject(ProgressService);
  private speech = inject(SpeechService);
  private sfx = inject(SfxService);
  private router = inject(Router);

  protected topicObj = computed<Topic | undefined>(() => this.p.pack()?.topics.find((t) => t.id === this.topic()));
  protected modeObj = computed<Mode | undefined>(() => this.topicObj()?.modes.find((m) => m.id === this.mode()));
  protected mascot = computed(() => this.p.pack()?.mascot ?? 'none');
  private handle = computed(() => {
    const pk = this.p.pack();
    return pk ? this.progress.pack(pk.id, pk.legacyStorageKey) : null;
  });
  protected level = computed(() => levelOf(this.handle()?.stars() ?? 0));
  protected kicker = computed(() => `${this.modeObj()?.icon ?? ''} ${this.modeObj()?.title ?? ''} · ${this.topicObj()?.title ?? ''}`);

  private queue = signal<RoundQueue<unknown> | null>(null);
  private tick = signal(0); // RoundQueue — изменяемый объект, tick заставляет пересчитать вид
  protected current = signal<Exercise | null>(null);
  protected fin = signal<Fin | null>(null);
  protected pos = computed(() => (this.tick(), Math.min((this.queue()?.index ?? 0) + 1, this.queue()?.length ?? 0)));
  protected len = computed(() => (this.tick(), this.queue()?.length ?? 0));
  protected again = computed(() => (this.tick(), !!this.queue()?.current?.again));
  protected nextMode = computed(() => {
    const t = this.topicObj();
    if (!t) return null;
    const ms = t.modes.filter((m) => !m.needs || m.needs.every((c) => this.speech.has(c)));
    return ms[ms.findIndex((m) => m.id === this.mode()) + 1] ?? null;
  });

  constructor() {
    const header = inject(HeaderService);
    effect(() => {
      const h = this.handle();
      header.set({ back: `/${this.grade()}/${this.subject()}/${this.pack()}/${this.topic()}`, stars: h?.stars ?? null, level: h?.level ?? null });
    });
    // новый раунд при смене темы/режима
    effect(() => {
      const t = this.topicObj();
      const m = this.modeObj();
      if (t && m) untracked(() => this.start(t));
      else if (this.p.pack()) untracked(() => this.router.navigateByUrl('/'));
    });
  }

  private start(t: Topic) {
    this.fin.set(null);
    this.queue.set(new RoundQueue(t.items, t.roundSize ?? 10));
    this.show();
  }

  private show() {
    const q = this.queue()!;
    this.tick.update((x) => x + 1);
    if (q.done) return this.finish();
    this.current.set(this.modeObj()!.build(q.current.item));
    window.scrollTo(0, 0);
  }

  protected onDone(r: ExerciseResult) {
    const q = this.queue()!;
    const ex = this.current()!;
    if (!q.current.again) {
      this.progress.logAttempt({ pack: this.p.pack()!.id, topic: this.topic(), mode: this.mode(), item: ex.itemId, ok: !r.missed });
    }
    q.complete(r.missed);
    this.show();
  }

  private finish() {
    const q = this.queue()!;
    const h = this.handle()!;
    h.markDone(this.topic(), this.mode());
    const levelUp = h.addStars(q.firstTry);
    this.sfx.play('fin');
    this.current.set(null);
    this.fin.set({ ok: q.firstTry, n: q.total, levelUp });
    window.scrollTo(0, 0);
  }

  protected restart() {
    this.start(this.topicObj()!);
  }
}
