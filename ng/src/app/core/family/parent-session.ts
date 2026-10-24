import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FamilyService } from './family.service';

/** Взрослый вошёл (до перезагрузки страницы). */
@Injectable({ providedIn: 'root' })
export class ParentSession {
  private family = inject(FamilyService);
  readonly unlocked = signal(false);
  unlock(pin: string) {
    const ok = this.family.checkPin(pin);
    if (ok) this.unlocked.set(true);
    return ok;
  }
  lock() {
    this.unlocked.set(false);
  }
}

/** Пускает в кабинет взрослого только после PIN. */
export const parentGuard: CanActivateFn = () =>
  inject(ParentSession).unlocked() || inject(Router).createUrlTree(['/parent/login']);
