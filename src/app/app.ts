import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppState } from './service/app-state/app-state';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('Game Score');
  private readonly appStateSvc = inject(AppState);
  protected readonly sessionCode = this.appStateSvc.sessionCode;
}
