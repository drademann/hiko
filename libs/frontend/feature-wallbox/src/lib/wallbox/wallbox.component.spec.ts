import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WallboxComponent } from './wallbox.component';
import { WallboxService } from './wallbox.service';
import { DashboardService, RefreshEvent } from '@hiko/frontend-feature-dashboard';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { Unit, WallboxStateDTO } from '@hiko/api';

describe('WallboxComponent', () => {
  let component: WallboxComponent;
  let fixture: ComponentFixture<WallboxComponent>;

  let wallboxService: WallboxService;
  let dashboardService: DashboardService;

  let signalWallboxState: ReturnType<typeof signal<WallboxStateDTO | undefined>>;
  let signalCurrentRefreshRoute: ReturnType<typeof signal<RefreshEvent | null>>;

  const mockWallboxState: WallboxStateDTO = {
    connectionState: 'NoVehicleConnected',
    charged: { value: 10, unit: Unit.kWh },
    duration: { value: 1800, unit: Unit.Seconds },
    power: { value: 11.3, unit: Unit.kW },
    ambientTemperature: { value: 22.5, unit: Unit.Celsius },
  };

  beforeEach(async () => {
    signalWallboxState = signal<WallboxStateDTO | undefined>(mockWallboxState);
    signalCurrentRefreshRoute = signal<null>(null);

    const wallboxServiceSpy = {
      refresh: jest.fn(),
      wallboxState: signalWallboxState.asReadonly(),
    };
    const dashboardServiceSpy = {
      triggerRefresh: jest.fn(),
      currentRefreshRoute: signalCurrentRefreshRoute.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [WallboxComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WallboxService, useValue: wallboxServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WallboxComponent);
    component = fixture.componentInstance;
    wallboxService = TestBed.inject(WallboxService);
    dashboardService = TestBed.inject(DashboardService);
    fixture.detectChanges();
  });

  describe('component creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have wallboxState from service', () => {
      expect(component.wallboxState).toBeDefined();
      expect(component.wallboxState()).toEqual(mockWallboxState);
    });
  });

  describe('status computed property', () => {
    it('should return "kein Fahrzeug verbunden" for NoVehicleConnected state', () => {
      signalWallboxState.set({ connectionState: 'NoVehicleConnected' } as WallboxStateDTO);
      fixture.detectChanges();

      expect(component.status()).toBe('kein Fahrzeug verbunden');
    });

    it('should return "Fahrzeug verbunden" for ConnectedNotCharging state', () => {
      signalWallboxState.set({ connectionState: 'ConnectedNotCharging' } as WallboxStateDTO);
      fixture.detectChanges();

      expect(component.status()).toBe('Fahrzeug verbunden');
    });

    it('should return "Fahrzeug wird geladen" for ConnectedCharging state', () => {
      signalWallboxState.set({ connectionState: 'ConnectedCharging' } as WallboxStateDTO);
      fixture.detectChanges();

      expect(component.status()).toBe('Fahrzeug wird geladen');
    });

    it('should return "unbekannt" for unknown connection state', () => {
      signalWallboxState.set({ connectionState: 'UnknownState' } as WallboxStateDTO);
      fixture.detectChanges();

      expect(component.status()).toBe('unbekannt');
    });

    it('should return "unbekannt" when wallboxState is undefined', () => {
      signalWallboxState.set(undefined);
      fixture.detectChanges();

      expect(component.status()).toBe('unbekannt');
    });
  });

  describe('refresh functionality', () => {
    it('should call wallboxService.refresh when refresh method is called', () => {
      component.refresh();
      expect(wallboxService.refresh).toHaveBeenCalled();
    });

    it('should refresh when dashboard service triggers wallbox refresh', () => {
      jest.spyOn(component, 'refresh').mockImplementation();

      // simulate a dashboard refresh event for wallbox route
      signalCurrentRefreshRoute.set({
        route: 'wallbox',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(component.refresh).toHaveBeenCalled();
    });

    it('should not refresh when dashboard service triggers refresh for different route', () => {
      jest.spyOn(component, 'refresh').mockImplementation();

      // simulate a dashboard refresh event for different route
      signalCurrentRefreshRoute.set({
        route: 'other-route',
        timestamp: Date.now(),
      });
      fixture.detectChanges();

      expect(component.refresh).not.toHaveBeenCalled();
    });

    it('should not refresh when refresh event is null', () => {
      jest.spyOn(component, 'refresh').mockImplementation();

      signalCurrentRefreshRoute.set(null);
      fixture.detectChanges();

      expect(component.refresh).not.toHaveBeenCalled();
    });
  });

  describe('component integration', () => {
    it('should properly integrate with injected services', () => {
      expect(component['wallboxService']).toBe(wallboxService);
      expect(component['dashboardService']).toBe(dashboardService);
    });

    it('should have readonly wallboxState property', () => {
      expect(component.wallboxState).toBeDefined();
      expect(typeof component.wallboxState).toBe('function'); // Signal is a function
    });

    it('should have computed status property', () => {
      expect(component.status).toBeDefined();
      expect(typeof component.status).toBe('function'); // Computed signal is a function
    });
  });

  describe('constructor effect', () => {
    it('should set up effect to listen for dashboard refresh events', () => {
      // the actual effect behavior is tested in the refresh functionality tests
      expect(component).toBeTruthy();
      expect(dashboardService.currentRefreshRoute).toBeDefined();
    });
  });
});
