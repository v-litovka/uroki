import { TestBed } from '@angular/core/testing';
import { KV_STORE, MemoryKeyValueStore } from '../storage/key-value-store';
import { FamilyService } from './family.service';
import { WordsService } from '../words/words.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { Assignment, Pet, RoundRecord } from '../models';
import { petPhrase } from '../../engine/phrases';
import { petSvg } from '../../shared/ui/pet-avatar/pet-svg';
import { alternatives, buildMyWordsPack } from '../../content/custom/my-words';
import { matches } from '../../shared/utils/text';

describe('Семья', () => {
  let kv: MemoryKeyValueStore;
  beforeEach(() => {
    kv = new MemoryKeyValueStore();
    TestBed.configureTestingModule({ providers: [{ provide: KV_STORE, useValue: kv }] });
  });

  it('по умолчанию: один ребёнок «me» (старый прогресс), Вира и Венди, PIN 2924', () => {
    kv.set('ng-profiles', { grade: 4 });
    const f = TestBed.inject(FamilyService);
    expect(f.current().id).toBe('me');
    expect(f.current().grade).toBe(4);
    expect(f.currentPets().map((p) => p.name)).toEqual(['Вира', 'Венди']);
    expect(f.checkPin('2924')).toBe(true);
  });

  it('второй ребёнок, свои питомцы, переключение', () => {
    const f = TestBed.inject(FamilyService);
    const luna = f.savePet({ name: 'Луна', kind: 'dog', sex: 'f', look: { body: '#6b6f76', marks: '#222222', pattern: 'plain', build: 'normal' } });
    const kid = f.addChild({ name: 'Аня', grade: 4, avatar: '🐼', petIds: [luna.id], settings: { roundSize: 5, hiddenGames: [] } });
    f.switchTo(kid.id);
    expect(f.current().name).toBe('Аня');
    expect(f.currentPets().map((p) => p.name)).toEqual(['Луна']);
    f.removePet(luna.id);
    expect(f.currentPets()).toEqual([]);
  });

  it('слова: разбор «кОрова — коровы»', () => {
    expect(WordsService.parse('кОрова — коровы')).toEqual({ word: 'корова', tricky: [1], check: 'коровы' });
    expect(WordsService.parse('аККуратно')).toEqual({ word: 'аккуратно', tricky: [1, 2], check: undefined });
    expect(WordsService.parse('корова')).toBeNull(); // нет трудных букв
  });

  it('задание выполняется по истории раундов', () => {
    const a: Assignment = { id: 'a', childId: 'me', entryId: 'rabota', packId: 'p', subject: 'ru', grade: 3, topicId: 't', modeId: '*', title: 'x', rounds: 2, createdAt: 1000, due: '2026-10-20' };
    const r = (t: number, mode = 'm'): RoundRecord => ({ t, pack: 'p', topic: 't', mode, packTitle: '', topicTitle: '', modeTitle: '', firstTry: 1, total: 1, stars: 1 });
    const today = new Date('2026-10-24');
    expect(AssignmentsService.status(a, [r(500), r(2000)], today)).toMatchObject({ done: 1, complete: false, overdue: true });
    expect(AssignmentsService.status(a, [r(2000), r(3000, 'other')], today)).toMatchObject({ done: 2, complete: true, completedAt: 3000 });
  });
});

describe('Питомцы', () => {
  const base: Pet = { id: 'x', name: 'Барсик', kind: 'cat', sex: 'm', look: { body: '#e8964a', marks: '#6e5a46', pattern: 'stripes', build: 'fat' } };

  it('фразы по полу питомца', () => {
    for (let i = 0; i < 30; i++) {
      const t = petPhrase(base, true) + petPhrase(base, false);
      expect(t).not.toMatch(/[{}|]/);
      expect(t).not.toMatch(/покаталась|подняла|легла|довольна/);
    }
    expect(petPhrase(null, true)).not.toMatch(/Вира|Венди/);
  });

  it('рисунок для всех вариантов', () => {
    for (const kind of ['cat', 'dog'] as const)
      for (const build of ['fat', 'normal', 'thin'] as const)
        for (const pattern of ['plain', 'spots', 'stripes'] as const) {
          const svg = petSvg({ ...base, kind, look: { ...base.look, build, pattern } }, 'sad', 60);
          expect(svg).toMatch(/^<svg[\s\S]*<\/svg>$/);
          expect(svg).not.toMatch(/undefined|NaN/);
        }
  });
});

describe('Мои слова', () => {
  it('из слов взрослого собираются корректные упражнения', () => {
    const words = ['кОрова', 'аККуратно', 'вОрОбей', 'пальтО — пальто', 'бЕрёза'].map((l, i) => ({ ...WordsService.parse(l)!, id: 'w' + i, addedAt: 0 }));
    const pack = buildMyWordsPack(words, 3);
    for (const t of pack.topics)
      for (const m of t.modes)
        for (const it of t.items)
          for (let k = 0; k < 5; k++) {
            const ex = m.build(it);
            for (const st of ex.steps) {
              if (st.kind === 'choice') {
                expect(st.options).toContain(st.answer);
                expect(new Set(st.options).size).toBe(st.options.length);
              }
              if (st.kind === 'input') expect(matches(String(st.answer), st.answer)).toBe(true);
            }
          }
    expect(alternatives('кк')).toEqual(['к']);
    expect(alternatives('о')).toEqual(['а']);
  });
});
