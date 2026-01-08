import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppState } from '../../service/app-state/app-state';
import { NamePlate } from '../name-plate/name-plate';

@Component({
  selector: 'app-active-game',
  templateUrl: './active-game.html',
  styleUrls: ['./active-game.css'],
  imports: [NamePlate],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGame {
  protected appStateSvc = inject(AppState);

  protected players = this.appStateSvc;
}
