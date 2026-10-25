import { RedirectFunction, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Shell } from './features/shell/shell';
import { FamilyService } from './core/family/family.service';
import { parentGuard } from './core/family/parent-session';

const toChildGrade: RedirectFunction = () => String(inject(FamilyService).current().grade);

/**
 * Адреса (hash-маршруты, т. к. GitHub Pages не отдаёт index.html на глубокие ссылки):
 *   #/3                         — хаб 3 класса
 *   #/3/ru/rabota               — пак (список тем)
 *   #/3/ru/rabota/tsa           — тема (правило + режимы)
 *   #/3/ru/rabota/tsa/choose    — раунд
 *   #/me                        — кабинет ребёнка
 *   #/parent/...                — кабинет взрослого (PIN)
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: toChildGrade },
      { path: 'me', loadComponent: () => import('./features/me/me-page').then((m) => m.MePage) },
      { path: 'parent/login', loadComponent: () => import('./features/parent/login/parent-login').then((m) => m.ParentLogin) },
      {
        path: 'parent',
        canActivate: [parentGuard],
        loadComponent: () => import('./features/parent/shell/parent-shell').then((m) => m.ParentShell),
        children: [
          { path: '', loadComponent: () => import('./features/parent/progress/parent-progress').then((m) => m.ParentProgress) },
          { path: 'tasks', loadComponent: () => import('./features/parent/tasks/parent-tasks').then((m) => m.ParentTasks) },
          { path: 'words', loadComponent: () => import('./features/parent/words/parent-words').then((m) => m.ParentWords) },
          { path: 'pets', loadComponent: () => import('./features/parent/pets/parent-pets').then((m) => m.ParentPets) },
          { path: 'children', loadComponent: () => import('./features/parent/children/parent-children').then((m) => m.ParentChildren) },
          { path: 'solutions', loadComponent: () => import('./features/parent/solutions/parent-solutions').then((m) => m.ParentSolutions) },
        ],
      },
      { path: ':grade', loadComponent: () => import('./features/hub/hub').then((m) => m.Hub) },
      { path: ':grade/:subject/:pack', loadComponent: () => import('./features/pack/pack-page').then((m) => m.PackPage) },
      { path: ':grade/:subject/:pack/:topic', loadComponent: () => import('./features/topic/topic-page').then((m) => m.TopicPage) },
      { path: ':grade/:subject/:pack/:topic/:mode', loadComponent: () => import('./features/play/play-page').then((m) => m.PlayPage) },
    ],
  },
  { path: '**', redirectTo: '' },
];
