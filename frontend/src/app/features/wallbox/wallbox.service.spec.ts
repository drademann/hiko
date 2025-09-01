import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { WallboxService } from './wallbox.service';
import { Unit, WallboxStateDTO } from '@hiko/api';

describe('WallboxService', () => {
  let service: WallboxService;
  let mockedHttp: HttpTestingController;

  const mockWallboxState: WallboxStateDTO = {
    connectionState: 'NoVehicleConnected',
    charged: {
      value: 42,
      unit: Unit.kWh,
    },
    duration: {
      value: 3600,
      unit: Unit.Seconds,
    },
    power: {
      value: 11.3,
      unit: Unit.kW,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WallboxService);
    mockedHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mockedHttp.verify();
  });

  it('should be created', () => {
    mockedHttp.expectOne('/api/wallbox/state').flush(mockWallboxState);
    expect(service).toBeTruthy();
  });

  it('should make initial HTTP request on construction', () => {
    const req = mockedHttp.expectOne('/api/wallbox/state');
    expect(req.request.method).toBe('GET');
    req.flush(mockWallboxState);
  });

  it('should fetch wallbox state successfully', () => {
    const req = mockedHttp.expectOne('/api/wallbox/state');
    expect(req.request.method).toBe('GET');
    req.flush(mockWallboxState);

    expect(service.wallboxState()).toEqual(mockWallboxState);
  });

  it('should handle HTTP errors gracefully', () => {
    const req = mockedHttp.expectOne('/api/wallbox/state');
    req.flush('Error fetching wallbox state', {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(service.wallboxState()).toBeUndefined();
  });

  it('should refresh wallbox state when refresh() is called', () => {
    let req = mockedHttp.expectOne('/api/wallbox/state');
    req.flush(mockWallboxState);

    service.refresh();

    // should trigger another HTTP request
    req = mockedHttp.expectOne('/api/wallbox/state');
    expect(req.request.method).toBe('GET');

    const updatedMockState = {
      ...mockWallboxState,
      connectionState: 'VehicleConnected',
      power: { value: 22.0, unit: Unit.kW },
    };
    req.flush(updatedMockState);

    expect(service.wallboxState()).toEqual(updatedMockState);
  });

  it('should handle multiple refresh calls', () => {
    const req = mockedHttp.expectOne('/api/wallbox/state');
    req.flush(mockWallboxState);

    // each will trigger a new request
    // but switchMap will cancel previous ones
    service.refresh();
    service.refresh();
    service.refresh();

    // should trigger three new requests (switchMap cancels but still makes requests)
    const requests = mockedHttp.match('/api/wallbox/state');
    expect(requests.length).toBe(3);

    // flush the last request
    requests[2].flush(mockWallboxState);
  });

  it('should return undefined initially before first response', () => {
    // before any HTTP response
    expect(service.wallboxState()).toBeUndefined();

    // complete the initial request
    const req = mockedHttp.expectOne('/api/wallbox/state');
    req.flush(mockWallboxState);
  });

  it('should handle network timeout', () => {
    const req = mockedHttp.expectOne('/api/wallbox/state');
    req.error(new ProgressEvent('timeout'), {
      status: 0,
      statusText: 'Timeout',
    });

    expect(service.wallboxState()).toBeUndefined();
  });

  it('should handle invalid JSON response', () => {
    const req = mockedHttp.expectOne('/api/wallbox/state');

    req.flush('invalid json', {
      status: 200,
      statusText: 'OK',
    });

    expect(service.wallboxState()).toBe('invalid json');
  });
});
