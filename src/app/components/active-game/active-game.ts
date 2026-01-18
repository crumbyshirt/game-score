import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScoreGrid } from '../score-grid/score-grid';
import { TotalScore } from '../total-score/total-score';

@Component({
  selector: 'app-active-game',
  templateUrl: './active-game.html',
  styleUrls: ['./active-game.css'],
  imports: [ScoreGrid, TotalScore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGame {}
