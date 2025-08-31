import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
})
export class StatusComponent implements OnInit, OnDestroy {
  private refreshService = inject(DashboardService);
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.refreshService.refresh$
      .pipe(filter((route) => route === 'status'))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refresh(): void {
    console.log('StatusComponent: refreshing data...');
  }
}
