import { TestBed } from '@angular/core/testing';

import { DataexplorerService } from './dataexplorer.service';

describe('DataexplorerService', () => {
  let service: DataexplorerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataexplorerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
