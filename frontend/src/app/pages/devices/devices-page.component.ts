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
  // List and bulk-delete devices.
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
  styleUrls: ['./devices-page.component.css']
})
export class DevicesPageComponent implements OnInit {
  // Table data and UI state.
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
    // Load devices on entry and surface errors.
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
    // Maintain the set of selected devices for deletion.
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedDeviceIds.add(deviceId);
    } else {
      this.selectedDeviceIds.delete(deviceId);
    }
  }

  protected handleDeleteAction(): void {
    // Toggle delete mode or open confirmation.
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
    // Hide the delete confirmation dialog.
    this.showDeleteConfirm = false;
  }

  protected confirmDelete(): void {
    // Execute bulk deletes and update the table.
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
