import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  confirmNewGame(): void {
    if (confirm('Reset all scores and start a new game?')) {
      this.appStateSvc.resetScores();
    }
  }
}
