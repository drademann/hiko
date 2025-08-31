import { Component, computed, effect, inject } from '@angular/core';
import { WallboxService } from './wallbox.service';
import { DecimalPipe } from '@angular/common';
import { HoursPipe } from '../../core/hours-pipe';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-wallbox',
  imports: [DecimalPipe, HoursPipe],
  templateUrl: './wallbox.component.html',
  styleUrl: './wallbox.component.scss',
})
export class WallboxComponent {
  private readonly wallboxService = inject(WallboxService);
  private dashboardService = inject(DashboardService);

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
  }

  refresh(): void {
    console.log('wallbox refreshing data...');
    this.wallboxService.refresh();
  }
}
