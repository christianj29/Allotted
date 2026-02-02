import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, RouterLink],
  template: `
    <app-shell title="Account">
      <div *ngIf="user" class="card">
        <h3>{{ user.fullName }}</h3>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
        <p><strong>Primary Device:</strong> {{ user.deviceName || '-' }}</p>
        <p><strong>Primary Computer:</strong> {{ user.computerName || '-' }}</p>
        <a routerLink="/dashboard">Back to Dashboard</a>
      </div>
    </app-shell>
  `,
  styles: [`.card { background:#fff; border:1px solid #d7e2f4; border-radius:14px; padding:18px; }`]
})
export class AccountPageComponent implements OnInit {
  protected user?: any;

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.getUsers().subscribe((rows) => (this.user = rows[0]));
  }
}
