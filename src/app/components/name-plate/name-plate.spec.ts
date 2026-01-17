import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { NamePlate } from './name-plate';

describe('NamePlate', () => {
  let component: NamePlate;
  let fixture: ComponentFixture<NamePlate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NamePlate],
    }).compileComponents();

    fixture = TestBed.createComponent(NamePlate);
    component = fixture.componentInstance;

    fixture.componentInstance.name = signal('Test Player') as any;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
