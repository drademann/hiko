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
        loadComponent: () => import('@hiko/frontend-feature-forecast').then((m) => m.ForecastComponent),
      },
      {
        path: 'status',
        loadComponent: () => import('@hiko/frontend-feature-status').then((m) => m.StatusComponent),
      },
      {
        path: 'wallbox',
        loadComponent: () => import('@hiko/frontend-feature-wallbox').then((m) => m.WallboxComponent),
      },
    ],
  },
];
