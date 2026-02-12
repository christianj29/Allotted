import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { CreateDeviceRequest, UserRow } from '../../shared/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-device-create-page',
  standalone: true,
  imports: [AppShellComponent, FormsModule, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="Add Device">
      <section class="panel">
        <div class="panel-header">
          <h2></h2>
          <a class="back" routerLink="/devices">← Back to devices</a>
        </div>
        <form class="form-grid" (ngSubmit)="createDevice()" autocomplete="off">
          <label>
            Name
            <input
              name="name"
              [(ngModel)]="form.name"
              [class.invalid]="fieldErrors.name"
              required
              autocomplete="off"
            />
            <span class="field-error" *ngIf="fieldErrors.name">{{ fieldErrors.name }}</span>
          </label>
          <label>
            Model
            <select
              name="model"
              [(ngModel)]="form.model"
              [class.invalid]="fieldErrors.model"
              required
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
            <span class="field-error" *ngIf="fieldErrors.model">{{ fieldErrors.model }}</span>
          </label>
          <label>
            User
            <select name="userId" [(ngModel)]="form.userId">
              <option [ngValue]="null">Unassigned</option>
              <option *ngFor="let user of users" [ngValue]="user.id">
                {{ user.fullName }} ({{ user.username }})
              </option>
            </select>
          </label>
          <label class="full">
            Serial number
            <input
              name="serialNumber"
              [(ngModel)]="form.serialNumber"
              [class.invalid]="fieldErrors.serialNumber"
              required
              autocomplete="off"
            />
            <span class="field-error" *ngIf="fieldErrors.serialNumber">{{ fieldErrors.serialNumber }}</span>
          </label>
          <label>
            UDID
            <input name="udid" [(ngModel)]="form.udid" autocomplete="off" />
          </label>
          <label>
            Processor type
            <input name="processorType" [(ngModel)]="form.processorType" autocomplete="off" />
          </label>
          <label>
            Primary MAC address
            <input name="primaryMacAddress" [(ngModel)]="form.primaryMacAddress" autocomplete="off" />
          </label>
          <label>
            Secondary MAC address
            <input name="secondaryMacAddress" [(ngModel)]="form.secondaryMacAddress" autocomplete="off" />
          </label>
          <div class="full actions">
            <button type="submit" [disabled]="isSaving">Add device</button>
            <span class="status error" *ngIf="formError">{{ formError }}</span>
            <span class="status success" *ngIf="formSuccess">{{ formSuccess }}</span>
          </div>
        </form>
      </section>
    </app-shell>
  `,
  styles: [
    `
      .panel {
        background: #fff;
        border-radius: 14px;
        border: 1px solid #dbe5f6;
        padding: 18px;
      }
      .panel-header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
      }
      .panel-header h2 {
        margin: 0;
        font-size: 18px;
        color: #1f2b45;
      }
      .back {
        color: #1f2b45;
        font-size: 13px;
        text-decoration: none;
        font-weight: 700;
      }
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px 16px;
      }
      label {
        display: grid;
        gap: 6px;
        font-size: 12px;
        color: #42506b;
        font-weight: 600;
      }
      input,
      select {
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid #d2d9ea;
        font-size: 14px;
      }
      input.invalid,
      select.invalid {
        border-color: #c0392b;
        box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.1);
      }
      .field-error {
        color: #a12424;
        font-size: 11px;
      }
      .full {
        grid-column: 1 / -1;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      button {
        border: none;
        background: #1f2b45;
        color: #fff;
        padding: 10px 16px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .status { margin-top: 10px; color: #3d4d6d; }
      .status.error { color: #a12424; }
      .status.success { color: #1f7a3f; }
      @media (max-width: 900px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class DeviceCreatePageComponent implements OnInit {
  protected isSaving = false;
  protected formError = '';
  protected formSuccess = '';
  protected fieldErrors: {
    name?: string;
    model?: string;
    serialNumber?: string;
  } = {};
  protected users: UserRow[] = [];
  protected form: CreateDeviceRequest = {
    name: '',
    model: '',
    serialNumber: '',
    udid: '',
    processorType: '',
    primaryMacAddress: '',
    secondaryMacAddress: '',
    compliant: false,
    userId: null
  };

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.api.getUsers().pipe(
      catchError(() => of([]))
    ).subscribe((rows) => {
      this.users = Array.isArray(rows) ? rows : [];
      this.cdr.detectChanges();
    });
  }

  protected createDevice(): void {
    this.formError = '';
    this.formSuccess = '';
    this.fieldErrors = {};
    const payload = this.cleanPayload();
    if (!payload) return;

    this.isSaving = true;
    this.api.createDevice(payload).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to add device.';
        this.formError = message;
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res) => {
      if (!res?.id) return;
      this.formSuccess = 'Device added. Redirecting...';
      this.fieldErrors = {};
      setTimeout(() => this.router.navigate(['/devices']), 500);
    });
  }

  private cleanPayload(): CreateDeviceRequest | null {
    const name = this.form.name.trim();
    const model = this.form.model.trim();
    const serialNumber = this.form.serialNumber.trim();

    if (!name) this.fieldErrors.name = 'Name is required.';
    if (!model) this.fieldErrors.model = 'Model is required.';
    if (!serialNumber) this.fieldErrors.serialNumber = 'Serial number is required.';

    if (Object.keys(this.fieldErrors).length > 0) {
      this.formError = 'Please fix the highlighted fields.';
      return null;
    }

    return {
      ...this.form,
      name,
      model,
      serialNumber
    };
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
    'iPad (8th gen) 10.2" A12 32GB': {
      processorType: 'A12'
    },
    'iPad (9th gen) 10.2" A13 64GB': {
      processorType: 'A13'
    },
    'iPad (10th gen) 10.9" A14 64GB': {
      processorType: 'A14'
    },
    'iPad Air (4th gen) 10.9" A14 64GB': {
      processorType: 'A14'
    },
    'iPad Air (5th gen) 10.9" M1 64GB': {
      processorType: 'M1'
    },
    'iPad Air (6th gen) 11" M2 128GB': {
      processorType: 'M2'
    },
    'iPad Air (6th gen) 13" M2 128GB': {
      processorType: 'M2'
    },
    'iPad mini (6th gen) 8.3" A15 64GB': {
      processorType: 'A15'
    },
    'iPad Pro 11" (2020) A12Z 128GB': {
      processorType: 'A12Z'
    },
    'iPad Pro 12.9" (2020) A12Z 128GB': {
      processorType: 'A12Z'
    },
    'iPad Pro 11" (2021) M1 128GB': {
      processorType: 'M1'
    },
    'iPad Pro 12.9" (2021) M1 128GB': {
      processorType: 'M1'
    },
    'iPad Pro 11" (2022) M2 128GB': {
      processorType: 'M2'
    },
    'iPad Pro 12.9" (2022) M2 128GB': {
      processorType: 'M2'
    },
    'iPad Pro 11" (2024) M4 256GB': {
      processorType: 'M4'
    },
    'iPad Pro 13" (2024) M4 256GB': {
      processorType: 'M4'
    }
  };
}
