import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { usePack } from './use-pack';
import { ProgressService } from '../../core/progress/progress.service';
import { HeaderService } from '../../core/layout/header.service';
import { SpeechService } from '../../core/audio/speech.service';
import { LEGACY_FALLBACK } from '../../core/catalog/entries';
import { Topic } from '../../core/models';
import { PageHero, PetGroup, TopicCard } from '../../shared/ui';
import { FamilyService } from '../../core/family/family.service';
import { LangService } from '../../core/i18n/lang.service';

/** Страница пака: список тем. #/:grade/:subject/:pack */
@Component({
  selector: 'app-pack-page',
  imports: [RouterLink, PageHero, PetGroup, TopicCard],
  templateUrl: './pack-page.html',
  styleUrl: './pack-page.scss',
})
export class PackPage {
  readonly grade = input('3');
  readonly subject = input('');
  readonly pack = input('');
  protected p = usePack(this.grade, this.subject, this.pack);
  private progress = inject(ProgressService);
  private speech = inject(SpeechService);
  private family = inject(FamilyService);
  protected readonly i18n = inject(LangService);
  protected pets = computed(() => (this.p.pack()?.mascot === 'pets' ? this.family.currentPets().filter((x) => (this.p.pack()!.grade < 4 ? true : x.kind !== 'cat')) : []));
  protected legacy = computed(() => (this.p.pack() ? LEGACY_FALLBACK[this.p.pack()!.id] : null));

  constructor() {
    const header = inject(HeaderService);
    effect(() => {
      const pk = this.p.pack();
      const pr = pk ? this.progress.pack(pk.id, pk.legacyStorageKey) : null;
      header.set({ back: '/' + this.grade(), stars: pr?.stars ?? null, level: pr?.level ?? null, accent: pk?.color ?? null });
    });
  }

  protected badge(t: Topic) {
    const pk = this.p.pack()!;
    const pr = this.progress.pack(pk.id, pk.legacyStorageKey);
    if (pk.leitner) {
      const ids = (t.items as { id: string }[]).map((x) => x.id);
      return this.i18n.t('know', { k: ids.filter((id) => pr.box(id) === 2).length, n: ids.length });
    }
    const ms = t.modes.filter((m) => !m.needs || m.needs.every((c) => this.speech.has(c)));
    return `${ms.filter((m) => pr.isDone(t.id, m.id)).length} / ${ms.length}`;
  }
}
