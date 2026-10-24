import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParentSession } from '../../../core/family/parent-session';
import { HeaderService } from '../../../core/layout/header.service';
import { Button, Card, Field, PageHero } from '../../../shared/ui';

/** Вход взрослого по PIN. */
@Component({
  selector: 'app-parent-login',
  imports: [FormsModule, PageHero, Card, Field, Button],
  templateUrl: './parent-login.html',
  styleUrl: './parent-login.scss',
})
export class ParentLogin {
  private session = inject(ParentSession);
  private router = inject(Router);
  protected pin = '';
  protected readonly error = signal('');

  constructor() {
    inject(HeaderService).set({ back: '/me' });
  }

  submit() {
    if (this.session.unlock(this.pin)) this.router.navigate(['/parent']);
    else {
      this.error.set('Неверный PIN');
      this.pin = '';
    }
  }
}
