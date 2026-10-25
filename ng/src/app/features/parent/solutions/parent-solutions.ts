import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PackLoader } from '../../../core/catalog/pack-loader.service';
import { Pack } from '../../../core/models';
import { RichHtml, Section } from '../../../shared/ui';
import { SOLUTION_PACKS } from '../../../core/catalog/entries';

/** Решения для взрослого (Домашка): страница тетради → все упражнения с записью «как в тетради». Только за PIN. */
@Component({
  selector: 'app-parent-solutions',
  imports: [FormsModule, Section, RichHtml],
  templateUrl: './parent-solutions.html',
  styleUrl: './parent-solutions.scss',
})
export class ParentSolutions {
  private loader = inject(PackLoader);
  protected readonly packs = signal<Pack[]>([]);
  protected readonly topicId = signal('');
  protected readonly topics = computed(() => this.packs().flatMap((p) => p.topics.filter((t) => t.solutionHtml).map((t) => ({ id: `${p.id}/${t.id}`, title: `${p.title}: ${t.title}`, html: t.solutionHtml! }))));
  protected readonly current = computed(() => this.topics().find((t) => t.id === this.topicId()) ?? null);

  constructor() {
    Promise.all(SOLUTION_PACKS.map((id) => this.loader.load(id))).then((ps) => this.packs.set(ps));
  }
}
