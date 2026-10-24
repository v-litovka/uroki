import { Component, effect, inject, input } from '@angular/core';
import { Prompt } from '../../core/models';
import { SpeechService } from '../../core/audio/speech.service';
import { BigWord, Hint, Poem, SayButton, Sentence } from '../../shared/ui';

/** «Сцена» упражнения: 🔊 / предложение / крупное слово / подсказка. Озвучивает новый текст сама. */
@Component({
  selector: 'app-prompt-view',
  imports: [Poem, Sentence, BigWord, Hint, SayButton],
  templateUrl: './prompt-view.html',
  styleUrl: './prompt-view.scss',
})
export class PromptView {
  readonly prompt = input.required<Prompt>();
  protected speech = inject(SpeechService);
  private lastSaid = '';

  constructor() {
    effect(() => {
      const { say: t, sayAuto } = this.prompt();
      if (t && sayAuto !== false && t !== this.lastSaid) {
        this.lastSaid = t;
        setTimeout(() => this.speech.say(t), 300);
      }
    });
  }
}
