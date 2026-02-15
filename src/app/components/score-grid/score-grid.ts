import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AppState } from '../../service/app-state/app-state';
import { GridBox } from '../grid-box/grid-box';
import { NamePlate } from '../name-plate/name-plate';

@Component({
  selector: 'app-score-grid',
  imports: [CommonModule, NamePlate, GridBox],
  templateUrl: './score-grid.html',
  styleUrl: './score-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreGrid {
  /** The players to display in the grid */
  players = inject(AppState).players;

  /** Track the minimum number of rounds to display */
  minRounds = signal(1);

  /** Compute the list of rounds from the players' score maps (1-based round numbers) */
  rounds = computed(() => {
    const players = this.players();
    let max = this.minRounds();
    for (const p of players.values()) {
      const map = p.score;
      if (map) {
        for (const k of map.keys()) {
          const n = Number(k);
          if (!Number.isNaN(n) && n > max) {
            max = n;
          }
        }
      }
    }
    return Array.from({ length: max }, (_, i) => i + 1);
  });

  scoreUpdate(
    player: { name: string; score?: Map<number, number | null> },
    round: number,
    score: number | null,
  ): void {
    if (!player.score) {
      player.score = new Map<number, number>();
    }
    player.score.set(round, score);
    // Trigger the signal update by creating a new Map reference
    this.players.set(new Map(this.players()));
  }

  addRound(): void {
    this.minRounds.set(this.rounds().length + 1);
  }
}
