import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { AppState } from '../../service/app-state/app-state';

/**
 * Component to display the total scores for all players.
 */
@Component({
  selector: 'app-total-score',
  imports: [CommonModule],
  templateUrl: './total-score.html',
  styleUrl: './total-score.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalScore {
  private appState = inject(AppState);

  players = this.appState.players;

  totals = computed(() => {
    const players = this.players();
    const result = [];
    for (const p of players.values()) {
      let sum = 0;
      if (p.score) {
        for (const val of p.score.values()) {
          if (val !== null) sum += val;
        }
      }
      result.push({ name: p.name, total: sum });
    }
    return result;
  });
}
