import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../../../core/family/family.service';
import { AVATARS } from '../../../core/family/default-family';
import { CatalogService } from '../../../core/catalog/catalog.service';
import { Grade, Profile } from '../../../core/models';
import { Button, EmojiPicker, Field, PetAvatar, Section, SegOption, Segmented } from '../../../shared/ui';

type Draft = Omit<Profile, 'id' | 'role'> & { id?: string };

/** Дети и «уровни»: имя, аватар, класс, заданий в раунде, какие игры показывать, питомцы. PIN взрослого. */
@Component({
  selector: 'app-parent-children',
  imports: [FormsModule, Section, Field, Segmented, EmojiPicker, PetAvatar, Button],
  templateUrl: './parent-children.html',
  styleUrl: './parent-children.scss',
})
export class ParentChildren {
  protected family = inject(FamilyService);
  private catalog = inject(CatalogService);
  protected readonly AVATARS = AVATARS;
  protected readonly grades: SegOption<Grade>[] = [{ value: 3, label: '3 класс' }, { value: 4, label: '4 класс' }];
  protected readonly sizes: SegOption<number>[] = [5, 10, 15, 20].map((n) => ({ value: n, label: String(n) }));
  protected readonly draft = signal<Draft | null>(null);
  protected readonly games = computed(() => {
    const d = this.draft();
    return d ? this.catalog.all().filter((e) => e.grade === d.grade) : [];
  });
  protected newPin = '';
  protected readonly pinMsg = signal('');

  edit(c?: Profile) {
    this.draft.set(c ? structuredClone(c) : { name: '', grade: 3, avatar: '🦊', petIds: [], settings: { roundSize: 10, hiddenGames: [] } });
  }
  patch(p: Partial<Draft>) {
    this.draft.update((d) => (d ? { ...d, ...p } : d));
  }
  setting(p: Partial<Profile['settings']>) {
    this.draft.update((d) => (d ? { ...d, settings: { ...d.settings, ...p } } : d));
  }
  togglePet(id: string) {
    const d = this.draft()!;
    this.patch({ petIds: d.petIds.includes(id) ? d.petIds.filter((x) => x !== id) : [...d.petIds, id] });
  }
  toggleGame(id: string) {
    const h = this.draft()!.settings.hiddenGames;
    this.setting({ hiddenGames: h.includes(id) ? h.filter((x) => x !== id) : [...h, id] });
  }
  save() {
    const d = this.draft();
    if (!d || !d.name.trim()) return;
    const { id, ...rest } = d;
    if (id) this.family.updateChild(id, { ...rest, name: rest.name.trim() });
    else this.family.addChild({ ...rest, name: rest.name.trim() });
    this.draft.set(null);
  }
  /** удаление — с подтверждением (вторым нажатием), без браузерных диалогов */
  protected readonly confirmId = signal<string | null>(null);
  remove(c: Profile) {
    if (this.confirmId() !== c.id) return this.confirmId.set(c.id);
    this.family.removeChild(c.id);
    this.confirmId.set(null);
  }
  changePin() {
    if (/^\d{4,8}$/.test(this.newPin)) {
      this.family.setPin(this.newPin);
      this.pinMsg.set('PIN изменён.');
      this.newPin = '';
    } else this.pinMsg.set('PIN — от 4 до 8 цифр.');
  }
}
