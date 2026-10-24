import { Component, input } from '@angular/core';

/** Карточка темы: бейдж «1 / 4», название, описание. */
@Component({
  selector: 'a[app-topic-card]',
  templateUrl: './topic-card.html',
  styleUrl: './topic-card.scss',
  host: { '[style.--c]': 'color()' },
})
export class TopicCard {
  readonly badge = input('');
  readonly title = input.required<string>();
  readonly desc = input('');
  readonly color = input('#7A4FE0');
}
