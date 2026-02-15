import { effect, inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/Player';
import { BrowserStorage } from '../browser-storage/browser-storage';

/** Maintains the global application state */
@Injectable({
  providedIn: 'root',
})
export class AppState {
  private browserStorageSvc = inject(BrowserStorage);

  /** Map of players by name
   * Default players are provided for first-time users
   */
  readonly players = signal<Map<string, Player>>(
    new Map([
      ['Player 1', { name: 'Player 1', score: new Map<number, number>() }],
      ['Player 2', { name: 'Player 2', score: new Map<number, number>() }],
    ])
  );

  constructor() {
    this.loadPlayers();

    effect(() => {
      this.browserStorageSvc.storePlayers(this.players());
    });
  }

  /** Loads players from browser storage */
  loadPlayers(): void {
    const storedPlayers = this.browserStorageSvc.retrievePlayers();
    if (storedPlayers) {
      this.players.set(storedPlayers);
    }
  }

  /** Resets all scores but keeps player names */
  resetScores(): void {
    const current = this.players();
    const reset = new Map<string, Player>();
    for (const [name] of current) {
      reset.set(name, { name, score: new Map<number, number>() });
    }
    this.players.set(reset);
  }
}
