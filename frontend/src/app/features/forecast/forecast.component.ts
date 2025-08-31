import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DashboardService } from '../../dashboard/dashboard.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-forecast',
  imports: [],
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.scss',
})
export class ForecastComponent implements OnInit, OnDestroy {
  private refreshService = inject(DashboardService);
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.refreshService.refresh$
      .pipe(filter((route) => route === 'forecast'))
      .subscribe(() => this.refresh());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  refresh(): void {
    console.log('ForecastComponent: refreshing data...');
  }
}
