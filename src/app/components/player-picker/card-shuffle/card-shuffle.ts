import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

const CARD_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#e84393',
  '#00b894',
  '#6c5ce7',
];

interface CardState {
  name: string;
  color: string;
  flipped: boolean;
  selected: boolean;
  shuffleX: number;
  shuffleY: number;
  rotation: number;
  zIndex: number;
}

@Component({
  selector: 'app-card-shuffle',
  templateUrl: './card-shuffle.html',
  styleUrl: './card-shuffle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardShuffle {
  /** List of player names */
  playerNames = input.required<string[]>();

  /** Increments to trigger a shuffle */
  spinTrigger = input(0);

  /** Emits the winning player name */
  winnerSelected = output<string>();

  /** Cards state array */
  protected cards = signal<CardState[]>([]);

  private isRendered = signal(false);
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  /** Tracks the last trigger value seen so we only shuffle on new triggers */
  private lastSeenTrigger = 0;

  constructor() {
    afterNextRender(() => {
      this.isRendered.set(true);
      this.lastSeenTrigger = this.spinTrigger();
      this.buildCards();
    });

    effect(() => {
      const trigger = this.spinTrigger();
      if (trigger > this.lastSeenTrigger && this.isRendered()) {
        this.lastSeenTrigger = trigger;
        this.startShuffle();
      }
    });

    effect(() => {
      this.playerNames();
      if (this.isRendered()) {
        this.buildCards();
      }
    });
  }

  /** Builds the initial face-up card state */
  private buildCards(): void {
    this.clearTimeouts();
    const names = this.playerNames();
    this.cards.set(
      names.map((name, i) => ({
        name,
        color: CARD_COLORS[i % CARD_COLORS.length],
        flipped: false,
        selected: false,
        shuffleX: 0,
        shuffleY: 0,
        rotation: 0,
        zIndex: 0,
      }))
    );
  }

  private clearTimeouts(): void {
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];
  }

  /** Runs the shuffle animation sequence */
  private startShuffle(): void {
    this.clearTimeouts();
    this.buildCards();

    const names = this.playerNames();
    const winnerIndex = Math.floor(Math.random() * names.length);
    // Running rotation accumulator — each card gets a different cumulative spin
    // so that by the end they've each spun multiple full turns in random directions.
    const rotationAccum = names.map(() => 0);

    const pile = (time: number) => {
      this.timeouts.push(
        setTimeout(() => {
          this.cards.update((cards) =>
            cards.map((c, i) => {
              rotationAccum[i] += (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
              return {
                ...c,
                shuffleX: (Math.random() - 0.5) * 6,
                shuffleY: (Math.random() - 0.5) * 6,
                rotation: rotationAccum[i],
                zIndex: Math.floor(Math.random() * names.length),
              };
            })
          );
        }, time)
      );
    };

    const scatter = (time: number) => {
      this.timeouts.push(
        setTimeout(() => {
          this.cards.update((cards) =>
            cards.map((c, i) => {
              rotationAccum[i] += (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 540);
              return {
                ...c,
                shuffleX: (Math.random() - 0.5) * 260,
                shuffleY: (Math.random() - 0.5) * 160,
                rotation: rotationAccum[i],
                zIndex: Math.floor(Math.random() * names.length),
              };
            })
          );
        }, time)
      );
    };

    // Phase 1 (200ms): Flip all cards face-down
    this.timeouts.push(
      setTimeout(() => {
        this.cards.update((cards) =>
          cards.map((c) => ({ ...c, flipped: true }))
        );
      }, 200)
    );

    // Phase 2-7: Rapid pile-scatter-pile-scatter-pile-scatter cycles
    // Each cycle is ~600ms (the CSS transition is 0.4s so this gives time to land)
    pile(800);
    scatter(1400);
    pile(2000);
    scatter(2600);
    pile(3200);

    // Phase 8 (3800ms): Fan cards back out to grid positions, zero rotation
    this.timeouts.push(
      setTimeout(() => {
        this.cards.update((cards) =>
          cards.map((c) => ({
            ...c,
            shuffleX: 0,
            shuffleY: 0,
            rotation: 0,
            zIndex: 0,
          }))
        );
      }, 3800)
    );

    // Phase 9 (4500ms): Lift and reveal the winner card
    this.timeouts.push(
      setTimeout(() => {
        this.cards.update((cards) =>
          cards.map((c, i) =>
            i === winnerIndex
              ? { ...c, selected: true, flipped: false, zIndex: 100 }
              : c
          )
        );
      }, 4500)
    );

    // Phase 10 (5100ms): Emit winner
    this.timeouts.push(
      setTimeout(() => {
        this.winnerSelected.emit(names[winnerIndex]);
      }, 5100)
    );
  }
}
