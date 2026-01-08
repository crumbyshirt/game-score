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
import { Field, form } from '@angular/forms/signals';
import { AppState } from '../../service/app-state/app-state';
import { NamePlate } from '../name-plate/name-plate';

/**
 * Allows users to input names. The names are entered into a large text area,
 * with each name on a new line.
 */
@Component({
  selector: 'app-input-names',
  imports: [Field, NamePlate],
  templateUrl: './input-names.html',
  styleUrls: ['./input-names.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputNames {
  private appStateSvc = inject(AppState);

  /** Signal holding the raw text input for names. */
  protected text = signal({
    names: this.appStateSvc
      .players()
      .map((p) => p.name)
      .join('\n'),
  });
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

  @ViewChild('nameRow', { static: false, read: ElementRef })
  protected nameRow!: ElementRef<HTMLElement>;

  constructor() {
    // When the `names` signal changes, scroll the container to the right.
    effect(() => {
      const list = this.names();
      // just overwrite the players list until that is not good enough
      this.appStateSvc.players.set(list.map((name) => ({ name })));

      // Access the element only when available (after view init).
      const el = this.nameRow?.nativeElement;
      if (el) {
        // Scroll to the far right smoothly.
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
      return list;
    });
  }
}
