import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { lvlAt, levelOf } from './core/progress';
import { GAMES } from './core/games';

describe('App', () => {
  it('создаётся', async () => {
    await TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] }).compileComponents();
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy();
  });

  it('уровни: 20, 50, 90, 140…', () => {
    expect([1, 2, 3, 4].map(lvlAt)).toEqual([20, 50, 90, 140]);
    expect(levelOf(0)).toBe(0);
    expect(levelOf(49)).toBe(1);
    expect(levelOf(50)).toBe(2);
  });

  it('у каждой игры есть путь', () => {
    for (const g of GAMES) expect(g.status === 'legacy' ? g.legacy : g.route).toBeTruthy();
  });
});
