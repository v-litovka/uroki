import { Routes, RedirectFunction } from '@angular/router';
import { inject } from '@angular/core';
import { Shell } from './features/shell/shell';
import { ProfileService } from './core/profile/profile.service';

const toLastGrade: RedirectFunction = () => String(inject(ProfileService).lastGrade());

/**
 * Адреса (hash-маршруты, т. к. GitHub Pages не отдаёт index.html на глубокие ссылки):
 *   #/3                         — хаб 3 класса
 *   #/3/ru/rabota               — пак (список тем)
 *   #/3/ru/rabota/tsa           — тема (правило + режимы)
 *   #/3/ru/rabota/tsa/choose    — раунд
 * Будущее: #/admin/... — админка (lazy), #/me — профиль ребёнка.
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: toLastGrade },
      { path: ':grade', loadComponent: () => import('./features/hub/hub').then((m) => m.Hub) },
      { path: ':grade/:subject/:pack', loadComponent: () => import('./features/pack/pack-page').then((m) => m.PackPage) },
      { path: ':grade/:subject/:pack/:topic', loadComponent: () => import('./features/topic/topic-page').then((m) => m.TopicPage) },
      { path: ':grade/:subject/:pack/:topic/:mode', loadComponent: () => import('./features/play/play-page').then((m) => m.PlayPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
