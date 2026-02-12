import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { UserRow } from '../../shared/models';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="Users">
      <table>
        <thead>
          <tr>
            <th *ngIf="isDeleteMode"></th>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Department</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users" [routerLink]="!isDeleteMode ? ['/users', u.id] : null">
            <td *ngIf="isDeleteMode" class="checkbox-cell">
              <input
                type="checkbox"
                [checked]="selectedUserIds.has(u.id)"
                (click)="$event.stopPropagation()"
                (change)="toggleSelection(u.id, $event)"
                aria-label="Select user"
              />
            </td>
            <td>{{ u.fullName }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.department || '-' }}</td>
            <td>{{ u.role || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="status" *ngIf="isLoading">Loading users...</p>
      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="fab-stack">
        <button class="fab danger" type="button" (click)="handleDeleteAction()" aria-label="Delete users">
          {{ isDeleteMode ? (selectedUserIds.size ? '✓' : '×') : '🗑' }}
        </button>
        <a class="fab" routerLink="/users/new" aria-label="Add user">+</a>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm">
        <div class="modal">
          <p>Are you sure you want to delete {{ selectedUserIds.size }} users?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDelete()" [disabled]="isDeleting">Confirm</button>
            <button type="button" class="ghost" (click)="cancelDelete()" [disabled]="isDeleting">Back</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteSuccess">
        <div class="modal">
          <p>Users deleted successfully.</p>
        </div>
      </div>
    </app-shell>
  `,
  styles: [
    `
      table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; }
      th, td { text-align: left; padding: 14px; border-bottom: 1px solid #dbe5f6; }
      tr { cursor: pointer; }
      tr:hover { background: #f2f7ff; }
      .checkbox-cell { width: 44px; }
      .status { margin-top: 10px; color: #3d4d6d; }
      .status.error { color: #a12424; }
      .fab-stack {
        position: fixed;
        right: 28px;
        bottom: 28px;
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .fab {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #1f2b45;
        color: #fff;
        display: grid;
        place-items: center;
        font-size: 32px;
        text-decoration: none;
        box-shadow: 0 12px 24px rgba(20, 34, 63, 0.2);
        border: none;
        cursor: pointer;
      }
      .fab.danger {
        background: #912d2d;
        font-size: 22px;
      }
      .fab:hover {
        transform: translateY(-2px);
      }
      .fab:focus-visible {
        outline: 3px solid #1f2b45;
        outline-offset: 3px;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 24, 45, 0.35);
        display: grid;
        place-items: center;
        z-index: 1000;
      }
      .modal {
        background: #fff;
        border-radius: 16px;
        padding: 22px;
        min-width: 320px;
        box-shadow: 0 16px 40px rgba(20, 34, 63, 0.25);
        text-align: center;
      }
      .modal p {
        margin: 0 0 16px;
        font-weight: 600;
        color: #1f2b45;
      }
      .modal-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
      }
      .modal-actions button {
        border: none;
        border-radius: 10px;
        padding: 10px 16px;
        font-weight: 700;
        cursor: pointer;
      }
      .modal-actions .danger {
        background: #912d2d;
        color: #fff;
      }
      .modal-actions .ghost {
        background: #e9eef8;
        color: #1f2b45;
      }
    `
  ]
})
export class UsersPageComponent implements OnInit {
  protected users: UserRow[] = [];
  protected isLoading = true;
  protected errorMessage = '';
  protected isDeleteMode = false;
  protected isDeleting = false;
  protected showDeleteConfirm = false;
  protected showDeleteSuccess = false;
  protected selectedUserIds = new Set<number>();

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

  protected toggleSelection(userId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedUserIds.add(userId);
    } else {
      this.selectedUserIds.delete(userId);
    }
  }

  protected handleDeleteAction(): void {
    if (this.isDeleting) return;
    if (!this.isDeleteMode) {
      this.isDeleteMode = true;
      this.selectedUserIds.clear();
      return;
    }

    if (this.selectedUserIds.size === 0) {
      this.isDeleteMode = false;
      return;
    }
    this.showDeleteConfirm = true;
  }

  protected cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  protected confirmDelete(): void {
    if (this.isDeleting) return;
    this.isDeleting = true;
    this.errorMessage = '';
    const deletions = Array.from(this.selectedUserIds).map((id) => this.api.deleteUser(id).pipe(
      catchError(() => of(null))
    ));

    forkJoin(deletions).pipe(
      finalize(() => {
        this.isDeleting = false;
        this.isDeleteMode = false;
        this.showDeleteConfirm = false;
        this.selectedUserIds.clear();
        this.cdr.detectChanges();
      })
    ).subscribe(() => {
      this.users = this.users.filter((u) => !this.selectedUserIds.has(u.id));
      this.showDeleteSuccess = true;
      setTimeout(() => {
        this.showDeleteSuccess = false;
        this.cdr.detectChanges();
      }, 1200);
    });
  }
}
