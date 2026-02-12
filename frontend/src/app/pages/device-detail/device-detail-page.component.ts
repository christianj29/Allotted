import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { CreateDeviceRequest, Device, UserRow } from '../../shared/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, NgFor, RouterLink, FormsModule],
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
  styles: [`
    .card {
      background: #fff;
      border: 1px solid #d7e2f4;
      border-radius: 14px;
      padding: 18px;
      display: grid;
      gap: 10px;
    }
    .info-row {
      display: grid;
      grid-template-columns: 180px 1fr;
      align-items: center;
      padding: 12px 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f5;
      background: #fbfcff;
    }
    .label {
      font-weight: 700;
      color: #5a667f;
      text-transform: none;
    }
    .value {
      color: #1f2b45;
      font-weight: 600;
    }
    .value-input {
      width: 100%;
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid #d2d9ea;
      font-size: 14px;
      font-weight: 600;
      color: #1f2b45;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 4px;
      justify-content: flex-end;
    }
    .actions button {
      border: none;
      background: #1f2b45;
      color: #fff;
      padding: 8px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
    }
    .actions button.ghost {
      background: #e9eef8;
      color: #1f2b45;
    }
    .actions button.danger {
      background: #912d2d;
    }
    .actions button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .status {
      margin-top: 12px;
      color: #3d4d6d;
      font-size: 14px;
    }
    .status.error {
      color: #a12424;
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
    }
    .modal-actions .ghost {
      background: #e9eef8;
      color: #1f2b45;
    }
    @media (max-width: 720px) {
      .info-row {
        grid-template-columns: 1fr;
        gap: 6px;
      }
    }
  `]
})
export class DeviceDetailPageComponent implements OnInit {
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
    this.syncFormFromDevice();
    this.isEditing = true;
  }

  protected cancelEdit(): void {
    this.isEditing = false;
    this.syncFormFromDevice();
  }

  protected saveEdit(): void {
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
    this.showDeleteConfirm = true;
  }

  protected cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  protected confirmDelete(): void {
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
