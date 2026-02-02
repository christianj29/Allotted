import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { UserRow } from '../../shared/models';
import { catchError, finalize, of, timeout } from 'rxjs';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="Users">
      <table>
        <thead>
          <tr><th>Username</th><th>Email</th><th>Device Name</th><th>Model</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users" [routerLink]="['/users', u.id]">
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.deviceName || u.computerName || '-' }}</td>
            <td>{{ u.model || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="status" *ngIf="isLoading">Loading users...</p>
      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </app-shell>
  `,
  styles: [
    `
      table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; }
      th, td { text-align: left; padding: 14px; border-bottom: 1px solid #dbe5f6; }
      tr { cursor: pointer; }
      tr:hover { background: #f2f7ff; }
      .status { margin-top: 10px; color: #3d4d6d; }
      .status.error { color: #a12424; }
    `
  ]
})
export class UsersPageComponent implements OnInit {
  protected users: UserRow[] = [];
  protected isLoading = true;
  protected errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getUsers().pipe(
      timeout(3000),
      catchError(() => {
        this.errorMessage = 'Could not load users.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((rows) => {
      this.users = Array.isArray(rows) ? rows : [];
    });
  }
}
