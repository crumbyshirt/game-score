import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';

/**
 * The grid box component contains a single form input cell.
 */
@Component({
  selector: 'app-grid-box',
  imports: [FormField],
  templateUrl: './grid-box.html',
  styleUrl: './grid-box.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GridBox {
  /** Starting value for the gridbox to display */
  value = input<number | null>(null);

  /** Emits the number value of the score when it changes */
  score = output<number>();

  /** Signal to track the changed score as a string for the input field */
  private changedScore = signal<string>(this.value()?.toString() || '');

  /** Form group for the score input */
  protected scoreEdit = form(this.changedScore);

  constructor() {
    effect(() => {
      this.onScoreChange();
    });
  }

  /**
   * Handles emitting the score when it changes and is valid.
   */
  private onScoreChange() {
    console.log('Score changed to:', this.changedScore());
    if (this.changedScore() === '') return;
    if (isNaN(Number(this.changedScore()))) return;

    this.score.emit(Number(this.changedScore()) || 0);
  }
}
