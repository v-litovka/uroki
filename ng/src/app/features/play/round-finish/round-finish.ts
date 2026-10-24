import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Mascot, Mode } from '../../../core/models';
import { Button, Card, LevelUp, MascotPair } from '../../../shared/ui';

/** Итог раунда: «Готово!», сколько с первого раза, +звёзды, новый уровень, кнопки дальше. */
@Component({
  selector: 'app-round-finish',
  imports: [RouterLink, Card, MascotPair, LevelUp, Button],
  templateUrl: './round-finish.html',
  styleUrl: './round-finish.scss',
})
export class RoundFinish {
  readonly ok = input(0);
  readonly total = input(0);
  readonly stars = input(0);
  readonly level = input(0);
  readonly levelUp = input(false);
  readonly mascot = input<Mascot>('cats');
  readonly nextMode = input<Mode | null>(null);
  readonly again = output<void>();
}
