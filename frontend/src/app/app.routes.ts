import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./pages/users/users-page.component').then((m) => m.UsersPageComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () =>
      import('./pages/user-detail/user-detail-page.component').then((m) => m.UserDetailPageComponent)
  },
  {
    path: 'devices',
    loadComponent: () =>
      import('./pages/devices/devices-page.component').then((m) => m.DevicesPageComponent)
  },
  {
    path: 'devices/:id',
    loadComponent: () =>
      import('./pages/device-detail/device-detail-page.component').then((m) => m.DeviceDetailPageComponent)
  },
  {
    path: 'computers',
    loadComponent: () =>
      import('./pages/computers/computers-page.component').then((m) => m.ComputersPageComponent)
  },
  {
    path: 'computers/:id',
    loadComponent: () =>
      import('./pages/computer-detail/computer-detail-page.component').then((m) => m.ComputerDetailPageComponent)
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account-page.component').then((m) => m.AccountPageComponent)
  }
];
