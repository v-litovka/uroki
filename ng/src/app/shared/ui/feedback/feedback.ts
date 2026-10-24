import { Component, input } from '@angular/core';
import { PetAvatar } from '../pet-avatar/pet-avatar';
import { Pet } from '../../../core/models';

/** Плашка «верно / подумай ещё» с питомцем (или значком, если питомца нет). */
@Component({
  selector: 'app-feedback',
  imports: [PetAvatar],
  templateUrl: './feedback.html',
  styleUrl: './feedback.scss',
  host: { role: 'status', '[class.bad]': '!ok()' },
})
export class Feedback {
  readonly ok = input(true);
  readonly text = input('');
  readonly pet = input<Pet | null>(null);
}
