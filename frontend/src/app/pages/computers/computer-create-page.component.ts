import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { CreateComputerRequest, UserRow } from '../../shared/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-computer-create-page',
  standalone: true,
  imports: [AppShellComponent, FormsModule, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="Add Computer">
      <section class="panel">
        <div class="panel-header">
          <h2></h2>
          <a class="back" routerLink="/computers">← Back to computers</a>
        </div>
        <form class="form-grid" (ngSubmit)="createComputer()" autocomplete="off">
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
              <option value="" disabled>Select a model</option>
              <option value='13" Intel MacBook Air 8GB 256GB'>13" Intel MacBook Air 8GB 256GB</option>
              <option value='13" Intel MacBook Pro 16GB 512GB'>13" Intel MacBook Pro 16GB 512GB</option>
              <option value='16" Intel MacBook Pro 16GB 512GB'>16" Intel MacBook Pro 16GB 512GB</option>
              <option value='13" M1 MacBook Air 8GB 256GB'>13" M1 MacBook Air 8GB 256GB</option>
              <option value='13" M1 MacBook Pro 16GB 512GB'>13" M1 MacBook Pro 16GB 512GB</option>
              <option value='14" M1 Pro MacBook Pro 16GB 512GB'>14" M1 Pro MacBook Pro 16GB 512GB</option>
              <option value='16" M1 Pro MacBook Pro 16GB 512GB'>16" M1 Pro MacBook Pro 16GB 512GB</option>
              <option value='14" M1 Max MacBook Pro 16GB 512GB'>14" M1 Max MacBook Pro 16GB 512GB</option>
              <option value='16" M1 Max MacBook Pro 16GB 512GB'>16" M1 Max MacBook Pro 16GB 512GB</option>
              <option value='13" M2 MacBook Air 8GB 256GB'>13" M2 MacBook Air 8GB 256GB</option>
              <option value='15" M2 MacBook Air 8GB 256GB'>15" M2 MacBook Air 8GB 256GB</option>
              <option value='13" M2 MacBook Pro 16GB 512GB'>13" M2 MacBook Pro 16GB 512GB</option>
              <option value='14" M2 Pro MacBook Pro 16GB 512GB'>14" M2 Pro MacBook Pro 16GB 512GB</option>
              <option value='16" M2 Pro MacBook Pro 16GB 512GB'>16" M2 Pro MacBook Pro 16GB 512GB</option>
              <option value='14" M2 Max MacBook Pro 16GB 512GB'>14" M2 Max MacBook Pro 16GB 512GB</option>
              <option value='16" M2 Max MacBook Pro 16GB 512GB'>16" M2 Max MacBook Pro 16GB 512GB</option>
              <option value='13" M3 MacBook Air 8GB 256GB'>13" M3 MacBook Air 8GB 256GB</option>
              <option value='15" M3 MacBook Air 8GB 256GB'>15" M3 MacBook Air 8GB 256GB</option>
              <option value='14" M3 MacBook Pro 16GB 512GB'>14" M3 MacBook Pro 16GB 512GB</option>
              <option value='14" M3 Pro MacBook Pro 16GB 512GB'>14" M3 Pro MacBook Pro 16GB 512GB</option>
              <option value='16" M3 Pro MacBook Pro 16GB 512GB'>16" M3 Pro MacBook Pro 16GB 512GB</option>
              <option value='14" M3 Max MacBook Pro 16GB 512GB'>14" M3 Max MacBook Pro 16GB 512GB</option>
              <option value='16" M3 Max MacBook Pro 16GB 512GB'>16" M3 Max MacBook Pro 16GB 512GB</option>
              <option value='14" M4 MacBook Pro 16GB 512GB'>14" M4 MacBook Pro 16GB 512GB</option>
              <option value='14" M4 Pro MacBook Pro 16GB 512GB'>14" M4 Pro MacBook Pro 16GB 512GB</option>
              <option value='16" M4 Pro MacBook Pro 16GB 512GB'>16" M4 Pro MacBook Pro 16GB 512GB</option>
              <option value='14" M4 Max MacBook Pro 16GB 512GB'>14" M4 Max MacBook Pro 16GB 512GB</option>
              <option value='16" M4 Max MacBook Pro 16GB 512GB'>16" M4 Max MacBook Pro 16GB 512GB</option>
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
            Model identifier
            <input name="modelIdentifier" [(ngModel)]="form.modelIdentifier" autocomplete="off" />
          </label>
          <label>
            Processor type
            <input name="processorType" [(ngModel)]="form.processorType" autocomplete="off" />
          </label>
          <label>
            Architecture
            <input name="architectureType" [(ngModel)]="form.architectureType" autocomplete="off" />
          </label>
          <label>
            Cache size
            <input name="cacheSize" [(ngModel)]="form.cacheSize" autocomplete="off" />
          </label>
          <div class="full actions">
            <button type="submit" [disabled]="isSaving">Add computer</button>
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
export class ComputerCreatePageComponent implements OnInit {
  protected isSaving = false;
  protected formError = '';
  protected formSuccess = '';
  protected fieldErrors: {
    name?: string;
    model?: string;
    serialNumber?: string;
  } = {};
  protected users: UserRow[] = [];
  protected form: CreateComputerRequest = {
    name: '',
    model: '',
    serialNumber: '',
    modelIdentifier: '',
    processorType: '',
    architectureType: '',
    cacheSize: '',
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

  protected createComputer(): void {
    this.formError = '';
    this.formSuccess = '';
    this.fieldErrors = {};
    const payload = this.cleanPayload();
    if (!payload) return;

    this.isSaving = true;
    this.api.createComputer(payload).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to add computer.';
        this.formError = message;
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res) => {
      if (!res?.id) return;
      this.formSuccess = 'Computer added. Redirecting...';
      this.fieldErrors = {};
      setTimeout(() => this.router.navigate(['/computers']), 500);
    });
  }

  private cleanPayload(): CreateComputerRequest | null {
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
      this.form.modelIdentifier = '';
      this.form.processorType = '';
      this.form.architectureType = '';
      this.form.cacheSize = '';
      return;
    }
    this.form.modelIdentifier = details.modelIdentifier;
    this.form.processorType = details.processorType;
    this.form.architectureType = details.architectureType;
    this.form.cacheSize = details.cacheSize;
  }

  private readonly modelDetails: Record<string, {
    modelIdentifier: string;
    processorType: string;
    architectureType: string;
    cacheSize: string;
  }> = {
    '13" Intel MacBook Air 8GB 256GB': {
      modelIdentifier: '13" MacBook Air',
      processorType: 'Intel',
      architectureType: 'x86_64',
      cacheSize: 'N/A'
    },
    '13" Intel MacBook Pro 16GB 512GB': {
      modelIdentifier: '13" MacBook Pro',
      processorType: 'Intel',
      architectureType: 'x86_64',
      cacheSize: 'N/A'
    },
    '16" Intel MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'Intel',
      architectureType: 'x86_64',
      cacheSize: 'N/A'
    },
    '13" M1 MacBook Air 8GB 256GB': {
      modelIdentifier: '13" MacBook Air',
      processorType: 'M1',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '13" M1 MacBook Pro 16GB 512GB': {
      modelIdentifier: '13" MacBook Pro',
      processorType: 'M1',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M1 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M1 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M1 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M1 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M1 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M1 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M1 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M1 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '13" M2 MacBook Air 8GB 256GB': {
      modelIdentifier: '13" MacBook Air',
      processorType: 'M2',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '15" M2 MacBook Air 8GB 256GB': {
      modelIdentifier: '15" MacBook Air',
      processorType: 'M2',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '13" M2 MacBook Pro 16GB 512GB': {
      modelIdentifier: '13" MacBook Pro',
      processorType: 'M2',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M2 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M2 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M2 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M2 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M2 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M2 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M2 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M2 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '13" M3 MacBook Air 8GB 256GB': {
      modelIdentifier: '13" MacBook Air',
      processorType: 'M3',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '15" M3 MacBook Air 8GB 256GB': {
      modelIdentifier: '15" MacBook Air',
      processorType: 'M3',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M3 MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M3',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M3 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M3 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M3 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M3 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M3 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M3 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M3 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M3 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M4 MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M4',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M4 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M4 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M4 Pro MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M4 Pro',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '14" M4 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '14" MacBook Pro',
      processorType: 'M4 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    },
    '16" M4 Max MacBook Pro 16GB 512GB': {
      modelIdentifier: '16" MacBook Pro',
      processorType: 'M4 Max',
      architectureType: 'ARM64',
      cacheSize: 'N/A'
    }
  };
}
