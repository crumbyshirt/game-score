import { effect, inject, Injectable, signal } from '@angular/core';
import { Player } from '../../models/Player';
import { BrowserStorage } from '../browser-storage/browser-storage';
import { FirebaseService } from '../firebase/firebase.service';

/** Maintains the global application state */
@Injectable({
  providedIn: 'root',
})
export class AppState {
  private browserStorageSvc = inject(BrowserStorage);
  private firebaseSvc = inject(FirebaseService);

  /** Map of players by name
   * Default players are provided for first-time users
   */
  readonly players = signal<Map<string, Player>>(
    new Map([
      ['Player 1', { name: 'Player 1', score: new Map<number, number>() }],
      ['Player 2', { name: 'Player 2', score: new Map<number, number>() }],
    ])
  );

  /** The active multiplayer session code, or null for solo play */
  readonly sessionCode = signal<string | null>(null);

  /** Minimum number of rounds to display in the score grid */
  readonly minRounds = signal(1);

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
    this.minRounds.set(1);
  }

  /**
   * Sets the minimum round count locally and syncs to Firebase if in a session.
   */
  setMinRounds(n: number): void {
    this.minRounds.set(n);
    const code = this.sessionCode();
    if (code) {
      void this.firebaseSvc.updateMinRounds(code, n);
    }
  }

  /**
   * Sets the minimum round count from a remote Firebase snapshot.
   * Does NOT trigger a Firebase write.
   */
  setMinRoundsFromRemote(n: number): void {
    this.minRounds.set(n);
  }

  /**
   * Updates a score locally and syncs to Firebase if in a session.
   * Use this instead of directly mutating players for score changes.
   */
  updateScore(playerName: string, round: number, score: number | null): void {
    const current = this.players();
    const player = current.get(playerName);
    if (!player) return;
    if (!player.score) {
      player.score = new Map<number, number | null>();
    }
    player.score.set(round, score);
    this.players.set(new Map(current));

    const code = this.sessionCode();
    if (code) {
      this.firebaseSvc.updateScore(code, playerName, round, score);
    }
  }

  /**
   * Updates the player list locally and syncs to Firebase if in a session.
   * Use this for all local player add/remove/reorder changes.
   */
  updatePlayers(names: string[]): void {
    const current = this.players();
    const merged = new Map<string, Player>();
    for (const name of names) {
      merged.set(name, current.get(name) ?? { name, score: new Map<number, number>() });
    }
    this.players.set(merged);

    const code = this.sessionCode();
    if (code) {
      void this.firebaseSvc.updatePlayers(code, names);
    }
  }

  /**
   * Updates players from a remote Firebase snapshot.
   * Does NOT trigger a Firebase write (prevents sync loops).
   */
  setPlayersFromRemote(remoteMap: Map<string, Player>): void {
    this.players.set(remoteMap);
  }
}
