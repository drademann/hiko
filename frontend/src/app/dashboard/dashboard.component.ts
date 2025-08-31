import { Component, inject } from '@angular/core';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatTabNav, MatTabLink, MatTabNavPanel, MatFabButton, MatIcon],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private router = inject(Router);
  private refreshService = inject(DashboardService);

  refresh(): void {
    const currentRoute = this.router.url.split('/').pop() || '';
    console.log(`DashboardComponent: triggering refresh for route: ${currentRoute}`);
    this.refreshService.triggerRefresh(currentRoute);
  }
}
