import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ENTRIES, EXTRA_LINKS } from '../../core/catalog/entries';
import { GRADES, SUBJECTS } from '../../core/catalog/subjects';
import { Grade } from '../../core/models';
import { ProfileService } from '../../core/profile/profile.service';
import { HeaderService } from '../../core/layout/header.service';
import { Button, GameTile, PageHero, TabItem, Tabs } from '../../shared/ui';

/** Хаб «Игры»: вкладки классов + плитки игр. #/3, #/4 */
@Component({
  selector: 'app-hub',
  imports: [RouterLink, PageHero, Tabs, GameTile, Button],
  templateUrl: './hub.html',
  styleUrl: './hub.scss',
})
export class Hub {
  /** параметр маршрута :grade */
  readonly grade = input<string>('3');
  protected readonly g = computed<Grade>(() => (this.grade() === '4' ? 4 : 3));
  protected readonly entries = computed(() => ENTRIES.filter((x) => x.grade === this.g() && !x.hidden));
  protected readonly extras = computed(() => EXTRA_LINKS.filter((x) => x.grade === this.g()));
  protected readonly tabs = computed<TabItem[]>(() => GRADES.map((gr) => ({ label: `${gr} класс`, link: ['/', gr], active: gr === this.g() })));
  protected readonly subjects = SUBJECTS;

  constructor() {
    const profile = inject(ProfileService);
    inject(HeaderService).set({});
    effect(() => profile.setLastGrade(this.g()));
  }
}
