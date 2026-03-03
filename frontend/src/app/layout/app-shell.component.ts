import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf],
  // Shared shell layout with sidebar navigation and page header.
  template: `
    <div class="shell-bg">
      <aside class="sidebar">
        <div class="brand">
          <img src="assets/Allotted.png" alt="Allotted logo" />
        </div>
        <a *ngFor="let item of nav" [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
        <button type="button" class="logout" (click)="logout()" aria-label="Log out">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path
                d="M15 3H9a2 2 0 0 0-2 2v4h2V5h6v14H9v-4H7v4a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-2.5 6.5 1.4 1.4-1.6 1.6H7v2h5.3l1.6 1.6-1.4 1.4L8.7 12l3.8-2.5Z"
              />
            </svg>
          </span>
          <span>Log out</span>
        </button>
      </aside>

      <main class="content">
        <ng-content select="[page-top]"></ng-content>
        <header class="page-head">
          <h1>{{ title }}</h1>
          <div class="logo-chip" *ngIf="showHeaderLogo">
            <img src="assets/Allotted.png" alt="Allotted logo" />
          </div>
        </header>
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styleUrls: ['./app-shell.component.css']
})
export class AppShellComponent {
  // Header configuration passed by each page.
  @Input() title = '';
  @Input() showHeaderLogo = true;
  // Sidebar navigation items.
  protected readonly nav = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Computers', path: '/computers' },
    { label: 'Devices', path: '/devices' },
    { label: 'Users', path: '/users' },
    { label: 'Account', path: '/account' }
  ];

  constructor(private readonly router: Router) {}

  // Clear stored session data and return to login.
  protected logout(): void {
    localStorage.removeItem('sessionUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('auth0User');
    localStorage.removeItem('auth0Token');
    localStorage.removeItem('pendingLoginEmail');
    this.router.navigate(['/login']);
  }
}
