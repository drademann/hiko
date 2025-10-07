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
});
