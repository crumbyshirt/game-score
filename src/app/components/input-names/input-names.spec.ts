import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Player } from '../../models/Player';
import { AppState } from '../../service/app-state/app-state';

import { InputNames } from './input-names';

describe('InputNames', () => {
  class MockAppState {
    players = signal<Player[]>([
      { name: 'Player 1', score: new Map<number, number>() },
      { name: 'Player 2', score: new Map<number, number>() },
    ]);
    loadPlayers() {}
  }
  let component: InputNames;
  let fixture: ComponentFixture<InputNames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputNames],
      providers: [{ provide: AppState, useClass: MockAppState }],
    }).compileComponents();

    fixture = TestBed.createComponent(InputNames);
    component = fixture.componentInstance;
    // Trigger initial change detection and wait for stability
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('adds new names in received order and preserves existing scores', async () => {
    const appState = TestBed.inject(AppState);
    appState.players.set([
      { name: 'Player A', score: new Map([[1, 10]]) },
      { name: 'Player B', score: new Map([[1, 20]]) },
      { name: 'Player C', score: new Map([[1, 30]]) },
    ]);

    // Simulate user input: A, D, B (D is new and should be inserted between A and B)
    //@ts-expect-error accessing protected member for testing
    component.text.set({ names: 'Player A\nPlayer D\nPlayer B' });

    // Ensure change detection and microtasks run so the effect can apply the merge
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();

    const players = appState.players();
    expect(players.map((p) => p.name)).toEqual(['Player A', 'Player D', 'Player B', 'Player C']);

    const a = players.find((p) => p.name === 'Player A')!;
    expect(a.score!.get(1)).toBe(10);
  });
});
