import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridBox } from './grid-box';

describe('GridBox', () => {
  let component: GridBox;
  let fixture: ComponentFixture<GridBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
