import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ForecastComponent } from './forecast.component';
import { ForecastService } from './forecast.service';
import { DashboardService } from '@hiko/frontend-feature-dashboard';
import { Unit } from '@hiko/api';

// Mock Chart.js to avoid ES module issues in tests
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  ChartType: {},
  ChartConfiguration: {},
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  BarController: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  registerables: [],
}));

// Mock ng2-charts with a proper directive
jest.mock('ng2-charts', () => {
  const { Directive, Input } = require('@angular/core');

  @Directive({
    selector: 'canvas[baseChart]', // eslint-disable-line @angular-eslint/directive-selector
    standalone: true,
  })
  class MockBaseChartDirective {
    @Input() type: unknown;
    @Input() data: unknown;
    @Input() options: unknown;
  }

  return {
    BaseChartDirective: MockBaseChartDirective,
  };
});

describe('ForecastComponent', () => {
  let component: ForecastComponent;
  let fixture: ComponentFixture<ForecastComponent>;
  let mockDashboardService: Partial<DashboardService>;
  let mockForecastService: Partial<ForecastService>;

  beforeEach(async () => {
    mockDashboardService = {
      currentRefreshRoute: signal(null),
    };

    mockForecastService = {
      forecastData: signal({
        powerValues: [
          { value: 0.5, unit: Unit.kW }, // Previous day
          { value: 0.0, unit: Unit.kW },
          { value: 0.0, unit: Unit.kW },
          { value: 1.5, unit: Unit.kW },
          { value: 2.5, unit: Unit.kW },
        ],
      }),
      refresh: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ForecastComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: ForecastService, useValue: mockForecastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate total production correctly', () => {
    // Total should exclude the first value (previous day)
    // 0.0 + 0.0 + 1.5 + 2.5 = 4.0
    expect(component.totalProduction()).toBe(4.0);
  });

  it('should generate 24 hour labels', () => {
    expect(component.hourLabels).toHaveLength(24);
    expect(component.hourLabels[0]).toBe('00');
    expect(component.hourLabels[23]).toBe('23');
  });

  it('should refresh when dashboard service triggers forecast route', () => {
    const refreshSpy = jest.spyOn(mockForecastService, 'refresh');

    // create a new test bed with the updated mock value
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ForecastComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: DashboardService, useValue: { currentRefreshRoute: signal({ route: 'forecast' }) } },
        { provide: ForecastService, useValue: mockForecastService },
      ],
    });

    fixture = TestBed.createComponent(ForecastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.tick();

    expect(refreshSpy).toHaveBeenCalled();
  });

  it('should handle empty forecast data', () => {
    // create a new component with empty forecast data
    const emptyForecastService = {
      forecastData: signal(undefined),
      refresh: jest.fn(),
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ForecastComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: DashboardService, useValue: mockDashboardService },
        { provide: ForecastService, useValue: emptyForecastService },
      ],
    });

    const emptyFixture = TestBed.createComponent(ForecastComponent);
    const emptyComponent = emptyFixture.componentInstance;
    emptyFixture.detectChanges();

    const chartData = emptyComponent.chartData();
    expect(chartData.datasets[0].data).toEqual(Array(24).fill(0));
    expect(emptyComponent.totalProduction()).toBe(0);
  });

  describe('chartData filtering', () => {
    it('should filter out leading zeros (nighttime before sunrise)', () => {
      const filteringForecastService = {
        forecastData: signal({
          powerValues: [
            { value: 0.0, unit: Unit.kW }, // previous day - skipped
            { value: 0.0, unit: Unit.kW }, // 00:00 - leading zero
            { value: 0.0, unit: Unit.kW }, // 01:00 - leading zero
            { value: 0.0, unit: Unit.kW }, // 02:00 - leading zero
            { value: 2.0, unit: Unit.kW }, // 03:00 - first non-zero
            { value: 5.0, unit: Unit.kW }, // 04:00
            { value: 8.0, unit: Unit.kW }, // 05:00 - last non-zero
            ...Array(18).fill({ value: 0.0, unit: Unit.kW }), // remaining hours
          ],
        }),
        refresh: jest.fn(),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ForecastComponent],
        providers: [
          provideHttpClientTesting(),
          { provide: DashboardService, useValue: mockDashboardService },
          { provide: ForecastService, useValue: filteringForecastService },
        ],
      });

      const testFixture = TestBed.createComponent(ForecastComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      const chartData = testComponent.chartData();

      // should only include hours 03-05 (indices 3-5 in the 24-hour array)
      expect(chartData.labels).toEqual(['03', '04', '05']);
      expect(chartData.datasets[0].data).toEqual([2.0, 5.0, 8.0]);
    });

    it('should filter out trailing zeros (nighttime after sunset)', () => {
      const filteringForecastService = {
        forecastData: signal({
          powerValues: [
            { value: 0.0, unit: Unit.kW }, // previous day - skipped
            { value: 3.0, unit: Unit.kW }, // 00:00 - first non-zero
            { value: 6.0, unit: Unit.kW }, // 01:00
            { value: 4.0, unit: Unit.kW }, // 02:00 - last non-zero
            { value: 0.0, unit: Unit.kW }, // 03:00 - trailing zero
            { value: 0.0, unit: Unit.kW }, // 04:00 - trailing zero
            ...Array(19).fill({ value: 0.0, unit: Unit.kW }), // remaining hours
          ],
        }),
        refresh: jest.fn(),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ForecastComponent],
        providers: [
          provideHttpClientTesting(),
          { provide: DashboardService, useValue: mockDashboardService },
          { provide: ForecastService, useValue: filteringForecastService },
        ],
      });

      const testFixture = TestBed.createComponent(ForecastComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      const chartData = testComponent.chartData();

      // should only include hours 00-02
      expect(chartData.labels).toEqual(['00', '01', '02']);
      expect(chartData.datasets[0].data).toEqual([3.0, 6.0, 4.0]);
    });

    it('should preserve intermediate zeros (cloudy periods during the day)', () => {
      const filteringForecastService = {
        forecastData: signal({
          powerValues: [
            { value: 0.0, unit: Unit.kW }, // previous day - skipped
            { value: 0.0, unit: Unit.kW }, // 00:00 - leading zero
            { value: 0.0, unit: Unit.kW }, // 01:00 - leading zero
            { value: 2.0, unit: Unit.kW }, // 02:00 - first non-zero
            { value: 5.0, unit: Unit.kW }, // 03:00
            { value: 0.0, unit: Unit.kW }, // 04:00 - intermediate zero (cloudy)
            { value: 0.0, unit: Unit.kW }, // 05:00 - intermediate zero (cloudy)
            { value: 3.0, unit: Unit.kW }, // 06:00
            { value: 4.0, unit: Unit.kW }, // 07:00 - last non-zero
            ...Array(16).fill({ value: 0.0, unit: Unit.kW }), // remaining hours - trailing zeros
          ],
        }),
        refresh: jest.fn(),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ForecastComponent],
        providers: [
          provideHttpClientTesting(),
          { provide: DashboardService, useValue: mockDashboardService },
          { provide: ForecastService, useValue: filteringForecastService },
        ],
      });

      const testFixture = TestBed.createComponent(ForecastComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      const chartData = testComponent.chartData();

      // should include hours 02-07, preserving the zeros at 04 and 05
      expect(chartData.labels).toEqual(['02', '03', '04', '05', '06', '07']);
      expect(chartData.datasets[0].data).toEqual([2.0, 5.0, 0.0, 0.0, 3.0, 4.0]);
    });

    it('should handle all-zero values by showing all 24 hours', () => {
      const allZeroForecastService = {
        forecastData: signal({
          powerValues: [
            { value: 0.0, unit: Unit.kW }, // previous day - skipped
            ...Array(24).fill({ value: 0.0, unit: Unit.kW }), // all zeros for 24 hours
          ],
        }),
        refresh: jest.fn(),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ForecastComponent],
        providers: [
          provideHttpClientTesting(),
          { provide: DashboardService, useValue: mockDashboardService },
          { provide: ForecastService, useValue: allZeroForecastService },
        ],
      });

      const testFixture = TestBed.createComponent(ForecastComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      const chartData = testComponent.chartData();

      // should show all 24 hours when all values are zero
      expect(chartData.labels).toHaveLength(24);
      expect(chartData.labels).toEqual(testComponent.hourLabels);
      expect(chartData.datasets[0].data).toEqual(Array(24).fill(0));
    });

    it('should handle single non-zero value correctly', () => {
      const singleValueForecastService = {
        forecastData: signal({
          powerValues: [
            { value: 0.0, unit: Unit.kW }, // previous day - skipped
            ...Array(12).fill({ value: 0.0, unit: Unit.kW }),
            { value: 7.5, unit: Unit.kW }, // 12:00 - only non-zero
            ...Array(11).fill({ value: 0.0, unit: Unit.kW }),
          ],
        }),
        refresh: jest.fn(),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ForecastComponent],
        providers: [
          provideHttpClientTesting(),
          { provide: DashboardService, useValue: mockDashboardService },
          { provide: ForecastService, useValue: singleValueForecastService },
        ],
      });

      const testFixture = TestBed.createComponent(ForecastComponent);
      const testComponent = testFixture.componentInstance;
      testFixture.detectChanges();

      const chartData = testComponent.chartData();

      // should show only the hour with the non-zero value
      expect(chartData.labels).toEqual(['12']);
      expect(chartData.datasets[0].data).toEqual([7.5]);
    });
  });
});
