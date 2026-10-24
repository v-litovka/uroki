import { Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { startNbsp } from './core/text/nbsp';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    afterNextRender(() => startNbsp());
  }
}
