import { Component, input } from '@angular/core';

/** Подпись + поле: <app-field label="Имя"><input …></app-field> */
@Component({
  selector: 'app-field',
  template: '<label><span>{{ label() }}</span><ng-content /></label>',
  styleUrl: './field.scss',
})
export class Field {
  readonly label = input.required<string>();
}
