import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { usePack } from '../pack/use-pack';
import { ProgressService } from '../../core/progress/progress.service';
import { HeaderService } from '../../core/layout/header.service';
import { SpeechService } from '../../core/audio/speech.service';
import { RuleBox } from '../../shared/ui';

/** Тема: правило + список режимов. /:grade/:subject/:pack/:topic */
@Component({
  selector: 'app-topic-page',
  imports: [RouterLink, RuleBox],
  template: `
    @if (topicObj(); as t) {
      <h2 class="h2">{{ t.title }}</h2>
      <app-rule-box [html]="t.ruleHtml" [style.--accent]="t.color" />
      <div class="modes">
        @for (m of modes(); track m.id; let i = $index) {
          <a class="mb" [class.ok]="isDone(m.id)" [routerLink]="[m.id]">
            <span class="mi">{{ m.icon }}</span>
            <span><b>{{ i + 1 }}. {{ m.title }}</b><span>{{ m.desc }}</span></span>
            @if (isDone(m.id)) { <span class="ck">✓</span> }
          </a>
        }
      </div>
      @if (hiddenVoice()) {
        <p class="muted note">Диктант появится, если на устройстве есть русский голос.</p>
      }
    }
  `,
  styles: `
    .modes{display:grid;gap:12px;margin-top:16px}
    .mb{display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--ink);border:3px solid var(--ink);border-radius:16px;background:var(--paper);box-shadow:3px 3px 0 var(--ink);padding:10px 14px;min-height:64px}
    .mb.ok{background:#e3f6ea}
    .mi{font-size:30px;flex:none}
    .mb b{font-family:var(--display);font-weight:400;font-size:22px;display:block}
    .mb span span{font-size:14px;color:var(--muted)}
    .ck{margin-left:auto;color:var(--good);font-weight:900;font-size:24px}
    .note{margin-top:10px}
  `,
})
export class TopicPage {
  readonly grade = input('3');
  readonly subject = input('');
  readonly pack = input('');
  readonly topic = input('');
  protected p = usePack(this.grade, this.subject, this.pack);
  private progress = inject(ProgressService);
  private speech = inject(SpeechService);
  protected topicObj = computed(() => this.p.pack()?.topics.find((t) => t.id === this.topic()));
  protected modes = computed(() => (this.topicObj()?.modes ?? []).filter((m) => !m.needs || m.needs.every((c) => this.speech.has(c))));
  protected hiddenVoice = computed(() => (this.topicObj()?.modes.length ?? 0) > this.modes().length);

  constructor() {
    const header = inject(HeaderService);
    effect(() => {
      const pk = this.p.pack();
      const pr = pk ? this.progress.pack(pk.id, pk.legacyStorageKey) : null;
      header.set({ back: `/${this.grade()}/${this.subject()}/${this.pack()}`, stars: pr?.stars ?? null, level: pr?.level ?? null });
    });
  }

  isDone(mode: string) {
    const pk = this.p.pack();
    return !!pk && this.progress.pack(pk.id, pk.legacyStorageKey).isDone(this.topic(), mode);
  }
}
