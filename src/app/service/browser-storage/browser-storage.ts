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

  storePlayers(value: Map<string, Player>): void {
    console.count('storePlayers called');
    const convertedPlayers = Array.from(value.values()).map((player) => {
      const score = Object.fromEntries(player.score || new Map<number, number>());
      return { ...player, score };
    });

    localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(convertedPlayers));
  }

  /**
   * Retrieves players from local storage
   */
  retrievePlayers(): Map<string, Player> | null {
    console.count('retrievePlayers called');
    const data = localStorage.getItem(this.PLAYERS_KEY);
    const serialized = data ? JSON.parse(data) : null;
    if (!serialized) {
      return null;
    }
    const players: Map<string, Player> = new Map(
      serialized.map((player: { name: string; score: Record<string, number> }) => [
        player.name,
        {
          name: player.name,
          score: new Map(
            Object.entries(player.score || {}).map(([key, value]) => [
              Number(key),
              value,
            ])
          ),
        },
      ])
    );
    return players;
  }

  /**
   * Deletes local storage
   */
  delete(): void {
    localStorage.removeItem(this.PLAYERS_KEY);
  }
}
