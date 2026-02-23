import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
}
