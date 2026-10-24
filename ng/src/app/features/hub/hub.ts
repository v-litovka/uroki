import { Component, computed, inject, input, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ENTRIES, EXTRA_LINKS } from '../../core/catalog/entries';
import { SUBJECTS, GRADES } from '../../core/catalog/subjects';
import { Grade } from '../../core/models';
import { ProfileService } from '../../core/profile/profile.service';
import { HeaderService } from '../../core/layout/header.service';

@Component({
  selector: 'app-hub',
  imports: [RouterLink],
  templateUrl: './hub.html',
  styleUrl: './hub.scss',
})
export class Hub {
  /** параметр маршрута :grade */
  readonly grade = input<string>('3');
  readonly g = computed<Grade>(() => (this.grade() === '4' ? 4 : 3));
  readonly entries = computed(() => ENTRIES.filter((x) => x.grade === this.g() && !x.hidden));
  readonly extras = computed(() => EXTRA_LINKS.filter((x) => x.grade === this.g()));
  readonly subjects = SUBJECTS;
  readonly grades = GRADES;

  constructor() {
    const profile = inject(ProfileService);
    inject(HeaderService).set({});
    effect(() => profile.setLastGrade(this.g()));
  }
}
