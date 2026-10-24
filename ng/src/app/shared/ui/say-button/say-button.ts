import { Component } from '@angular/core';

/** Большая круглая кнопка «🔊 послушать ещё раз». */
@Component({
  selector: 'button[app-say-button]',
  template: '🔊',
  styleUrl: './say-button.scss',
  host: { type: 'button', 'aria-label': 'Послушать ещё раз' },
})
export class SayButton {}
