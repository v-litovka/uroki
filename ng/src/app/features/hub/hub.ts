import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EXTRA_LINKS } from '../../core/catalog/entries';
import { GRADES, SUBJECTS } from '../../core/catalog/subjects';
import { Grade } from '../../core/models';
import { FamilyService } from '../../core/family/family.service';
import { HeaderService } from '../../core/layout/header.service';
import { CatalogService } from '../../core/catalog/catalog.service';
import { AssignmentsService } from '../../core/assignments/assignments.service';
import { Button, GameTile, PageHero, TabItem, Tabs } from '../../shared/ui';
import { assignmentLink } from '../me/assignment-link';
import { LangService } from '../../core/i18n/lang.service';

/** Хаб «Игры»: приветствие, задание от взрослого, вкладки классов, плитки игр. #/3, #/4 */
@Component({
  selector: 'app-hub',
  imports: [RouterLink, PageHero, Tabs, GameTile, Button],
  templateUrl: './hub.html',
  styleUrl: './hub.scss',
})
export class Hub {
  /** параметр маршрута :grade */
  readonly grade = input<string>('3');
  private family = inject(FamilyService);
  private catalog = inject(CatalogService);
  private assignments = inject(AssignmentsService);
  protected readonly child = this.family.current;
  protected readonly g = computed<Grade>(() => (this.grade() === '4' ? 4 : 3));
  protected readonly entries = computed(() => this.catalog.visible().filter((x) => x.grade === this.g()));
  protected readonly extras = computed(() => EXTRA_LINKS.filter((x) => x.grade === this.g()));
  protected readonly tabs = computed<TabItem[]>(() => GRADES.map((gr) => ({ label: `${gr} класс`, link: ['/', gr], active: gr === this.g() })));
  protected readonly subjects = SUBJECTS;
  /** первое невыполненное задание */
  protected readonly task = computed(() => this.assignments.statusFor(this.child().id).find((s) => !s.complete) ?? null);
  protected readonly link = assignmentLink;

  constructor() {
    inject(HeaderService).set({});
    inject(LangService).lang.set('ru');
  }
}
