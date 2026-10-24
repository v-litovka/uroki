import { Component, input } from '@angular/core';

/** ⭐ 57 [ур. 2] */
@Component({
  selector: 'app-stars-badge',
  templateUrl: './stars-badge.html',
  styleUrl: './stars-badge.scss',
  host: { 'aria-label': 'звёзды' },
})
export class StarsBadge {
  readonly stars = input(0);
  readonly level = input(0);
}
