import { Component, input } from '@angular/core';

/** Белая карточка с толстым контуром. Содержимое — через проекцию. */
@Component({
  selector: 'app-card',
  template: '<ng-content />',
  styleUrl: './card.scss',
  host: { '[class.center]': 'center()' },
})
export class Card {
  /** выровнять содержимое по центру (итоговые карточки) */
  readonly center = input(false);
}
