import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor],
  template: `
    <div class="shell-bg">
      <aside class="sidebar">
        <div class="brand">
          <img src="assets/Allotted.png" alt="Allotted logo" />
        </div>
        <a *ngFor="let item of nav" [routerLink]="item.path" routerLinkActive="active">{{ item.label }}</a>
      </aside>

      <main class="content">
        <header class="page-head">
          <h1>{{ title }}</h1>
          <div class="logo-chip">
            <img src="assets/Allotted.png" alt="Allotted logo" />
          </div>
        </header>
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styles: [
    `
    .shell-bg {
      min-height: 100vh;
      background: radial-gradient(circle at 20% 10%, #d9e4ff, #edf2ff 40%, #f6f8fc 100%);
      display: grid;
      grid-template-columns: 230px 1fr;
      gap: 20px;
      padding: 20px;
      font-family: 'Avenir Next', 'Trebuchet MS', sans-serif;
    }
    .sidebar {
      background: linear-gradient(180deg, #0a2f83 0%, #0d2048 100%);
      border-radius: 16px;
      padding: 18px;
      color: #f9fbff;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .brand {
      margin-bottom: 18px;
      display: grid;
      place-items: center;
    }
    .brand img {
      width: 100%;
      max-width: 170px;
      height: auto;
      display: block;
    }
    .sidebar a {
      color: #d8e6ff;
      text-decoration: none;
      padding: 10px 12px;
      border-radius: 10px;
      font-weight: 600;
    }
    .sidebar a:hover, .sidebar a.active {
      background: #1d4fcc;
      color: #fff;
    }
    .content {
      background: #ffffffcc;
      backdrop-filter: blur(4px);
      border: 1px solid #dce4f4;
      border-radius: 18px;
      padding: 20px;
    }
    .page-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0;
      font-size: 32px;
      color: #1a2540;
    }
    .logo-chip {
      width: auto;
      height: auto;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-chip img {
      width: 140px;
      height: auto;
      display: block;
    }
    @media (max-width: 900px) {
      .shell-bg {
        grid-template-columns: 1fr;
      }
      .sidebar {
        flex-direction: row;
        align-items: center;
        overflow-x: auto;
      }
      .brand {
        margin: 0 16px 0 0;
      }
    }
    `
  ]
})
export class AppShellComponent {
  @Input() title = '';
  protected readonly nav = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Computers', path: '/computers' },
    { label: 'Devices', path: '/devices' },
    { label: 'Users', path: '/users' },
    { label: 'Account', path: '/account' }
  ];
}
