import { Injectable, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';

type Sound = 'ok' | 'bad' | 'tap' | 'fin';

/** Короткие звуки WebAudio (без файлов). Вкл/выкл — общий переключатель. */
@Injectable({ providedIn: 'root' })
export class SfxService {
  private kv = inject(KV_STORE);
  readonly on = signal(this.kv.get('ng-sfx', true));
  private ac: AudioContext | null = null;

  toggle() {
    this.on.update((v) => !v);
    this.kv.set('ng-sfx', this.on());
  }

  play(s: Sound) {
    if (!this.on()) return;
    try {
      const notes: Record<Sound, [number, number, number, OscillatorType?, number?][]> = {
        ok: [[784, 0, 0.25], [1047, 0.11, 0.25], [1319, 0.22, 0.25]],
        bad: [[220, 0, 0.25, 'sawtooth', 0.12], [180, 0.18, 0.3, 'sawtooth', 0.1]],
        tap: [[880, 0, 0.06, 'triangle', 0.12]],
        fin: [[523, 0, 0.35], [659, 0.14, 0.35], [784, 0.28, 0.35], [1047, 0.42, 0.35]],
      };
      notes[s].forEach(([f, t, d, type, v]) => this.tone(f, t, d, type, v));
    } catch {
      /* нет звука — не страшно */
    }
  }

  private tone(f: number, t: number, d: number, type: OscillatorType = 'sine', v = 0.15) {
    const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
    const Ctor = W.AudioContext ?? W.webkitAudioContext;
    if (!Ctor) return;
    this.ac ??= new Ctor();
    const ac = this.ac;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(v, ac.currentTime + t);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + d);
    o.connect(g).connect(ac.destination);
    o.start(ac.currentTime + t);
    o.stop(ac.currentTime + t + d + 0.05);
  }
}
