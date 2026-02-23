import { Routes } from '@angular/router';

// Lazy-loaded route map for all top-level pages.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/login/auth-callback-page.component').then((m) => m.AuthCallbackPageComponent)
  },
  {
    path: 'create-account',
    loadComponent: () =>
      import('./pages/login/create-account-page.component').then((m) => m.CreateAccountPageComponent)
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
    path: 'users/new',
    loadComponent: () =>
      import('./pages/users/user-create-page.component').then((m) => m.UserCreatePageComponent)
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
    path: 'devices/new',
    loadComponent: () =>
      import('./pages/devices/device-create-page.component').then((m) => m.DeviceCreatePageComponent)
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
    path: 'computers/new',
    loadComponent: () =>
      import('./pages/computers/computer-create-page.component').then((m) => m.ComputerCreatePageComponent)
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
