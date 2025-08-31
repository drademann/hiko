import { TestBed } from '@angular/core/testing';

import { WallboxService } from './wallbox.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('WallboxService', () => {
  let service: WallboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WallboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
