import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { isEqual } from 'lodash';
import { Player } from '../../models/Player';
import { AppState } from '../../service/app-state/app-state';
import { NamePlate } from '../name-plate/name-plate';

/**
 * Allows users to input names. The names are entered into a large text area,
 * with each name on a new line.
 */
@Component({
  selector: 'app-input-names',
  imports: [FormField, NamePlate],
  templateUrl: './input-names.html',
  styleUrls: ['./input-names.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNames {
  private appStateSvc = inject(AppState);

  /** Signal holding the raw text input for names. */
  protected text = signal({
    names: Array.from(this.appStateSvc.players().values())
      .map((p) => p.name)
      .join('\n'),
  });
  /** Form group for the names input. */
  protected form = form(this.text);

  /** Computed signal that returns an array of trimmed, non-empty, unique names. */
  protected names = computed(() => {
    const raw = this.form().controlValue().names as string;
    return Array.from(
      new Set(
        (raw ?? '')
          .split(/\r?\n/)
          .map((n) => n.trim())
          .filter((n) => n.length > 0),
      ),
    );
  });

  @ViewChild('nameRow', { static: false, read: ElementRef })
  protected nameRow!: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      console.count('names effect called');
      this.updateAppStateNames(this.names(), this.appStateSvc.players());

      // Access the element only when available (after view init).
      const el = this.nameRow?.nativeElement;
      if (el) {
        // Scroll to the far right smoothly.
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
    });
  }

  /**
   * Updates the app state with the new list of names.
   * @param inputList list of names from the user input
   * @param current player map in the app state
   */
  private updateAppStateNames(inputList: string[], current: Map<string, Player>) {
    const merged = new Map<string, Player>();

    for (const name of inputList) {
      const existing = current.get(name);
      if (existing) {
        merged.set(name, existing);
      } else {
        merged.set(name, { name, score: new Map<number, number>() });
      }
    }

    // Deep equality check: only update if the players map actually changed
    if (!isEqual(current, merged)) {
      this.appStateSvc.players.set(merged);
    }
  }
}
