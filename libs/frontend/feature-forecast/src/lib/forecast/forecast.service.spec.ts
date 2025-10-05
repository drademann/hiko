import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ForecastService } from './forecast.service';
import { ForecastDTO, Unit } from '@hiko/api';
import { provideHttpClient } from '@angular/common/http';

describe('ForecastService', () => {
  let service: ForecastService;
  let mockHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ForecastService);
    mockHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mockHttp.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();

    // Service makes the initial request on creation, so we need to handle it
    const req = mockHttp.expectOne('/api/forecast');
    req.flush({ powerValues: [] });
  });

  it('should fetch forecast data on initialization', () => {
    const mockForecast: ForecastDTO = {
      powerValues: [
        { value: 0.5, unit: Unit.kW }, // Previous day 23:00-00:00
        { value: 0.0, unit: Unit.kW }, // 00:00-01:00
        { value: 0.0, unit: Unit.kW }, // 01:00-02:00
        { value: 0.0, unit: Unit.kW }, // 02:00-03:00
        { value: 0.0, unit: Unit.kW }, // 03:00-04:00
        { value: 0.0, unit: Unit.kW }, // 04:00-05:00
        { value: 0.2, unit: Unit.kW }, // 05:00-06:00
        { value: 1.3, unit: Unit.kW }, // 06:00-07:00
        { value: 2.5, unit: Unit.kW }, // 07:00-08:00
        { value: 3.8, unit: Unit.kW }, // 08:00-09:00
        { value: 4.5, unit: Unit.kW }, // 09:00-10:00
        { value: 5.2, unit: Unit.kW }, // 10:00-11:00
        { value: 5.8, unit: Unit.kW }, // 11:00-12:00
        { value: 6.0, unit: Unit.kW }, // 12:00-13:00
        { value: 5.9, unit: Unit.kW }, // 13:00-14:00
        { value: 5.3, unit: Unit.kW }, // 14:00-15:00
        { value: 4.6, unit: Unit.kW }, // 15:00-16:00
        { value: 3.5, unit: Unit.kW }, // 16:00-17:00
        { value: 2.2, unit: Unit.kW }, // 17:00-18:00
        { value: 1.0, unit: Unit.kW }, // 18:00-19:00
        { value: 0.3, unit: Unit.kW }, // 19:00-20:00
        { value: 0.0, unit: Unit.kW }, // 20:00-21:00
        { value: 0.0, unit: Unit.kW }, // 21:00-22:00
        { value: 0.0, unit: Unit.kW }, // 22:00-23:00
        { value: 0.0, unit: Unit.kW }, // 23:00-00:00
      ],
    };

    const req = mockHttp.expectOne('/api/forecast');
    expect(req.request.method).toBe('GET');
    req.flush(mockForecast);

    // Check that the signal contains the data
    TestBed.tick();
    expect(service.forecastData()).toEqual(mockForecast);
  });

  it('should handle error and return undefined', () => {
    const req = mockHttp.expectOne('/api/forecast');
    req.error(new ProgressEvent('Network error'));

    TestBed.tick();
    expect(service.forecastData()).toBeUndefined();
  });

  it('should refresh data when refresh is called', () => {
    // Initial request from constructor
    const req1 = mockHttp.expectOne('/api/forecast');
    req1.flush({ powerValues: [] });

    // Call refresh
    service.refresh();

    // Expect another request
    const req2 = mockHttp.expectOne('/api/forecast');
    expect(req2.request.method).toBe('GET');
    req2.flush({ powerValues: [] });
  });

  it('should handle multiple refresh calls', () => {
    const mockForecast1: ForecastDTO = {
      powerValues: [
        { value: 1.0, unit: Unit.kW },
        { value: 2.0, unit: Unit.kW },
      ],
    };

    const mockForecast2: ForecastDTO = {
      powerValues: [
        { value: 3.0, unit: Unit.kW },
        { value: 4.0, unit: Unit.kW },
      ],
    };

    // Initial request
    const req1 = mockHttp.expectOne('/api/forecast');
    req1.flush(mockForecast1);

    TestBed.tick();
    expect(service.forecastData()).toEqual(mockForecast1);

    // Refresh with new data
    service.refresh();
    const req2 = mockHttp.expectOne('/api/forecast');
    req2.flush(mockForecast2);

    TestBed.tick();
    expect(service.forecastData()).toEqual(mockForecast2);
  });
});
