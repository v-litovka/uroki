import { Component, input, model } from '@angular/core';

/** Палитра цветов с подписями: <app-swatches [colors]="COLORS" [(value)]="hex" /> */
@Component({
  selector: 'app-swatches',
  templateUrl: './swatches.html',
  styleUrl: './swatches.scss',
})
export class Swatches {
  readonly colors = input.required<{ id: string; name: string }[]>();
  readonly value = model<string>('');
}
