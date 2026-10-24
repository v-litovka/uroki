import { Component, input, model } from '@angular/core';

/** Сетка эмодзи для выбора: аватар ребёнка, иконка питомца. allowNone — «без иконки». */
@Component({
  selector: 'app-emoji-picker',
  templateUrl: './emoji-picker.html',
  styleUrl: './emoji-picker.scss',
})
export class EmojiPicker {
  readonly items = input.required<string[]>();
  readonly value = model<string | undefined>(undefined);
  readonly allowNone = input<string | null>(null);
}
