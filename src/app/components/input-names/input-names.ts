import { Component, computed, signal } from '@angular/core';
import { Field, form } from '@angular/forms/signals';

/**
 * Allows users to input names. The names are entered into a large text area,
 * with each name on a new line.
 */
@Component({
  selector: 'app-input-names',
  imports: [Field],
  templateUrl: './input-names.html',
  styleUrls: ['./input-names.css'],
})
export class InputNames {
  /** Signal holding the raw text input for names. */
  protected text = signal({ names: 'Enter names, one per line' });
  /** Form group for the names input. */
  protected form = form(this.text);

  /** Computed signal that returns an array of trimmed, non-empty names. */
  protected names = computed(() => {
    const raw = this.form().controlValue().names as string;
    return (raw ?? '')
      .split(/\r?\n/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
  });

  protected setExample() {
    this.form().setControlValue({ names: 'Alice\nBob\nCharlie\nDiana' });
  }
}
