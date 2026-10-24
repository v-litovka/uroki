import { Component, computed, effect, inject, input } from '@angular/core';
import { Prompt } from '../core/models';
import { SpeechService } from '../core/audio/speech.service';

/** «Сцена» упражнения: предложение / крупное слово / подсказка / кнопка озвучки. */
@Component({
  selector: 'app-prompt-view',
  template: `
    @let p = prompt();
    @if (p.say) {
      <button type="button" class="say" (click)="speech.say(p.say)" aria-label="Послушать ещё раз">🔊</button>
    }
    @if (p.sentence) {
      <p class="sentx">@for (s of segs(); track $index) {<span [class]="s.cls">{{ s.t }}</span>}</p>
    }
    @if (p.big) {
      <p class="big">{{ p.big }}</p>
    }
    @if (p.hint) {
      <p class="qhint">{{ p.hint }}</p>
    }
  `,
  styles: `
    :host{display:grid;gap:12px}
    .sentx{margin:0;text-align:center;font-size:clamp(22px,6vw,28px);font-weight:800;line-height:1.45}
    .gp{color:var(--trap);border-bottom:4px solid var(--trap);padding:0 2px}
    .vb{color:var(--accent)}
    .hl{background:#fff1c2;border-radius:6px;padding:0 4px}
    .big{font-family:var(--display);font-size:clamp(40px,11vw,56px);text-align:center;margin:0;letter-spacing:.02em}
    .qhint{margin:0;text-align:center;color:var(--muted);font-weight:800}
    .say{justify-self:center;width:84px;height:84px;border-radius:50%;border:4px solid var(--ink);background:var(--sun);box-shadow:4px 4px 0 var(--ink);font-size:40px}
  `,
})
export class PromptView {
  readonly prompt = input.required<Prompt>();
  protected speech = inject(SpeechService);
  protected readonly segs = computed(() =>
    (this.prompt().sentence ?? []).map((s) => (typeof s === 'string' ? { t: s, cls: '' } : s)),
  );
  private lastSaid = '';

  constructor() {
    // озвучить автоматически, когда появляется новый текст для озвучки
    effect(() => {
      const t = this.prompt().say;
      if (t && t !== this.lastSaid) {
        this.lastSaid = t;
        setTimeout(() => this.speech.say(t), 300);
      }
    });
  }
}
