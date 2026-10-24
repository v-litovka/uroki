import { Component, input } from '@angular/core';

/**
 * Заголовок страницы с текстом и (необязательно) картинкой справа:
 *   <app-page-hero title="Игры" text="…"><app-mascot-pair aside /></app-page-hero>
 */
@Component({
  selector: 'app-page-hero',
  templateUrl: './page-hero.html',
  styleUrl: './page-hero.scss',
  host: { '[class.md]': "size() === 'md'", '[class.xl]': "size() === 'xl'" },
})
export class PageHero {
  readonly title = input.required<string>();
  readonly text = input('');
  /** xl — хаб, lg — пак, md — тема */
  readonly size = input<'md' | 'lg' | 'xl'>('lg');
}
