import { TestBed } from '@angular/core/testing';
import { lvlAt, levelOf } from './levels';
import { ProgressService } from './progress.service';
import { KV_STORE, MemoryKeyValueStore } from '../storage/key-value-store';

describe('уровни', () => {
  it('20, 50, 90, 140…', () => {
    expect([1, 2, 3, 4].map(lvlAt)).toEqual([20, 50, 90, 140]);
    expect(levelOf(0)).toBe(0);
    expect(levelOf(49)).toBe(1);
    expect(levelOf(50)).toBe(2);
  });
});

describe('ProgressService', () => {
  let kv: MemoryKeyValueStore;
  beforeEach(() => {
    kv = new MemoryKeyValueStore();
    TestBed.configureTestingModule({ providers: [{ provide: KV_STORE, useValue: kv }] });
  });

  it('переносит звёзды из legacy-ключа один раз', () => {
    kv.set('old-key', { stars: 42, done: { 'tsa:choose': 1 }, sfx: true });
    const h = TestBed.inject(ProgressService).pack('p1', 'old-key');
    expect(h.stars()).toBe(42);
    expect(h.isDone('tsa', 'choose')).toBe(true);
    kv.set('old-key', { stars: 999, done: {} });
    expect(TestBed.inject(ProgressService).pack('p1', 'old-key').stars()).toBe(42);
  });

  it('звёзды и новый уровень', () => {
    const h = TestBed.inject(ProgressService).pack('p2');
    expect(h.addStars(19)).toBe(false);
    expect(h.addStars(1)).toBe(true);
    expect(h.level()).toBe(1);
  });

  it('журнал попыток', () => {
    const s = TestBed.inject(ProgressService);
    s.logAttempt({ pack: 'p', topic: 't', mode: 'm', item: 'i1', ok: false });
    expect(s.attempts()[0].item).toBe('i1');
  });
});
