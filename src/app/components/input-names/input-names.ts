import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  untracked,
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
    // Sync local textarea changes → app state + Firebase.
    // Uses untracked() to read players so remote updates don't trigger this effect
    // (preventing a feedback loop where remote → local → Firebase → remote → ...).
    effect(() => {
      const names = this.names();
      const current = untracked(() => this.appStateSvc.players());
      this.syncNamesToAppState(names, current);

      const el = this.nameRow?.nativeElement;
      if (el) {
        el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      }
    });

    // Sync remote player changes → textarea.
    // Runs when appStateSvc.players changes (e.g. from Firebase).
    // Uses untracked() to read names() so it doesn't create a cycle with the effect above.
    effect(() => {
      const remotePlayers = [...this.appStateSvc.players().keys()];
      const currentNames = untracked(() => this.names());
      if (remotePlayers.join('\n') !== currentNames.join('\n')) {
        this.text.set({ names: remotePlayers.join('\n') });
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

    // Sync to app state + Firebase via updatePlayers
    this.appStateSvc.updatePlayers(reordered);
  }

  /**
   * Syncs local textarea names to app state (and Firebase if in a session).
   * Only fires if names or their order actually changed.
   */
  private syncNamesToAppState(inputList: string[], current: Map<string, Player>) {
    const currentKeys = [...current.keys()];
    const unchanged =
      currentKeys.length === inputList.length &&
      currentKeys.every((k, i) => k === inputList[i]);
    if (!unchanged) {
      this.appStateSvc.updatePlayers(inputList);
    }
  }
}
