import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Device } from '../../shared/models';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="Devices">
      <table>
        <thead>
          <tr>
            <th *ngIf="isDeleteMode"></th>
            <th>Name</th>
            <th>Model</th>
            <th>User</th>
            <th>Compliant</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of devices" [routerLink]="!isDeleteMode ? ['/devices', d.id] : null">
            <td *ngIf="isDeleteMode" class="checkbox-cell">
              <input
                type="checkbox"
                [checked]="selectedDeviceIds.has(d.id)"
                (click)="$event.stopPropagation()"
                (change)="toggleSelection(d.id, $event)"
                aria-label="Select device"
              />
            </td>
            <td>{{ d.name }}</td><td>{{ d.model }}</td><td>{{ d.user || '-' }}</td><td>{{ d.compliant ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="status" *ngIf="isLoading">Loading devices...</p>
      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="fab-stack">
        <button class="fab danger" type="button" (click)="handleDeleteAction()" aria-label="Delete devices">
          {{ isDeleteMode ? (selectedDeviceIds.size ? '✓' : '×') : '🗑' }}
        </button>
        <a class="fab" routerLink="/devices/new" aria-label="Add device">+</a>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm">
        <div class="modal">
          <p>Are you sure you want to delete {{ selectedDeviceIds.size }} devices?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDelete()" [disabled]="isDeleting">Confirm</button>
            <button type="button" class="ghost" (click)="cancelDelete()" [disabled]="isDeleting">Back</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteSuccess">
        <div class="modal">
          <p>Devices deleted successfully.</p>
        </div>
      </div>
    </app-shell>
  `,
  styles: [`
    table { width:100%; background:#fff; border-collapse:collapse; }
    th,td { padding:12px; border-bottom:1px solid #dbe5f6; }
    th { text-align: left; }
    tr{cursor:pointer;}
    tr:hover{background:#f2f7ff;}
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
    .modal-actions .danger {
      background: #912d2d;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 10px 16px;
      font-weight: 700;
      cursor: pointer;
    }
    .modal-actions .ghost {
      background: #e9eef8;
      color: #1f2b45;
      border: none;
      border-radius: 10px;
      padding: 10px 16px;
      font-weight: 700;
      cursor: pointer;
    }
  `]
})
export class DevicesPageComponent implements OnInit {
  protected devices: Device[] = [];
  protected isLoading = true;
  protected errorMessage = '';
  protected isDeleteMode = false;
  protected isDeleting = false;
  protected showDeleteConfirm = false;
  protected showDeleteSuccess = false;
  protected selectedDeviceIds = new Set<number>();

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getDevices().pipe(
      timeout(3000),
      catchError(() => {
        this.errorMessage = 'Could not load devices.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((rows) => {
      this.devices = Array.isArray(rows) ? rows : [];
    });
  }

  protected toggleSelection(deviceId: number, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedDeviceIds.add(deviceId);
    } else {
      this.selectedDeviceIds.delete(deviceId);
    }
  }

  protected handleDeleteAction(): void {
    if (this.isDeleting) return;
    if (!this.isDeleteMode) {
      this.isDeleteMode = true;
      this.selectedDeviceIds.clear();
      return;
    }

    if (this.selectedDeviceIds.size === 0) {
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
    const deletions = Array.from(this.selectedDeviceIds).map((id) => this.api.deleteDevice(id).pipe(
      catchError(() => of(null))
    ));

    forkJoin(deletions).pipe(
      finalize(() => {
        this.isDeleting = false;
        this.isDeleteMode = false;
        this.showDeleteConfirm = false;
        this.selectedDeviceIds.clear();
        this.cdr.detectChanges();
      })
    ).subscribe(() => {
      this.devices = this.devices.filter((d) => !this.selectedDeviceIds.has(d.id));
      this.showDeleteSuccess = true;
      setTimeout(() => {
        this.showDeleteSuccess = false;
        this.cdr.detectChanges();
      }, 1200);
    });
  }
}
