import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NamePlate } from './name-plate';

describe('NamePlate', () => {
  let component: NamePlate;
  let fixture: ComponentFixture<NamePlate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamePlate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NamePlate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
