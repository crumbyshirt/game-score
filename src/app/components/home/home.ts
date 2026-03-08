import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppState } from '../../service/app-state/app-state';
import { FirebaseService } from '../../service/firebase/firebase.service';
import { Player } from '../../models/Player';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private router = inject(Router);
  private appStateSvc = inject(AppState);
  private firebaseSvc = inject(FirebaseService);

  /** Textarea text for player names when creating a game */
  protected namesText = signal('');

  /** Code input for joining an existing game */
  protected joinCode = signal('');

  /** Loading/error state */
  protected creating = signal(false);
  protected joining = signal(false);
  protected joinError = signal('');

  /** Create a new multiplayer session */
  async createGame(): Promise<void> {
    const rawNames = this.namesText();
    const players = rawNames
      .split(/\r?\n/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (players.length < 1) {
      return;
    }

    this.creating.set(true);
    try {
      const code = await this.firebaseSvc.createSession(players);

      // Initialize AppState with these players
      const playerMap = new Map<string, Player>(
        players.map((name) => [name, { name, score: new Map<number, number | null>() }])
      );
      this.appStateSvc.players.set(playerMap);
      this.appStateSvc.sessionCode.set(code);

      this.router.navigate(['/game', code]);
    } finally {
      this.creating.set(false);
    }
  }

  /** Join an existing multiplayer session by code */
  async joinGame(): Promise<void> {
    const code = this.joinCode().trim().toUpperCase();
    if (code.length !== 4) {
      this.joinError.set('Enter a 4-character code.');
      return;
    }

    this.joining.set(true);
    this.joinError.set('');
    try {
      const exists = await this.firebaseSvc.joinSession(code);
      if (exists) {
        this.appStateSvc.sessionCode.set(code);
        this.router.navigate(['/game', code]);
      } else {
        this.joinError.set('Game not found. Check the code and try again.');
      }
    } finally {
      this.joining.set(false);
    }
  }

  /** Navigate to solo (local) play */
  playSolo(): void {
    this.appStateSvc.sessionCode.set(null);
    this.router.navigate(['/players']);
  }

  onJoinCodeInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.joinCode.set(val);
    (event.target as HTMLInputElement).value = val;
  }
}
