import { Injectable, Signal, signal } from '@angular/core';

export interface HeaderState {
  /** куда ведёт кнопка «домой/назад» (routerLink) */
  back: string | null;
  /** звёзды текущего пака (null — не показывать) */
  stars: Signal<number> | null;
  level: Signal<number> | null;
  /** цвет акцента текущего пака */
  accent: string | null;
}

/** Страницы сообщают оболочке, что показать в верхней панели. */
@Injectable({ providedIn: 'root' })
export class HeaderService {
  readonly state = signal<HeaderState>({ back: null, stars: null, level: null, accent: null });
  set(s: Partial<HeaderState>) {
    this.state.set({ back: null, stars: null, level: null, accent: null, ...s });
  }
}
