import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home: create or join a game session
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  {
    path: 'home',
    loadComponent: () => import('./components/home/home').then((m) => m.Home),
  },

  // Player input names feature (solo play)
  {
    path: 'players',
    loadComponent: () => import('./components/input-names/input-names').then((m) => m.InputNames),
  },

  // Active multiplayer game session
  {
    path: 'game/:code',
    loadComponent: () => import('./components/active-game/active-game').then((m) => m.ActiveGame),
  },

  // Active solo game (no code)
  {
    path: 'game',
    loadComponent: () => import('./components/active-game/active-game').then((m) => m.ActiveGame),
  },

  // Random player picker feature
  {
    path: 'picker',
    loadComponent: () =>
      import('./components/player-picker/player-picker').then((m) => m.PlayerPicker),
  },

  // Fallback to home
  { path: '**', redirectTo: 'home' },
];
