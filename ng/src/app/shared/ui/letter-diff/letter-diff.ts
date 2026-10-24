import { Component, input } from '@angular/core';

/** Слово, где неверно написанные буквы подчёркнуты красным. */
@Component({
  selector: 'app-letter-diff',
  templateUrl: './letter-diff.html',
  styleUrl: './letter-diff.scss',
})
export class LetterDiff {
  readonly letters = input.required<{ ch: string; bad: boolean }[]>();
}
