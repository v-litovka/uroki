import { Component } from '@angular/core';

/** Серая строка-задание: <app-hint>Задай вопрос к выделенному слову</app-hint> */
@Component({
  selector: 'app-hint',
  template: '<ng-content />',
  styleUrl: './hint.scss',
})
export class Hint {}
