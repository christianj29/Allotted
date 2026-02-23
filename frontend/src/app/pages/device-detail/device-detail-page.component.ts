import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { CreateDeviceRequest, Device, UserRow } from '../../shared/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, NgFor, FormsModule],
  // Device detail view with edit and delete actions.
  template: `
    <app-shell title="Device Info">
      <div *ngIf="device" class="card">
        <div class="info-row">
          <span class="label">Name</span>
          <span class="value" *ngIf="!isEditing">{{ device.name }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.name" />
        </div>
        <div class="info-row">
          <span class="label">Model</span>
          <span class="value" *ngIf="!isEditing">{{ device.model }}</span>
          <select
            class="value-input"
            *ngIf="isEditing"
            [(ngModel)]="form.model"
            (ngModelChange)="onModelChange($event)"
          >
            <option value="" disabled>Select an iPad model</option>
            <option value='iPad (8th gen) 10.2" A12 32GB'>iPad (8th gen) 10.2" A12 32GB</option>
            <option value='iPad (9th gen) 10.2" A13 64GB'>iPad (9th gen) 10.2" A13 64GB</option>
            <option value='iPad (10th gen) 10.9" A14 64GB'>iPad (10th gen) 10.9" A14 64GB</option>
            <option value='iPad Air (4th gen) 10.9" A14 64GB'>iPad Air (4th gen) 10.9" A14 64GB</option>
            <option value='iPad Air (5th gen) 10.9" M1 64GB'>iPad Air (5th gen) 10.9" M1 64GB</option>
            <option value='iPad Air (6th gen) 11" M2 128GB'>iPad Air (6th gen) 11" M2 128GB</option>
            <option value='iPad Air (6th gen) 13" M2 128GB'>iPad Air (6th gen) 13" M2 128GB</option>
            <option value='iPad mini (6th gen) 8.3" A15 64GB'>iPad mini (6th gen) 8.3" A15 64GB</option>
            <option value='iPad Pro 11" (2020) A12Z 128GB'>iPad Pro 11" (2020) A12Z 128GB</option>
            <option value='iPad Pro 12.9" (2020) A12Z 128GB'>iPad Pro 12.9" (2020) A12Z 128GB</option>
            <option value='iPad Pro 11" (2021) M1 128GB'>iPad Pro 11" (2021) M1 128GB</option>
            <option value='iPad Pro 12.9" (2021) M1 128GB'>iPad Pro 12.9" (2021) M1 128GB</option>
            <option value='iPad Pro 11" (2022) M2 128GB'>iPad Pro 11" (2022) M2 128GB</option>
            <option value='iPad Pro 12.9" (2022) M2 128GB'>iPad Pro 12.9" (2022) M2 128GB</option>
            <option value='iPad Pro 11" (2024) M4 256GB'>iPad Pro 11" (2024) M4 256GB</option>
            <option value='iPad Pro 13" (2024) M4 256GB'>iPad Pro 13" (2024) M4 256GB</option>
          </select>
        </div>
        <div class="info-row">
          <span class="label">User</span>
          <span class="value" *ngIf="!isEditing">{{ device.user || '-' }}</span>
          <select class="value-input" *ngIf="isEditing" [(ngModel)]="form.userId">
            <option [ngValue]="null">Unassigned</option>
            <option *ngFor="let user of users" [ngValue]="user.id">{{ user.fullName }} ({{ user.username }})</option>
          </select>
        </div>
        <div class="info-row">
          <span class="label">Serial Number</span>
          <span class="value" *ngIf="!isEditing">{{ device.serialNumber }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.serialNumber" />
        </div>
        <div class="info-row">
          <span class="label">UDID</span>
          <span class="value" *ngIf="!isEditing">{{ device.udid || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.udid" />
        </div>
        <div class="info-row">
          <span class="label">Processor</span>
          <span class="value" *ngIf="!isEditing">{{ device.processorType || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.processorType" />
        </div>
        <div class="info-row">
          <span class="label">Primary MAC</span>
          <span class="value" *ngIf="!isEditing">{{ device.primaryMacAddress || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.primaryMacAddress" />
        </div>
        <div class="info-row">
          <span class="label">Secondary MAC</span>
          <span class="value" *ngIf="!isEditing">{{ device.secondaryMacAddress || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.secondaryMacAddress" />
        </div>
        <div class="actions">
          <button *ngIf="!isEditing" type="button" (click)="startEdit()">Edit</button>
          <button *ngIf="isEditing" type="button" (click)="saveEdit()" [disabled]="isSaving">Save</button>
          <button *ngIf="isEditing" type="button" class="ghost" (click)="cancelEdit()" [disabled]="isSaving">
            Cancel
          </button>
          <button *ngIf="!isEditing" type="button" class="danger" (click)="promptDelete()">Delete</button>
        </div>
      </div>
      <p class="status" *ngIf="isLoading">Loading device...</p>
      <p class="status error" *ngIf="!isLoading && errorMessage">{{ errorMessage }}</p>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm">
        <div class="modal">
          <p>Are you sure you want to delete this device?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDelete()" [disabled]="isDeleting">Confirm</button>
            <button type="button" class="ghost" (click)="cancelDelete()" [disabled]="isDeleting">Back</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteSuccess">
        <div class="modal">
          <p>Device deleted successfully.</p>
        </div>
      </div>
    </app-shell>
  `,
  styleUrls: ['./device-detail-page.component.css']
})
export class DeviceDetailPageComponent implements OnInit {
  // Device data and UI state.
  protected device?: Device;
  protected users: UserRow[] = [];
  protected isLoading = true;
  protected errorMessage = '';
  protected isEditing = false;
  protected isSaving = false;
  protected isDeleting = false;
  protected showDeleteConfirm = false;
  protected showDeleteSuccess = false;
  protected form: CreateDeviceRequest = {
    name: '',
    model: '',
    serialNumber: '',
    udid: '',
    processorType: '',
    primaryMacAddress: '',
    secondaryMacAddress: '',
    compliant: true,
    userId: null
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Load the device and lookup users for assignment.
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getUsers().pipe(catchError(() => of([]))).subscribe((rows) => {
      this.users = Array.isArray(rows) ? rows : [];
      this.cdr.detectChanges();
    });
    this.api.getDevice(id).pipe(
      catchError(() => {
        this.errorMessage = 'Could not load device info.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((value) => {
      if (!value) return;
      this.device = value;
      this.syncFormFromDevice();
    });
  }

  protected startEdit(): void {
    // Enter edit mode with current values.
    this.syncFormFromDevice();
    this.isEditing = true;
  }

  protected cancelEdit(): void {
    // Exit edit mode and restore values.
    this.isEditing = false;
    this.syncFormFromDevice();
  }

  protected saveEdit(): void {
    // Persist edits to the API.
    if (!this.device) return;
    this.isSaving = true;
    this.api.updateDevice(this.device.id, {
      ...this.form,
      name: this.form.name.trim(),
      model: this.form.model.trim(),
      serialNumber: this.form.serialNumber.trim()
    }).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to update device.';
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((updated) => {
      if (!updated) return;
      this.device = updated;
      this.isEditing = false;
    });
  }

  protected promptDelete(): void {
    // Show delete confirmation modal.
    this.showDeleteConfirm = true;
  }

  protected cancelDelete(): void {
    // Hide delete confirmation modal.
    this.showDeleteConfirm = false;
  }

  protected confirmDelete(): void {
    // Delete the device and return to the list.
    if (!this.device || this.isDeleting) return;
    this.isDeleting = true;
    this.api.deleteDevice(this.device.id).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete device.';
        return of(null);
      }),
      finalize(() => {
        this.isDeleting = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res) => {
      if (res === null) return;
      this.showDeleteConfirm = false;
      this.showDeleteSuccess = true;
      setTimeout(() => {
        this.showDeleteSuccess = false;
        this.router.navigate(['/devices']);
      }, 1200);
    });
  }

  private syncFormFromDevice(): void {
    // Populate the edit form from the loaded device.
    if (!this.device) return;
    this.form = {
      name: this.device.name || '',
      model: this.device.model || '',
      serialNumber: this.device.serialNumber || '',
      udid: this.device.udid || '',
      processorType: this.device.processorType || '',
      primaryMacAddress: this.device.primaryMacAddress || '',
      secondaryMacAddress: this.device.secondaryMacAddress || '',
      compliant: this.device.compliant ?? true,
      userId: null
    };
    const matchedUser = this.users.find((u) => u.username === this.device?.user);
    this.form.userId = matchedUser?.id ?? null;
  }

  protected onModelChange(model: string): void {
    // Autofill non-editable fields based on the selected model.
    const details = this.modelDetails[model];
    if (!details) {
      this.form.udid = '';
      this.form.processorType = '';
      this.form.primaryMacAddress = '';
      this.form.secondaryMacAddress = '';
      return;
    }
    this.form.udid = 'N/A';
    this.form.processorType = details.processorType || 'N/A';
    this.form.primaryMacAddress = 'N/A';
    this.form.secondaryMacAddress = 'N/A';
  }

  private readonly modelDetails: Record<string, {
    processorType: string;
  }> = {
    'iPad (8th gen) 10.2" A12 32GB': { processorType: 'A12' },
    'iPad (9th gen) 10.2" A13 64GB': { processorType: 'A13' },
    'iPad (10th gen) 10.9" A14 64GB': { processorType: 'A14' },
    'iPad Air (4th gen) 10.9" A14 64GB': { processorType: 'A14' },
    'iPad Air (5th gen) 10.9" M1 64GB': { processorType: 'M1' },
    'iPad Air (6th gen) 11" M2 128GB': { processorType: 'M2' },
    'iPad Air (6th gen) 13" M2 128GB': { processorType: 'M2' },
    'iPad mini (6th gen) 8.3" A15 64GB': { processorType: 'A15' },
    'iPad Pro 11" (2020) A12Z 128GB': { processorType: 'A12Z' },
    'iPad Pro 12.9" (2020) A12Z 128GB': { processorType: 'A12Z' },
    'iPad Pro 11" (2021) M1 128GB': { processorType: 'M1' },
    'iPad Pro 12.9" (2021) M1 128GB': { processorType: 'M1' },
    'iPad Pro 11" (2022) M2 128GB': { processorType: 'M2' },
    'iPad Pro 12.9" (2022) M2 128GB': { processorType: 'M2' },
    'iPad Pro 11" (2024) M4 256GB': { processorType: 'M4' },
    'iPad Pro 13" (2024) M4 256GB': { processorType: 'M4' }
  };
}
