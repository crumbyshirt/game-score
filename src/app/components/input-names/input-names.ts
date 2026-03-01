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

  /** Index of the name plate currently being dragged */
  protected dragIndex = signal<number | null>(null);

  /** Index of the drop target position */
  protected dropTargetIndex = signal<number | null>(null);

  @ViewChild('nameRow', { static: false, read: ElementRef })
  protected nameRow!: ElementRef<HTMLElement>;

  constructor() {
    effect(() => {
      this.updateAppStateNames(this.names(), this.appStateSvc.players());

      // Access the element only when available (after view init).
      const el = this.nameRow?.nativeElement;
      if (el) {
        // Scroll to the far right smoothly.
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
    });
  }

  /** Called when a drag starts on a name plate */
  onDragStart(index: number, event: DragEvent): void {
    this.dragIndex.set(index);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  /** Called when dragging over another name plate */
  onDragOver(index: number, event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dropTargetIndex.set(index);
  }

  /** Called when leaving a drag target */
  onDragLeave(): void {
    this.dropTargetIndex.set(null);
  }

  /** Called when drag ends (cancelled or completed) */
  onDragEnd(): void {
    this.dragIndex.set(null);
    this.dropTargetIndex.set(null);
  }

  /** Called when a name plate is dropped on a new position */
  onDrop(targetIndex: number, event: DragEvent): void {
    event.preventDefault();
    const sourceIndex = this.dragIndex();
    this.dragIndex.set(null);
    this.dropTargetIndex.set(null);

    if (sourceIndex === null || sourceIndex === targetIndex) return;

    const reordered = [...this.names()];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Update the textarea to reflect the new order
    this.text.set({ names: reordered.join('\n') });

    // Directly rebuild the players Map in the new order so it persists
    const current = this.appStateSvc.players();
    const reorderedMap = new Map<string, Player>();
    for (const name of reordered) {
      const existing = current.get(name);
      if (existing) {
        reorderedMap.set(name, existing);
      }
    }
    this.appStateSvc.players.set(reorderedMap);
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

    // Only update if the names or their order changed
    const currentKeys = [...current.keys()];
    const mergedKeys = [...merged.keys()];
    const unchanged =
      currentKeys.length === mergedKeys.length &&
      currentKeys.every((k, i) => k === mergedKeys[i]);
    if (!unchanged) {
      this.appStateSvc.players.set(merged);
    }
  }
}
