import { Injectable } from '@angular/core';
import { Player } from '../../models/Player';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorage {
  private readonly PLAYERS_KEY = 'gamescore-players';

  /**
   * Saves to local storage
   * @param value object to store
   */
  // storePlayers(value: object): void {
  //   localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(value));
  // }

  storePlayers(value: Player[]): void {
    console.count('storePlayers called');
    const convertedPlayers = value.map((player) => {
      const score = Object.fromEntries(player.score || new Map<number, number>());
      return { ...player, score };
    });

    localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(convertedPlayers));
  }

  /**
   * Retrieves playersfrom local storage
   */
  retrievePlayers() {
    console.count('retrievePlayers called');
    const data = localStorage.getItem(this.PLAYERS_KEY);
    const serialized = data ? JSON.parse(data) : null;
    if (!serialized) {
      return null;
    }
    const players: Player[] = serialized.map((player: { score: string }) => ({
      ...player,
      score: new Map(Object.entries(player.score || {})),
    }));
    return players;
  }

  /**
   * Deletes local storage
   */
  delete(): void {
    localStorage.removeItem(this.PLAYERS_KEY);
  }
}
