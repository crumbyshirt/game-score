import { effect, inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/Player';
import { BrowserStorage } from '../browser-storage/browser-storage';

/** Maintains the global application state */
@Injectable({
  providedIn: 'root',
})
export class AppState {
  private browserStorageSvc = inject(BrowserStorage);

  /** List of players
   * Default players are provided for first-time users
   */
  readonly players = signal<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 },
  ]);

  constructor() {
    this.loadPlayers();

    effect(() => {
      this.browserStorageSvc.storePlayers(this.players());
    });
  }

  /** Loads players from browser storage */
  loadPlayers(): void {
    const storedPlayers = this.browserStorageSvc.retrievePlayers<Player[]>();
    if (storedPlayers) {
      this.players.set(storedPlayers);
    }
  }
}
