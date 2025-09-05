import { Component, inject } from '@angular/core';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'lib-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabNav, MatTabLink, MatTabNavPanel, MatFabButton, MatIcon],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private router = inject(Router);
  private dashboardService = inject(DashboardService);

  refresh(): void {
    const currentRoute = this.router.url.split('/').pop() || '';
    console.log(`dashboard triggering refresh for route: ${currentRoute}`);
    this.dashboardService.triggerRefresh(currentRoute);
  }
}
