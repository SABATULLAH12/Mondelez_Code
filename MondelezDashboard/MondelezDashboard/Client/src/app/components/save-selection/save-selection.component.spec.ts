import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveSelectionComponent } from './save-selection.component';

describe('SaveSelectionComponent', () => {
  let component: SaveSelectionComponent;
  let fixture: ComponentFixture<SaveSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
