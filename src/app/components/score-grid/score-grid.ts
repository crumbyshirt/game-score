import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal } from '@angular/core';
import { AppState } from '../../service/app-state/app-state';
import { GridBox } from '../grid-box/grid-box';
import { NamePlate } from '../name-plate/name-plate';

@Component({
  selector: 'app-score-grid',
  imports: [CommonModule, NamePlate, GridBox],
  templateUrl: './score-grid.html',
  styleUrl: './score-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(scroll)': 'onScroll($event)',
  },
})
export class ScoreGrid {
  /** The players to display in the grid */
  players = inject(AppState).players;

  /** Track the minimum number of rounds to display */
  minRounds = signal(1);

  /** Track whether the grid has scrolled (used by parent and for compact name plates) */
  isScrolled = signal(false);

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

  /** Map of player name → badge emoji for the top scorer(s) */
  protected playerBadges = computed(() => {
    const players = this.players();
    const badges = new Map<string, string>();

    // Calculate totals
    let maxScore = 0;
    const totals = new Map<string, number>();
    for (const p of players.values()) {
      let sum = 0;
      if (p.score) {
        for (const val of p.score.values()) {
          if (val !== null) sum += val;
        }
      }
      totals.set(p.name, sum);
      if (sum > maxScore) maxScore = sum;
    }

    // No badges if nobody has scored
    if (maxScore === 0) return badges;

    // Count how many players share the top score
    const topScorers = [...totals.entries()].filter(([, total]) => total === maxScore);
    const isTie = topScorers.length > 1;

    for (const [name] of topScorers) {
      badges.set(name, isTie ? '\u{1F9D1}\u200D\u{1F91D}\u200D\u{1F9D1}' : '\u{1F947}');
    }

    return badges;
  });

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.isScrolled.set(el.scrollTop > 0);
  }

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
