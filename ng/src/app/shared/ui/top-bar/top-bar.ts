import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/layout/header.service';
import { SfxService } from '../../../core/audio/sfx.service';

/** Верхняя панель: домой/назад, звёзды + уровень текущего пака, звук. */
@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  template: `
    @let s = header.state();
    <header class="top">
      @if (s.back !== null) {
        <a class="iconbtn" [routerLink]="s.back" aria-label="Назад">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
        </a>
      }
      @if (s.stars) {
        <div class="stars" aria-label="звёзды">⭐ {{ s.stars() }} @if (s.level && s.level()) {<small>ур. {{ s.level() }}</small>}</div>
      }
      <button class="iconbtn sfx" type="button" [attr.aria-pressed]="sfx.on()" (click)="sfx.toggle()" aria-label="Звук">
        {{ sfx.on() ? '🔊' : '🔇' }}
      </button>
    </header>
  `,
  styles: `
    .top{display:flex;align-items:center;gap:10px;margin-bottom:10px;min-height:46px}
    .iconbtn{width:46px;height:46px;border-radius:14px;border:3px solid var(--ink);background:var(--paper);display:grid;place-items:center;box-shadow:3px 3px 0 var(--ink);flex:none;color:var(--ink);font-size:20px}
    .iconbtn svg{width:24px;height:24px}
    .sfx{margin-left:auto}.sfx[aria-pressed="false"]{background:var(--ghost)}
    .stars{margin-left:auto;display:flex;align-items:center;gap:6px;height:46px;padding:0 14px;border-radius:999px;border:3px solid var(--ink);background:var(--sun);box-shadow:3px 3px 0 var(--ink);font-weight:900;font-size:20px}
    .stars + .sfx{margin-left:0}
    small{font-size:12px;background:var(--ink);color:#fff;border-radius:8px;padding:1px 6px}
  `,
})
export class TopBar {
  protected header = inject(HeaderService);
  protected sfx = inject(SfxService);
}
