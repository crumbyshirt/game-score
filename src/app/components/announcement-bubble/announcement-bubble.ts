import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { AppState } from '../../service/app-state/app-state';

@Component({
  selector: 'app-announcement-bubble',
  imports: [],
  templateUrl: './announcement-bubble.html',
  styleUrl: './announcement-bubble.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementBubble {
  private appState = inject(AppState);

  protected text = signal('');
  protected side = signal<'left' | 'right'>('right');

  private dismissTimer: ReturnType<typeof setTimeout> | null = null;
  private initialized = false;
  private previousLeaderKey = '';

  private readonly topScorers = computed(() => {
    const players = this.appState.players();
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

    return maxScore > 0
      ? [...totals.entries()].filter(([, t]) => t === maxScore).map(([n]) => n)
      : [];
  });

  constructor() {
    effect(() => {
      const leaders = this.topScorers();
      const currentKey = [...leaders].sort().join('|');

      // Skip first run — don't announce the current state on page load
      if (!this.initialized) {
        this.initialized = true;
        this.previousLeaderKey = currentKey;
        return;
      }

      if (currentKey === this.previousLeaderKey) return;
      this.previousLeaderKey = currentKey;

      // Don't announce when everyone is back to zero (e.g. new game reset)
      if (leaders.length === 0) return;

      const message =
        leaders.length === 1
          ? `${leaders[0]} has taken the lead!`
          : `We have a ${leaders.length}-way tie for 1st place!`;

      this.side.set(Math.random() < 0.5 ? 'left' : 'right');
      this.text.set(message);

      if (this.dismissTimer) clearTimeout(this.dismissTimer);
      this.dismissTimer = setTimeout(() => {
        this.text.set('');
        this.dismissTimer = null;
      }, 2000);
    }, { allowSignalWrites: true });
  }
}
