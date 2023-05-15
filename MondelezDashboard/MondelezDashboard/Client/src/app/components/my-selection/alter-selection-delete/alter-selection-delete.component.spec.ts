import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlterSelectionDeleteComponent } from './alter-selection-delete.component';

describe('AlterSelectionDeleteComponent', () => {
  let component: AlterSelectionDeleteComponent;
  let fixture: ComponentFixture<AlterSelectionDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlterSelectionDeleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlterSelectionDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
