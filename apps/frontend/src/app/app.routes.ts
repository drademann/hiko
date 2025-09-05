import { Route } from '@angular/router';
import { DashboardComponent } from '@hiko/frontend-feature-dashboard';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'status' },
      {
        path: 'forecast',
        loadComponent: () => import('./features/forecast/forecast.component').then((m) => m.ForecastComponent),
      },
      {
        path: 'status',
        loadComponent: () => import('./features/status/status.component').then((m) => m.StatusComponent),
      },
      {
        path: 'wallbox',
        loadComponent: () => import('./features/wallbox/wallbox.component').then((m) => m.WallboxComponent),
      },
    ],
  },
];
