import { ChangeDetectionStrategy, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AppState } from '../../service/app-state/app-state';
import { ScoreGrid } from '../score-grid/score-grid';
import { TotalScore } from '../total-score/total-score';

@Component({
  selector: 'app-active-game',
  templateUrl: './active-game.html',
  styleUrls: ['./active-game.css'],
  imports: [ScoreGrid, TotalScore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGame {
  private appStateSvc = inject(AppState);

  @ViewChild(ScoreGrid) protected scoreGrid: ScoreGrid | undefined;
  @ViewChild('scrollArea', { read: ElementRef }) private scrollArea!: ElementRef<HTMLElement>;

  confirmNewGame(): void {
    if (confirm('Reset all scores and start a new game?')) {
      this.appStateSvc.resetScores();
    }
  }

  addRound(): void {
    this.scoreGrid?.addRound();
    // Wait one tick for Angular to render the new row, then scroll to bottom
    requestAnimationFrame(() => {
      const el = this.scrollArea?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
  }
}
