import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { usePack } from './use-pack';
import { ProgressService } from '../../core/progress/progress.service';
import { HeaderService } from '../../core/layout/header.service';
import { SpeechService } from '../../core/audio/speech.service';
import { Cat } from '../../shared/ui';
import { LEGACY_FALLBACK } from '../../core/catalog/entries';
import { Topic } from '../../core/models';

/** Страница пака: список тем. /:grade/:subject/:pack */
@Component({
  selector: 'app-pack-page',
  imports: [RouterLink, Cat],
  template: `
    @if (p.pack(); as pk) {
      <section class="hero">
        @if (pk.mascot === 'cats') {
          <div class="cats"><app-cat who="vira" [size]="74" /><app-cat who="wendy" [size]="64" /></div>
        }
        <h1 class="h1">{{ pk.title }}</h1>
        <p class="muted">{{ pk.desc }}</p>
      </section>
      <div class="topics">
        @for (t of pk.topics; track t.id) {
          <a class="topic" [routerLink]="[t.id]" [style.--c]="t.color">
            <span class="tn">{{ doneCount(t) }} / {{ available(t).length }}</span>
            <span class="ten">{{ t.title }}</span>
            <span class="tru">{{ t.desc }}</span>
          </a>
        }
      </div>
      @if (legacy()) {
        <p class="old"><a [href]="'legacy/' + legacy()">Старая версия игры</a></p>
      }
    } @else if (p.error()) {
      <p>{{ p.error() }}</p>
    }
  `,
  styles: `
    .hero .cats{float:right;display:flex;align-items:flex-end;gap:6px;margin:0 0 6px 10px}
    .hero p{margin:0 0 16px;max-width:56ch}
    .topics{clear:both;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr));gap:14px}
    .topic{text-decoration:none;color:var(--ink);border:3px solid var(--ink);border-radius:18px;background:var(--paper);padding:10px 14px 12px;box-shadow:4px 4px 0 var(--ink);display:grid;gap:2px;min-height:96px;align-content:start}
    .tn{justify-self:start;padding:1px 9px;border-radius:8px;background:var(--c);color:#fff;font-weight:900;font-size:12px}
    .ten{font-family:var(--display);font-size:24px;line-height:1.05}
    .tru{font-size:13px;color:var(--muted)}
    .old{margin-top:24px;font-size:14px}.old a{color:var(--muted)}
  `,
})
export class PackPage {
  readonly grade = input('3');
  readonly subject = input('');
  readonly pack = input('');
  protected p = usePack(this.grade, this.subject, this.pack);
  private progress = inject(ProgressService);
  private speech = inject(SpeechService);
  protected legacy = computed(() => (this.p.pack() ? LEGACY_FALLBACK[this.p.pack()!.id] : null));

  constructor() {
    const header = inject(HeaderService);
    effect(() => {
      const pk = this.p.pack();
      const pr = pk ? this.progress.pack(pk.id, pk.legacyStorageKey) : null;
      header.set({ back: '/' + this.grade(), stars: pr?.stars ?? null, level: pr?.level ?? null, accent: pk?.color ?? null });
    });
  }

  available(t: Topic) {
    return t.modes.filter((m) => !m.needs || m.needs.every((c) => this.speech.has(c)));
  }
  doneCount(t: Topic) {
    const pk = this.p.pack()!;
    const pr = this.progress.pack(pk.id, pk.legacyStorageKey);
    return this.available(t).filter((m) => pr.isDone(t.id, m.id)).length;
  }
}
