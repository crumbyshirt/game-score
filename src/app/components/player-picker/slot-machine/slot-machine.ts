import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';

const SLOT_COLORS = [
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

@Component({
  selector: 'app-slot-machine',
  templateUrl: './slot-machine.html',
  styleUrl: './slot-machine.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlotMachine {
  /** List of player names */
  playerNames = input.required<string[]>();

  /** Increments to trigger a spin */
  spinTrigger = input(0);

  /** Emits the winning player name */
  winnerSelected = output<string>();

  @ViewChild('reel', { static: false, read: ElementRef })
  private reelRef!: ElementRef<HTMLElement>;

  /** The list of items to display in the reel (repeated for seamless looping) */
  protected reelItems = signal<{ name: string; color: string }[]>([]);

  /** Current translateY offset */
  protected reelOffset = signal(0);

  /** Highlighted winner index in the reel */
  protected highlightIndex = signal(-1);

  private animationId = 0;
  private isRendered = signal(false);
  private readonly ITEM_HEIGHT = 56;
  /** Tracks the last trigger value seen so we only spin on new triggers */
  private lastSeenTrigger = 0;

  constructor() {
    afterNextRender(() => {
      this.isRendered.set(true);
      this.lastSeenTrigger = this.spinTrigger();
      this.buildReel();
    });

    effect(() => {
      const trigger = this.spinTrigger();
      if (trigger > this.lastSeenTrigger && this.isRendered()) {
        this.lastSeenTrigger = trigger;
        this.startSpin();
      }
    });

    effect(() => {
      this.playerNames();
      if (this.isRendered()) {
        this.buildReel();
      }
    });
  }

  /** Builds the reel items list with enough repetitions to cover the full scroll distance */
  private buildReel(): void {
    const names = this.playerNames();
    // Build enough repetitions so the reel is never blank during animation.
    // We need at least enough items to cover the total scroll distance.
    // Using a generous number of repetitions ensures full coverage.
    const repetitions = Math.max(10, Math.ceil(50 / names.length));
    const items: { name: string; color: string }[] = [];
    for (let rep = 0; rep < repetitions; rep++) {
      for (let i = 0; i < names.length; i++) {
        items.push({ name: names[i], color: SLOT_COLORS[i % SLOT_COLORS.length] });
      }
    }
    this.reelItems.set(items);
    this.highlightIndex.set(-1);
    this.reelOffset.set(0);
  }

  /** Starts the slot machine spin */
  private startSpin(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.highlightIndex.set(-1);
    this.buildReel();

    const names = this.playerNames();
    const winnerIndex = Math.floor(Math.random() * names.length);

    // Figure out how many total items we have
    const repetitions = Math.max(10, Math.ceil(50 / names.length));
    const totalItems = repetitions * names.length;

    // Land on the winner in the second-to-last repetition area, so there are
    // items both before and after the landing position.
    const landingRep = repetitions - 2;
    const targetItemIndex = landingRep * names.length + winnerIndex;

    // The viewing window shows 3 items; center the winner (offset by 1 item)
    const targetOffset = (targetItemIndex - 1) * this.ITEM_HEIGHT;

    const duration = 3500 + Math.random() * 1500; // 3.5-5 seconds
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);

      // Cubic ease-out
      const eased = 1 - Math.pow(1 - t, 3);

      this.reelOffset.set(targetOffset * eased);

      if (t < 1) {
        this.animationId = requestAnimationFrame(animate);
      } else {
        this.animationId = 0;
        this.highlightIndex.set(targetItemIndex);
        this.winnerSelected.emit(names[winnerIndex]);
      }
    };

    this.animationId = requestAnimationFrame(animate);
  }
}
