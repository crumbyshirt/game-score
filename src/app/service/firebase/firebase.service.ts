import { Injectable } from '@angular/core';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  Database,
} from 'firebase/database';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GameSession } from '../../models/GameSession';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  private app: FirebaseApp;
  private db: Database;

  constructor() {
    this.app = initializeApp(environment.firebaseConfig);
    this.db = getDatabase(this.app);
  }

  /** Generates a random 4-character alphanumeric code */
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Creates a new game session in Firebase.
   * @param players ordered list of player names
   * @returns the 4-char session code
   */
  async createSession(players: string[]): Promise<string> {
    let code = this.generateCode();
    // Ensure code is unique
    let attempts = 0;
    while (attempts < 10) {
      const existing = await get(ref(this.db, `games/${code}`));
      if (!existing.exists()) break;
      code = this.generateCode();
      attempts++;
    }

    const session: GameSession = {
      createdAt: Date.now(),
      players,
      scores: {},
    };
    await set(ref(this.db, `games/${code}`), session);
    return code;
  }

  /**
   * Checks if a session with the given code exists.
   * @returns true if session exists
   */
  async joinSession(code: string): Promise<boolean> {
    const snapshot = await get(ref(this.db, `games/${code.toUpperCase()}`));
    return snapshot.exists();
  }

  /**
   * Returns an Observable that emits the session state in real-time.
   */
  watchSession(code: string): Observable<GameSession> {
    return new Observable((observer) => {
      const sessionRef = ref(this.db, `games/${code.toUpperCase()}`);
      const unsubscribe = onValue(
        sessionRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            observer.next(data as GameSession);
          }
        },
        (error) => observer.error(error),
      );
      return () => unsubscribe();
    });
  }

  /**
   * Updates a single score cell in Firebase.
   */
  async updateScore(
    code: string,
    playerName: string,
    round: number,
    score: number | null,
  ): Promise<void> {
    await update(ref(this.db, `games/${code.toUpperCase()}/scores/${playerName}`), {
      [round]: score,
    });
  }

  /**
   * Updates the player list for a session.
   */
  async updatePlayers(code: string, players: string[]): Promise<void> {
    await update(ref(this.db, `games/${code.toUpperCase()}`), { players });
  }
}
