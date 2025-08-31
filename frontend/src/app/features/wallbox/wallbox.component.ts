import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { WallboxService } from './wallbox.service';
import { DecimalPipe } from '@angular/common';
import { HoursPipe } from '../../core/hours-pipe';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-wallbox',
  imports: [DecimalPipe, HoursPipe],
  templateUrl: './wallbox.component.html',
  styleUrl: './wallbox.component.scss',
})
export class WallboxComponent implements OnInit, OnDestroy {
  private readonly wallboxService = inject(WallboxService);
  private dashboardService = inject(DashboardService);
  private subscription?: Subscription;

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

  ngOnInit(): void {
    this.subscription = this.dashboardService.refresh$
      .pipe(filter((route) => route === 'wallbox'))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refresh(): void {
    console.log('WallboxComponent: refreshing data...');
    this.wallboxService.refresh();
  }
}
