import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Pet } from '../../../core/models';
import { PetMood, petSvg } from './pet-svg';

/** Питомец: нарисованный по окрасу или иконка-эмодзи. <app-pet-avatar [pet]="p" mood="happy" [size]="52" /> */
@Component({
  selector: 'app-pet-avatar',
  templateUrl: './pet-avatar.html',
  styleUrl: './pet-avatar.scss',
})
export class PetAvatar {
  readonly pet = input.required<Pet>();
  readonly mood = input<PetMood>('happy');
  readonly size = input(60);
  private san = inject(DomSanitizer);
  // SVG собирается нашим кодом из цветов палитры — доверяем.
  protected readonly svg = computed(() => this.san.bypassSecurityTrustHtml(petSvg(this.pet(), this.mood(), this.size())));
}
