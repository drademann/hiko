import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ForecastDTO } from '@hiko/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ForecastService {
  private http = inject(HttpClient);
  private refresh$ = new Subject<void>();

  forecastData = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<ForecastDTO>('/api/forecast').pipe(catchError(() => of(undefined)))),
    ),
  );

  constructor() {
    this.refresh();
  }

  refresh() {
    this.refresh$.next();
  }
}
