import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXTRA_LINKS, GAMES, Grade, SUBJECTS } from '../core/games';
import { store } from '../core/progress';

@Component({
  selector: 'app-hub',
  imports: [RouterLink],
  templateUrl: './hub.html',
  styleUrl: './hub.scss',
})
export class Hub {
  /** из маршрута :grade (withComponentInputBinding) */
  readonly grade = input<string>('3');
  readonly g = computed<Grade>(() => (this.grade() === '4' ? 4 : 3));
  readonly games = computed(() => GAMES.filter((x) => x.grade === this.g()));
  readonly extras = computed(() => EXTRA_LINKS.filter((x) => x.grade === this.g()));
  readonly subjects = SUBJECTS;

  constructor() {
    // запоминаем выбранный класс, чтобы открывать его по умолчанию
    queueMicrotask(() => store.set('ng-grade', this.g()));
  }
}
