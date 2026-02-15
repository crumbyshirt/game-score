import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppState } from '../../service/app-state/app-state';
import { BrowserStorage } from '../../service/browser-storage/browser-storage';
import { SpinningWheel } from './spinning-wheel/spinning-wheel';
import { SlotMachine } from './slot-machine/slot-machine';
import { CardShuffle } from './card-shuffle/card-shuffle';

export type AnimationMode = 'wheel' | 'slot' | 'cards';

@Component({
  selector: 'app-player-picker',
  imports: [RouterLink, SpinningWheel, SlotMachine, CardShuffle],
  templateUrl: './player-picker.html',
  styleUrl: './player-picker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPicker {
  private appStateSvc = inject(AppState);
  private browserStorageSvc = inject(BrowserStorage);

  /** The currently selected animation mode */
  animationMode = signal<AnimationMode>(
    (this.browserStorageSvc.retrievePickerMode() as AnimationMode) || 'wheel'
  );

  /** The winner of the last spin */
  winner = signal<string | null>(null);

  /** Whether an animation is currently running */
  isSpinning = signal(false);

  /** Trigger signal that increments to tell child animations to start */
  spinTrigger = signal(0);

  /** Derived list of player names from app state */
  playerNames = computed(() => Array.from(this.appStateSvc.players().keys()));

  constructor() {
    // Persist animation mode preference whenever it changes
    effect(() => {
      this.browserStorageSvc.storePickerMode(this.animationMode());
    });
  }

  /** Sets the animation mode */
  setMode(mode: AnimationMode): void {
    this.animationMode.set(mode);
    this.winner.set(null);
  }

  /** Triggers the spin animation */
  spin(): void {
    if (this.isSpinning()) return;
    this.winner.set(null);
    this.isSpinning.set(true);
    this.spinTrigger.update((v) => v + 1);
  }

  /** Called by child animation components when a winner is selected */
  onWinnerSelected(name: string): void {
    this.winner.set(name);
    this.isSpinning.set(false);
  }
}
