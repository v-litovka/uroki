import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { usePack } from '../pack/use-pack';
import { ProgressService } from '../../core/progress/progress.service';
import { HeaderService } from '../../core/layout/header.service';
import { SpeechService } from '../../core/audio/speech.service';
import { SfxService } from '../../core/audio/sfx.service';
import { Exercise, Mode, Topic } from '../../core/models';
import { RoundQueue } from '../../engine/round-queue';
import { ExercisePlayer, ExerciseResult } from '../../engine/exercise-player';
import { Cat, ProgressBar } from '../../shared/ui';
import { levelOf } from '../../core/progress/levels';

interface Fin {
  ok: number;
  n: number;
  levelUp: boolean;
}

/** Раунд: N заданий подряд, ошибки повторяются в конце. /:grade/:subject/:pack/:topic/:mode */
@Component({
  selector: 'app-play-page',
  imports: [ExercisePlayer, ProgressBar, Cat, RouterLink],
  template: `
    @if (fin(); as f) {
      <div class="card fin">
        @if (mascot() === 'cats') {
          <div class="cats"><app-cat who="vira" [size]="88" /><app-cat who="wendy" [size]="78" /></div>
        }
        <h2>Готово!</h2>
        <p class="big2">С первого раза: {{ f.ok }} из {{ f.n }} · +{{ f.ok }} ⭐</p>
        @if (f.levelUp) {
          <div class="lvup">🏆 <b>Новый уровень {{ level() }}!</b></div>
        }
        <div class="acts">
          @if (nextMode(); as nx) {
            <a class="btn" [routerLink]="['..', nx.id]">{{ nx.icon }} {{ nx.title }} →</a>
          }
          <button class="btn ghost" type="button" (click)="restart()">Ещё раз</button>
          <a class="btn ghost" routerLink="..">К теме</a>
        </div>
      </div>
    } @else if (current(); as ex) {
      <div class="rtop">
        <span class="kick">{{ modeObj()!.icon }} {{ modeObj()!.title }} · {{ topicObj()!.title }}</span>
        <span>{{ pos() }} / {{ len() }}</span>
      </div>
      <app-progress-bar [value]="(pos() - 1) / len()" />
      @if (again()) {
        <p class="again">🔁 Повторяем ошибку</p>
      }
      <app-exercise-player [exercise]="ex" [mascot]="mascot()" [phrases]="p.pack()?.phrases" (finished)="onDone($event)" />
    }
  `,
  styles: `
    .rtop{display:flex;justify-content:space-between;align-items:center;font-weight:900;gap:10px}.rtop>span:last-child{white-space:nowrap}
    .kick{font-size:13px;letter-spacing:.06em;text-transform:uppercase}
    .again{margin:0 0 10px;text-align:center;color:var(--muted);font-weight:800}
    .fin{text-align:center;justify-items:center}
    .fin h2{font-family:var(--display);font-weight:400;font-size:34px;margin:0}
    .cats{display:flex;align-items:flex-end;gap:6px}
    .big2{font-size:20px;margin:0}
    .acts{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
    .lvup{display:flex;align-items:center;gap:12px;border:3px solid var(--sun);background:#fff6cc;border-radius:16px;padding:8px 12px;font-weight:800}
    .lvup b{font-family:var(--display);font-weight:400;font-size:26px}
  `,
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
      if (t && m) untracked(() => this.start(t, m));
      else if (this.p.pack() && (!t || !m)) untracked(() => this.router.navigateByUrl('/'));
    });
  }

  private start(t: Topic, m: Mode) {
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
    const cur = q.current;
    const ex = this.current()!;
    if (!cur.again) {
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
    this.start(this.topicObj()!, this.modeObj()!);
  }
}
