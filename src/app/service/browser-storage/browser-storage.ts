import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BrowserStorage {
  private readonly PLAYERS_KEY = 'gamescore-players';

  /**
   * Saves to local storage
   * @param value object to store
   */
  storePlayers(value: object): void {
    localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(value));
  }

  /**
   * Retrieves playersfrom local storage
   */
  retrievePlayers<T>(): T | null {
    const data = localStorage.getItem(this.PLAYERS_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Deletes local storage
   */
  delete(): void {
    localStorage.removeItem(this.PLAYERS_KEY);
  }
}
