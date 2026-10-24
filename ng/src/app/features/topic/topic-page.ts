import { Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { usePack } from '../pack/use-pack';
import { ProgressService } from '../../core/progress/progress.service';
import { HeaderService } from '../../core/layout/header.service';
import { SpeechService } from '../../core/audio/speech.service';
import { ModeItem, PageHero, RuleBox } from '../../shared/ui';
import { LangService } from '../../core/i18n/lang.service';

/** Тема: правило + список режимов. #/:grade/:subject/:pack/:topic */
@Component({
  selector: 'app-topic-page',
  imports: [RouterLink, PageHero, RuleBox, ModeItem],
  templateUrl: './topic-page.html',
  styleUrl: './topic-page.scss',
})
export class TopicPage {
  readonly grade = input('3');
  readonly subject = input('');
  readonly pack = input('');
  readonly topic = input('');
  protected p = usePack(this.grade, this.subject, this.pack);
  private progress = inject(ProgressService);
  private speech = inject(SpeechService);
  protected readonly i18n = inject(LangService);
  protected topicObj = computed(() => this.p.pack()?.topics.find((t) => t.id === this.topic()));
  protected modes = computed(() => (this.topicObj()?.modes ?? []).filter((m) => !m.needs || m.needs.every((c) => this.speech.has(c))));
  protected hiddenVoice = computed(() => (this.topicObj()?.modes.length ?? 0) > this.modes().length);

  constructor() {
    const header = inject(HeaderService);
    effect(() => {
      const pk = this.p.pack();
      const pr = pk ? this.progress.pack(pk.id, pk.legacyStorageKey) : null;
      header.set({ back: `/${this.grade()}/${this.subject()}/${this.pack()}`, stars: pr?.stars ?? null, level: pr?.level ?? null });
    });
  }

  protected isDone(mode: string) {
    const pk = this.p.pack();
    return !!pk && this.progress.pack(pk.id, pk.legacyStorageKey).isDone(this.topic(), mode);
  }
}
