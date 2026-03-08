import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Player } from '../../models/Player';
import { GameSession } from '../../models/GameSession';
import { AppState } from '../../service/app-state/app-state';
import { FirebaseService } from '../../service/firebase/firebase.service';
import { AnnouncementBubble } from '../announcement-bubble/announcement-bubble';
import { ScoreGrid } from '../score-grid/score-grid';
import { TotalScore } from '../total-score/total-score';

@Component({
  selector: 'app-active-game',
  templateUrl: './active-game.html',
  styleUrls: ['./active-game.css'],
  imports: [ScoreGrid, TotalScore, AnnouncementBubble],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveGame implements OnInit, OnDestroy {
  private appStateSvc = inject(AppState);
  private firebaseSvc = inject(FirebaseService);
  private route = inject(ActivatedRoute);

  @ViewChild(ScoreGrid) protected scoreGrid: ScoreGrid | undefined;
  @ViewChild('scrollArea', { read: ElementRef }) private scrollArea!: ElementRef<HTMLElement>;

  /** The session code from the URL, if any */
  protected sessionCode = signal<string | null>(null);

  /** Whether the session data is still loading */
  protected loading = signal(false);

  private sessionSub: Subscription | null = null;

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (code) {
      const upperCode = code.toUpperCase();
      this.sessionCode.set(upperCode);
      this.appStateSvc.sessionCode.set(upperCode);
      this.loading.set(true);
      this.sessionSub = this.firebaseSvc.watchSession(upperCode).subscribe({
        next: (session: GameSession) => {
          this.loading.set(false);
          this.appStateSvc.setPlayersFromRemote(this.sessionToPlayerMap(session));
        },
        error: () => {
          this.loading.set(false);
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.sessionSub?.unsubscribe();
  }

  confirmNewGame(): void {
    if (confirm('Reset all scores and start a new game?')) {
      this.appStateSvc.resetScores();
    }
  }

  addRound(): void {
    this.scoreGrid?.addRound();
    requestAnimationFrame(() => {
      const el = this.scrollArea?.nativeElement;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  private sessionToPlayerMap(session: GameSession): Map<string, Player> {
    const map = new Map<string, Player>();
    const playerNames = session.players ?? [];
    for (const name of playerNames) {
      const rawScores = session.scores?.[name] ?? {};
      const scoreMap = new Map<number, number | null>(
        Object.entries(rawScores).map(([round, val]) => [Number(round), val])
      );
      map.set(name, { name, score: scoreMap });
    }
    return map;
  }
}
