import { Injectable, computed, inject, signal } from '@angular/core';
import { KV_STORE } from '../storage/key-value-store';
import { Grade, Pet, Profile } from '../models';
import { DEFAULT_CHILD, DEFAULT_PETS, DEFAULT_PIN } from './default-family';

const KEY = 'ng-family';
const OLD_KEY = 'ng-profiles';

interface FamilyState {
  children: Profile[];
  current: string;
  pets: Pet[];
  pin: string;
}

const uid = () => Math.random().toString(36).slice(2, 9);

/**
 * Семья на этом устройстве: дети, текущий игрок, питомцы, PIN взрослого.
 * Прогресс каждого ребёнка хранится под его id (см. ProgressService).
 */
@Injectable({ providedIn: 'root' })
export class FamilyService {
  private kv = inject(KV_STORE);
  private state = signal<FamilyState>(this.load());

  readonly children = computed(() => this.state().children);
  readonly pets = computed(() => this.state().pets);
  readonly current = computed(() => this.state().children.find((c) => c.id === this.state().current) ?? this.state().children[0]);
  /** питомцы текущего ребёнка */
  readonly currentPets = computed(() => this.petsOf(this.current()));

  private load(): FamilyState {
    const s = this.kv.get<FamilyState | null>(KEY, null);
    if (s) return s;
    // миграция со старого формата (один профиль + последний класс)
    const old = this.kv.get<{ grade?: Grade } | null>(OLD_KEY, null);
    const st: FamilyState = { children: [{ ...DEFAULT_CHILD, grade: old?.grade ?? 3 }], current: 'me', pets: DEFAULT_PETS, pin: DEFAULT_PIN };
    this.kv.set(KEY, st);
    return st;
  }

  private save(fn: (s: FamilyState) => FamilyState) {
    this.state.update(fn);
    this.kv.set(KEY, this.state());
  }

  petsOf(c: Profile | undefined): Pet[] {
    if (!c) return [];
    return c.petIds.map((id) => this.state().pets.find((p) => p.id === id)).filter((p): p is Pet => !!p);
  }

  /* ---------- дети ---------- */
  switchTo(id: string) {
    if (this.state().children.some((c) => c.id === id)) this.save((s) => ({ ...s, current: id }));
  }
  addChild(p: Omit<Profile, 'id' | 'role'>): Profile {
    const child: Profile = { ...p, id: uid(), role: 'child' };
    this.save((s) => ({ ...s, children: [...s.children, child] }));
    return child;
  }
  updateChild(id: string, patch: Partial<Profile>) {
    this.save((s) => ({ ...s, children: s.children.map((c) => (c.id === id ? { ...c, ...patch, id: c.id } : c)) }));
  }
  removeChild(id: string) {
    if (this.state().children.length < 2) return; // хотя бы один ребёнок
    this.save((s) => {
      const children = s.children.filter((c) => c.id !== id);
      return { ...s, children, current: s.current === id ? children[0].id : s.current };
    });
  }
  setGrade(g: Grade) {
    const c = this.current();
    if (c && c.grade !== g) this.updateChild(c.id, { grade: g });
  }

  /* ---------- питомцы ---------- */
  savePet(p: Omit<Pet, 'id'> & { id?: string }): Pet {
    const pet: Pet = { ...p, id: p.id ?? uid() } as Pet;
    this.save((s) => ({ ...s, pets: s.pets.some((x) => x.id === pet.id) ? s.pets.map((x) => (x.id === pet.id ? pet : x)) : [...s.pets, pet] }));
    return pet;
  }
  removePet(id: string) {
    this.save((s) => ({
      ...s,
      pets: s.pets.filter((p) => p.id !== id),
      children: s.children.map((c) => ({ ...c, petIds: c.petIds.filter((x) => x !== id) })),
    }));
  }

  /* ---------- PIN взрослого ---------- */
  checkPin(pin: string) {
    return pin.trim() === this.state().pin;
  }
  setPin(pin: string) {
    if (/^\d{4,8}$/.test(pin)) this.save((s) => ({ ...s, pin }));
  }
}
