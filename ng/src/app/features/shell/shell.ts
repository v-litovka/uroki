import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from '../../shared/ui';

/** Оболочка: травка снизу, верхняя панель, страница. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopBar],
  template: `
    <div class="ground" aria-hidden="true"></div>
    <main class="page">
      <app-top-bar />
      <router-outlet />
    </main>
  `,
})
export class Shell {}
