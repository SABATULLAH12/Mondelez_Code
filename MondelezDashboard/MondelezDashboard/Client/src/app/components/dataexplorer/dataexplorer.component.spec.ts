import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataexplorerComponent } from './dataexplorer.component';

describe('DataexplorerComponent', () => {
  let component: DataexplorerComponent;
  let fixture: ComponentFixture<DataexplorerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataexplorerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataexplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
