import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../../core/layout/header.service';
import { SfxService } from '../../../core/audio/sfx.service';
import { IconButton } from '../icon-button/icon-button';
import { StarsBadge } from '../stars-badge/stars-badge';

/** Верхняя панель: домой/назад, звёзды + уровень текущего пака, звук. Что показать — решает HeaderService. */
@Component({
  selector: 'app-top-bar',
  imports: [RouterLink, IconButton, StarsBadge],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.scss',
})
export class TopBar {
  protected header = inject(HeaderService);
  protected sfx = inject(SfxService);
}
