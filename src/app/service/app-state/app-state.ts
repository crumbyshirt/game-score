import { effect, Injectable, signal } from '@angular/core';
import { Player } from '../../models/Player';

/** Maintains the global application state */
@Injectable({
  providedIn: 'root',
})
export class AppState {
  readonly players = signal<Player[]>([
    { name: 'Alice', score: 10 },
    { name: 'Bob', score: 15 },
  ]);

  constructor() {
    effect(() => {
      this.players().forEach((player) => {
        console.log(`Player: ${player.name}, Score: ${player.score ?? 0}`);
      });
    });
  }
}
