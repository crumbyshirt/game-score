import { Injectable } from '@angular/core';
import { Player } from '../../models/Player';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorage {
  private readonly PLAYERS_KEY = 'gamescore-players';
  private readonly PICKER_MODE_KEY = 'gamescore-picker-mode';

  /** Saves players to local storage */
  storePlayers(value: Map<string, Player>): void {
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

  /** Saves the picker animation mode preference */
  storePickerMode(mode: string): void {
    localStorage.setItem(this.PICKER_MODE_KEY, mode);
  }

  /** Retrieves the picker animation mode preference */
  retrievePickerMode(): string | null {
    return localStorage.getItem(this.PICKER_MODE_KEY);
  }
}
