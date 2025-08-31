import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private refreshSubject = new Subject<string>();

  refresh$ = this.refreshSubject.asObservable();

  triggerRefresh(route: string): void {
    this.refreshSubject.next(route);
  }
}
