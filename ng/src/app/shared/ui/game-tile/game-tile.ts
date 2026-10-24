import { Component, input } from '@angular/core';

/** Плитка игры в хабе: <a app-game-tile tag="Русский" title="…" desc="…" color="#7A4FE0" href="…"> */
@Component({
  selector: 'a[app-game-tile]',
  templateUrl: './game-tile.html',
  styleUrl: './game-tile.scss',
  host: { '[style.--c]': 'color()' },
})
export class GameTile {
  readonly tag = input('');
  readonly title = input.required<string>();
  readonly desc = input('');
  readonly color = input('#7A4FE0');
}
