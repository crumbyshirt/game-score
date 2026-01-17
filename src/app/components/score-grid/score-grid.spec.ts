import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreGrid } from './score-grid';

describe('ScoreGrid', () => {
  let component: ScoreGrid;
  let fixture: ComponentFixture<ScoreGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoreGrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
