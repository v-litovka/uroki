import { Component, input } from '@angular/core';

/** Крупное слово по центру (или «• • •», когда спрятано). */
@Component({
  selector: 'app-big-word',
  template: '{{ text() }}',
  styleUrl: './big-word.scss',
})
export class BigWord {
  readonly text = input.required<string>();
}
