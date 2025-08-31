import { TestBed } from '@angular/core/testing';

import { WallboxService } from './wallbox.service';

describe('WallboxService', () => {
  let service: WallboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WallboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
