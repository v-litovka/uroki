import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FamilyService } from '../../core/family/family.service';
import { ProgressService } from '../../core/progress/progress.service';
import { AssignmentsService } from '../../core/assignments/assignments.service';
import { CatalogService } from '../../core/catalog/catalog.service';
import { HeaderService } from '../../core/layout/header.service';
import { levelOf } from '../../core/progress/levels';
import { Button, PageHero, PetGroup, ProgressBar, Section, StatCard } from '../../shared/ui';
import { assignmentLink } from './assignment-link';

/** Кабинет ребёнка: я, мои питомцы, звёзды, задания, что я прошла. #/me */
@Component({
  selector: 'app-me-page',
  imports: [RouterLink, DatePipe, PageHero, PetGroup, StatCard, Section, ProgressBar, Button],
  templateUrl: './me-page.html',
  styleUrl: './me-page.scss',
})
export class MePage {
  protected family = inject(FamilyService);
  private progress = inject(ProgressService);
  private assignments = inject(AssignmentsService);
  private catalog = inject(CatalogService);
  protected readonly child = this.family.current;
  protected readonly pets = this.family.currentPets;
  protected readonly stars = computed(() => this.progress.totalStars(this.child().id, this.catalog.packs().map((p) => p.packId)));
  protected readonly level = computed(() => levelOf(this.stars()));
  protected readonly rounds = computed(() => this.progress.rounds(this.child().id));
  protected readonly recent = computed(() => this.rounds().slice(0, 10));
  protected readonly tasks = computed(() => this.assignments.statusFor(this.child().id));
  protected readonly tasksLeft = computed(() => this.tasks().filter((t) => !t.complete).length);
  protected readonly link = assignmentLink;

  constructor() {
    inject(HeaderService).set({ back: '/' });
  }
}
