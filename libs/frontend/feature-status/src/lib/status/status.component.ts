import { Component, effect, inject } from '@angular/core';
import { DashboardService } from '@hiko/frontend-feature-dashboard';

@Component({
  selector: 'lib-status',
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
})
export class StatusComponent {
  private dashboardService = inject(DashboardService);

  constructor() {
    effect(() => {
      const refreshEvent = this.dashboardService.currentRefreshRoute();
      if (refreshEvent?.route === 'status') {
        this.refresh();
      }
    });
  }

  refresh(): void {
    console.log('status refreshing data...');
  }
}
