import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from '../../shared/ui';

/** Оболочка всех экранов: травка снизу, верхняя панель, страница. */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, TopBar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {}
