import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default: start at player input
  { path: '', pathMatch: 'full', redirectTo: 'players' },

  // Player input names feature
  {
    path: 'players',
    loadComponent: () => import('./components/input-names/input-names').then((m) => m.InputNames),
  },

  // Active game display feature
  {
    path: 'game',
    loadComponent: () => import('./components/active-game/active-game').then((m) => m.ActiveGame),
  },

  // Fallback to player input
  { path: '**', redirectTo: 'players' },
];
