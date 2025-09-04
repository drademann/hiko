import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WallboxStateDTO } from '@hiko/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WallboxService {
  private http = inject(HttpClient);
  private refresh$ = new Subject<void>();

  wallboxState = toSignal(
    this.refresh$.pipe(
      switchMap(() => this.http.get<WallboxStateDTO>('/api/wallbox/state').pipe(catchError(() => of(undefined)))),
    ),
  );

  constructor() {
    this.refresh();
  }

  refresh() {
    this.refresh$.next();
  }
}
