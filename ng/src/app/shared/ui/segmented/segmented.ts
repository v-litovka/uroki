import { Component, input, model } from '@angular/core';

export interface SegOption<T> {
  value: T;
  label: string;
}

/** Выбор одного из вариантов «таблетками»: <app-segmented [options]="…" [(value)]="x" /> */
@Component({
  selector: 'app-segmented',
  templateUrl: './segmented.html',
  styleUrl: './segmented.scss',
})
export class Segmented<T> {
  readonly options = input.required<SegOption<T>[]>();
  readonly value = model<T>();
  readonly label = input('');
}
