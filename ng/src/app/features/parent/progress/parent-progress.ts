import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ProgressService } from '../../../core/progress/progress.service';
import { AssignmentsService } from '../../../core/assignments/assignments.service';
import { CatalogService } from '../../../core/catalog/catalog.service';
import { KV_STORE } from '../../../core/storage/key-value-store';
import { ENTRIES } from '../../../core/catalog/entries';
import { LegacyEntry } from '../../../core/models';
import { ProgressBar, Section, StatCard } from '../../../shared/ui';
import { ParentState } from '../parent-state';

/** Успехи ребёнка: цифры, задания, трудные места, история, звёзды старых игр. */
@Component({
  selector: 'app-parent-progress',
  imports: [DatePipe, Section, StatCard, ProgressBar],
  templateUrl: './parent-progress.html',
  styleUrl: './parent-progress.scss',
})
export class ParentProgress {
  private state = inject(ParentState);
  private progress = inject(ProgressService);
  private assignments = inject(AssignmentsService);
  private catalog = inject(CatalogService);
  private kv = inject(KV_STORE);

  protected readonly id = this.state.childId;
  protected readonly rounds = computed(() => this.progress.rounds(this.id()));
  protected readonly week = computed(() => this.rounds().filter((r) => r.t > Date.now() - 7 * 864e5).length);
  protected readonly stars = computed(() => this.progress.totalStars(this.id(), this.catalog.packs().map((p) => p.packId)));
  protected readonly tasks = computed(() => this.assignments.statusFor(this.id()));
  protected readonly tasksDone = computed(() => this.tasks().filter((t) => t.complete).length);
  protected readonly hard = computed(() => this.progress.hardItems(this.id(), 12));
  protected readonly packTitle = (id: string) => this.catalog.packs().find((p) => p.packId === id)?.title ?? id;
  /** по дням за 7 дней */
  protected readonly days = computed(() => {
    const out: { d: string; n: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 864e5);
      const key = day.toDateString();
      out.push({ d: day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }), n: this.rounds().filter((r) => new Date(r.t).toDateString() === key).length });
    }
    return out;
  });
  protected readonly maxDay = computed(() => Math.max(1, ...this.days().map((d) => d.n)));
  /** звёзды старых игр (они не знают про детей — общие для устройства) */
  protected readonly legacy = computed(() =>
    ENTRIES.filter((e): e is LegacyEntry => e.kind === 'legacy' && !!e.storageKey)
      .map((e) => ({ title: e.title, grade: e.grade, stars: Number(this.kv.get<{ stars?: number } | null>(e.storageKey!, null)?.stars ?? 0) }))
      .filter((x) => x.stars > 0),
  );
}
