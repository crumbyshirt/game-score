import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScoreGrid } from '../score-grid/score-grid';

@Component({
  selector: 'app-active-game',
  templateUrl: './active-game.html',
  styleUrls: ['./active-game.css'],
  imports: [ScoreGrid],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGame {}
