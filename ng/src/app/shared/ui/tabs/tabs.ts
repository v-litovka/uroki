import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface TabItem {
  label: string;
  link: unknown[] | string;
  active: boolean;
}

/** Вкладки-ссылки (например, «3 класс / 4 класс»). */
@Component({
  selector: 'app-tabs',
  imports: [RouterLink],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  readonly items = input.required<TabItem[]>();
  readonly label = input('');
}
