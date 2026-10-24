import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WordsService } from '../../../core/words/words.service';
import { Button, Field, Section } from '../../../shared/ui';
import { ParentState } from '../parent-state';

/** Словарные слова ребёнка: по одному (нажать трудные буквы) или списком («кОрова»). */
@Component({
  selector: 'app-parent-words',
  imports: [FormsModule, Section, Field, Button],
  templateUrl: './parent-words.html',
  styleUrl: './parent-words.scss',
})
export class ParentWords {
  private state = inject(ParentState);
  protected words = inject(WordsService);
  protected readonly list = computed(() => this.words.list(this.state.childId()));

  protected readonly word = signal('');
  protected readonly tricky = signal<number[]>([]);
  protected check = '';
  protected bulk = '';
  protected readonly bulkMsg = signal('');
  protected readonly letters = computed(() => [...this.word().trim().toLowerCase()]);

  setWord(v: string) {
    this.word.set(v);
    this.tricky.set([]);
  }
  toggle(i: number) {
    this.tricky.update((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));
  }
  addOne() {
    const w = this.word().trim().toLowerCase();
    if (!w || !this.tricky().length) return;
    this.words.add(this.state.childId(), { word: w, tricky: this.tricky(), check: this.check.trim() || undefined });
    this.setWord('');
    this.check = '';
  }
  addBulk() {
    let ok = 0;
    const bad: string[] = [];
    for (const line of this.bulk.split(/\n/).map((l) => l.trim()).filter(Boolean)) {
      const p = WordsService.parse(line);
      if (p) {
        this.words.add(this.state.childId(), p);
        ok++;
      } else bad.push(line);
    }
    this.bulkMsg.set(`Добавлено: ${ok}.` + (bad.length ? ` Не понял: ${bad.join(', ')} — отметьте трудные буквы заглавными.` : ''));
    if (!bad.length) this.bulk = '';
  }
  remove(id: string) {
    this.words.remove(this.state.childId(), id);
  }
  marked(word: string, tricky: number[]) {
    return [...word].map((ch, i) => ({ ch, t: tricky.includes(i) }));
  }
}
