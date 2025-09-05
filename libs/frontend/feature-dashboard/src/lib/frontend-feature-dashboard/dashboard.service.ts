import { Injectable, signal } from '@angular/core';

export interface RefreshEvent {
  route: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private refreshSignal = signal<RefreshEvent | null>(null);

  readonly currentRefreshRoute = this.refreshSignal.asReadonly();

  triggerRefresh(route: string): void {
    this.refreshSignal.set({
      route,
      timestamp: Date.now(),
    });
  }
}
