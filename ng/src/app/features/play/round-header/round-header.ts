import { Component, input } from '@angular/core';
import { ProgressBar } from '../../../shared/ui';

/** Шапка раунда: «👆 ВЫБЕРИ · ТЕМА», «3 / 10», полоска, пометка «повторяем ошибку». */
@Component({
  selector: 'app-round-header',
  imports: [ProgressBar],
  templateUrl: './round-header.html',
  styleUrl: './round-header.scss',
})
export class RoundHeader {
  readonly kicker = input('');
  readonly pos = input(1);
  readonly len = input(1);
  readonly again = input(false);
}
