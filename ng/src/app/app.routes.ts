import { Routes } from '@angular/router';
import { Hub } from './hub/hub';
import { store } from './core/progress';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: () => String(store.get('ng-grade', 3)) },
  { path: ':grade', component: Hub },
  // Сюда добавляются игры, переписанные на Angular, например:
  // { path: 'play/stih', loadComponent: () => import('./games/stih/stih').then(m => m.Stih) },
  { path: '**', redirectTo: '' },
];
