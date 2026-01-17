import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Player } from '../../models/Player';
import { AppState } from '../../service/app-state/app-state';

import { InputNames } from './input-names';

describe('InputNames', () => {
  class MockAppState {
    players = signal<Map<string, Player>>(
      new Map([
        ['Player 1', { name: 'Player 1', score: new Map<number, number>() }],
        ['Player 2', { name: 'Player 2', score: new Map<number, number>() }],
      ])
    );
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
    appState.players.set(
      new Map([
        ['Player A', { name: 'Player A', score: new Map([[1, 10]]) }],
        ['Player B', { name: 'Player B', score: new Map([[1, 20]]) }],
        ['Player C', { name: 'Player C', score: new Map([[1, 30]]) }],
      ])
    );

    // Simulate user input: A, D, B (D is new and should be inserted between A and B)
    //@ts-expect-error accessing protected member for testing
    component.text.set({ names: 'Player A\nPlayer D\nPlayer B' });

    // Ensure change detection and microtasks run so the effect can apply the merge
    fixture.detectChanges();
    await Promise.resolve();
    await Promise.resolve();

    const players = appState.players();
    const playerNames = Array.from(players.keys());
    expect(playerNames).toEqual(['Player A', 'Player D', 'Player B', 'Player C']);

    const a = players.get('Player A')!;
    expect(a.score!.get(1)).toBe(10);
  });
});
