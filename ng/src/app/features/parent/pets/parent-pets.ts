import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FamilyService } from '../../../core/family/family.service';
import { COLORS, PET_EMOJI } from '../../../core/family/default-family';
import { Pet, PetBuild, PetKind, PetPattern } from '../../../core/models';
import { Button, EmojiPicker, Field, PetAvatar, Section, SegOption, Segmented, Swatches } from '../../../shared/ui';

type Draft = Omit<Pet, 'id'> & { id?: string };

const blank = (): Draft => ({ name: '', kind: 'cat', sex: 'f', look: { body: '#9aa0a6', marks: '#222222', pattern: 'plain', build: 'normal' } });

/** Питомцы семьи: имя, вид, окрас → рисунок (или иконка); с кем из детей «играет». */
@Component({
  selector: 'app-parent-pets',
  imports: [FormsModule, Section, Field, Segmented, Swatches, EmojiPicker, PetAvatar, Button],
  templateUrl: './parent-pets.html',
  styleUrl: './parent-pets.scss',
})
export class ParentPets {
  protected family = inject(FamilyService);
  protected readonly COLORS = COLORS;
  protected readonly EMOJI = PET_EMOJI;
  protected readonly kinds: SegOption<PetKind>[] = [{ value: 'cat', label: '🐱 Кошка' }, { value: 'dog', label: '🐶 Собака' }];
  protected readonly sexes: SegOption<'f' | 'm'>[] = [{ value: 'f', label: 'Девочка' }, { value: 'm', label: 'Мальчик' }];
  protected readonly builds: SegOption<PetBuild>[] = [{ value: 'fat', label: 'Толстенький' }, { value: 'normal', label: 'Обычный' }, { value: 'thin', label: 'Худенький' }];
  protected readonly patterns: SegOption<PetPattern>[] = [{ value: 'plain', label: 'Однотонный' }, { value: 'spots', label: 'Пятна' }, { value: 'stripes', label: 'Полоски' }];

  protected readonly draft = signal<Draft | null>(null);
  /** дети, с которыми «играет» питомец */
  protected readonly withKids = signal<string[]>([]);
  protected readonly preview = computed<Pet | null>(() => {
    const d = this.draft();
    return d ? ({ ...d, id: d.id ?? 'preview', name: d.name || 'Питомец' } as Pet) : null;
  });

  edit(p?: Pet) {
    this.draft.set(p ? structuredClone(p) : blank());
    this.withKids.set(p ? this.family.children().filter((c) => c.petIds.includes(p.id)).map((c) => c.id) : [this.family.current().id]);
  }
  patch(fn: (d: Draft) => Draft) {
    this.draft.update((d) => (d ? fn(d) : d));
  }
  setName(v: string) {
    this.patch((d) => ({ ...d, name: v }));
  }
  setKind(v: PetKind) {
    this.patch((d) => ({ ...d, kind: v }));
  }
  setSex(v: 'f' | 'm') {
    this.patch((d) => ({ ...d, sex: v }));
  }
  setEmoji(v: string | undefined) {
    this.patch((d) => ({ ...d, emoji: v }));
  }
  look<K extends keyof Pet['look']>(k: K, v: Pet['look'][K]) {
    this.patch((d) => ({ ...d, look: { ...d.look, [k]: v } }));
  }
  toggleKid(id: string) {
    this.withKids.update((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  }
  save() {
    const d = this.draft();
    if (!d || !d.name.trim()) return;
    const pet = this.family.savePet({ ...d, name: d.name.trim() });
    for (const c of this.family.children()) {
      const has = c.petIds.includes(pet.id);
      const want = this.withKids().includes(c.id);
      if (has !== want) this.family.updateChild(c.id, { petIds: want ? [...c.petIds, pet.id] : c.petIds.filter((x) => x !== pet.id) });
    }
    this.draft.set(null);
  }
  /** удаление — вторым нажатием */
  protected readonly confirmId = signal<string | null>(null);
  remove(p: Pet) {
    if (this.confirmId() !== p.id) return this.confirmId.set(p.id);
    this.family.removePet(p.id);
    this.confirmId.set(null);
  }
  kidsOf(p: Pet) {
    return this.family.children().filter((c) => c.petIds.includes(p.id)).map((c) => c.name).join(', ') || 'ни с кем';
  }
}
