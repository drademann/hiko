import { Component, inject, effect } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';

@Component({
  selector: 'app-status',
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
