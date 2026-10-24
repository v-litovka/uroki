import { Component, input } from '@angular/core';

/** Раздел страницы: заголовок + карточка с содержимым. */
@Component({
  selector: 'app-section',
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section {
  readonly title = input.required<string>();
  readonly note = input('');
}
