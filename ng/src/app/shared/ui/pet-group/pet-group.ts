import { Component, computed, input } from '@angular/core';
import { Pet } from '../../../core/models';
import { PetAvatar } from '../pet-avatar/pet-avatar';

/** Питомцы ребёнка рядом (шапка пака, итог раунда, кабинет). Пустой список — ничего не рисует. */
@Component({
  selector: 'app-pet-group',
  imports: [PetAvatar],
  templateUrl: './pet-group.html',
  styleUrl: './pet-group.scss',
})
export class PetGroup {
  readonly pets = input<Pet[]>([]);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly names = input(false);
  protected readonly px = computed(() => ({ sm: 44, md: 70, lg: 84 })[this.size()]);
  protected readonly shown = computed(() => this.pets().slice(0, 3));
}
