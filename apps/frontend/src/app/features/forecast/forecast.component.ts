import { Component, effect, inject } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-forecast',
  imports: [],
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.scss',
})
export class ForecastComponent {
  private dashboardService = inject(DashboardService);

  constructor() {
    effect(() => {
      const refreshEvent = this.dashboardService.currentRefreshRoute();
      if (refreshEvent?.route === 'forecast') {
        this.refresh();
      }
    });
  }

  refresh(): void {
    console.log('forecast refreshing data...');
  }
}
