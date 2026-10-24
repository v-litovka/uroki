import { Injectable, signal } from '@angular/core';
import { Capability } from '../models';

/**
 * Озвучка через speechSynthesis. Режимы с needs: ['tts-ru'] показываются,
 * только если на устройстве есть такой голос. В Capacitor можно подменить плагином.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  private voices = signal<SpeechSynthesisVoice[]>([]);

  constructor() {
    try {
      const load = () => this.voices.set(speechSynthesis.getVoices());
      load();
      speechSynthesis.onvoiceschanged = load;
    } catch {
      /* нет API */
    }
  }

  private voice(lang: 'ru' | 'en') {
    return this.voices().find((v) => v.lang.toLowerCase().startsWith(lang)) ?? null;
  }

  has(c: Capability) {
    return !!this.voice(c === 'tts-ru' ? 'ru' : 'en');
  }

  say(text: string, lang: 'ru' | 'en' = 'ru') {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ru' ? 'ru-RU' : 'en-GB';
      const v = this.voice(lang);
      if (v) u.voice = v;
      u.rate = 0.8;
      speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }

  stop() {
    try {
      speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}
