import { Component, computed, effect, inject, OnDestroy } from '@angular/core';
import { WallboxService } from './wallbox.service';
import { DecimalPipe } from '@angular/common';
import { HoursPipe } from '@hiko/shared-ui';
import { DashboardService } from '@hiko/frontend-feature-dashboard';

@Component({
  selector: 'lib-wallbox',
  imports: [DecimalPipe, HoursPipe],
  templateUrl: './wallbox.component.html',
  styleUrl: './wallbox.component.scss',
})
export class WallboxComponent implements OnDestroy {
  private readonly wallboxService = inject(WallboxService);
  private dashboardService = inject(DashboardService);
  private autoRefreshInterval?: number;

  readonly wallboxState = this.wallboxService.wallboxState;
  readonly status = computed(() => {
    switch (this.wallboxState()?.connectionState) {
      case 'NoVehicleConnected':
        return 'kein Fahrzeug verbunden';
      case 'ConnectedNotCharging':
        return 'Fahrzeug verbunden';
      case 'ConnectedCharging':
        return 'Fahrzeug wird geladen';
      default:
        return 'unbekannt';
    }
  });

  constructor() {
    effect(() => {
      const refreshEvent = this.dashboardService.currentRefreshRoute();
      if (refreshEvent?.route === 'wallbox') {
        this.refresh();
      }
    });

    effect(() => {
      const connectionState = this.wallboxState()?.connectionState;
      const isVehicleConnected = connectionState === 'ConnectedNotCharging' || connectionState === 'ConnectedCharging';

      if (isVehicleConnected) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    });
  }

  refresh(): void {
    console.log('wallbox refreshing data...');
    this.wallboxService.refresh();
  }

  private startAutoRefresh(): void {
    if (!this.autoRefreshInterval) {
      console.log('wallbox starting auto-refresh...');
      this.autoRefreshInterval = window.setInterval(() => this.refresh(), 60000);
    }
  }

  private stopAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      console.log('wallbox stopping auto-refresh...');
      window.clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }
}
