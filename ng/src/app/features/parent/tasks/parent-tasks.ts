import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AssignmentsService } from '../../../core/assignments/assignments.service';
import { CatalogService } from '../../../core/catalog/catalog.service';
import { PackLoader } from '../../../core/catalog/pack-loader.service';
import { Pack } from '../../../core/models';
import { Button, Field, ProgressBar, Section, Segmented, SegOption } from '../../../shared/ui';
import { ParentState } from '../parent-state';

/** Задания: выбрать игру → тему → режим → сколько раз → срок. Статус считается сам. */
@Component({
  selector: 'app-parent-tasks',
  imports: [FormsModule, Section, Field, Segmented, Button, ProgressBar],
  templateUrl: './parent-tasks.html',
  styleUrl: './parent-tasks.scss',
})
export class ParentTasks {
  private state = inject(ParentState);
  protected assignments = inject(AssignmentsService);
  protected catalog = inject(CatalogService);
  private loader = inject(PackLoader);

  protected entryId = signal('');
  protected topicId = signal('');
  protected modeId = signal('*');
  protected rounds = signal(1);
  protected due = '';
  protected readonly roundOpts: SegOption<number>[] = [1, 2, 3, 5].map((n) => ({ value: n, label: n + ' раз' }));

  protected readonly entry = computed(() => this.catalog.packs().find((e) => e.id === this.entryId()));
  protected readonly pack = signal<Pack | null>(null);
  protected readonly topic = computed(() => this.pack()?.topics.find((t) => t.id === this.topicId()));
  protected readonly list = computed(() => this.assignments.statusFor(this.state.childId()));

  constructor() {
    effect(() => {
      const e = this.entry();
      this.pack.set(null);
      this.topicId.set('');
      this.modeId.set('*');
      if (e) this.loader.load(e.packId).then((p) => this.pack.set(p));
    });
  }

  add() {
    const e = this.entry();
    const t = this.topic();
    if (!e || !t) return;
    const m = t.modes.find((x) => x.id === this.modeId());
    this.assignments.add({
      childId: this.state.childId(),
      entryId: e.id,
      packId: e.packId,
      subject: e.subject,
      grade: e.grade,
      topicId: t.id,
      modeId: this.modeId(),
      title: `${e.title}: ${t.title}${m ? ' · ' + m.title : ''}`,
      rounds: this.rounds(),
      due: this.due || undefined,
    });
    this.topicId.set('');
  }
}
