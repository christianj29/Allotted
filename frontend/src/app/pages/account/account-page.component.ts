import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, NgFor, RouterLink, ReactiveFormsModule, FormsModule],
  template: `
    <app-shell title="Account">
      <div *ngIf="user" class="card">
        <div class="info-row">
          <span class="label">Name</span>
          <span class="value" *ngIf="!isEditing">{{ user.fullName }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.fullName" />
        </div>
        <div class="info-row">
          <span class="label">Username</span>
          <span class="value" *ngIf="!isEditing">{{ user.username }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.username" disabled />
        </div>
        <div class="info-row">
          <span class="label">Email</span>
          <span class="value" *ngIf="!isEditing">{{ user.email }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.email" type="email" />
        </div>
        <div class="info-row">
          <span class="label">Department</span>
          <span class="value" *ngIf="!isEditing">{{ user.department || '-' }}</span>
          <select
            class="value-input"
            *ngIf="isEditing"
            [(ngModel)]="form.department"
            (ngModelChange)="onDepartmentChange($event)"
          >
            <option value="" disabled>Select a department</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="IT">IT</option>
            <option value="Security">Security</option>
            <option value="DevOps">DevOps</option>
            <option value="Data">Data</option>
            <option value="QA">QA</option>
            <option value="Support">Support</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="Customer Success">Customer Success</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Legal">Legal</option>
          </select>
        </div>
        <div class="info-row">
          <span class="label">Role</span>
          <span class="value" *ngIf="!isEditing">{{ user.role || '-' }}</span>
          <select
            class="value-input"
            *ngIf="isEditing"
            [(ngModel)]="form.role"
            [disabled]="!availableRoles.length"
          >
            <option value="" disabled>
              {{ availableRoles.length ? 'Select a role' : 'Select department first' }}
            </option>
            <option *ngFor="let role of availableRoles" [value]="role">{{ role }}</option>
          </select>
        </div>
        <div class="info-row">
          <span class="label">Device Name</span>
          <span class="value">{{ primaryDevice?.name || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Device</span>
          <span class="value">{{ primaryDevice?.model || '-' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Serial Number</span>
          <span class="value">{{ primaryDevice?.serialNumber || '-' }}</span>
        </div>
        <button class="password-toggle" type="button" (click)="showPasswordForm = true">
          Update Password
        </button>
        <div class="modal-backdrop" *ngIf="showPasswordForm">
          <div class="modal">
            <form class="password-form" [formGroup]="forgotForm" (ngSubmit)="updatePassword()">
              <p class="password-hint">
                Password must be at least 8 characters and include an uppercase letter, a number, and a special character.
              </p>
              <input
                type="password"
                formControlName="newPassword"
                placeholder="new password"
                [class.invalid]="showPasswordError && forgotForm.get('newPassword')?.invalid"
              />
              <input
                type="password"
                formControlName="confirmPassword"
                placeholder="confirm new password"
                [class.invalid]="showPasswordError && (forgotForm.get('confirmPassword')?.invalid || passwordMismatch)"
              />
              <p class="message error" *ngIf="showPasswordError">{{ passwordErrorMessage }}</p>
              <div class="modal-actions">
                <button type="submit">Update Password</button>
                <button type="button" class="ghost" (click)="showPasswordForm = false">Back</button>
              </div>
            </form>
          </div>
        </div>
        <p class="message success" *ngIf="successMessage">{{ successMessage }}</p>
        <p class="message error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <div class="actions">
          <button *ngIf="!isEditing" type="button" (click)="startEdit()">Edit</button>
          <button *ngIf="isEditing" type="button" (click)="saveEdit()" [disabled]="isSaving">Save</button>
          <button *ngIf="isEditing" type="button" class="ghost" (click)="cancelEdit()" [disabled]="isSaving">
            Cancel
          </button>
          <button *ngIf="!isEditing" type="button" class="danger" (click)="promptDeactivate()">
            Deactivate my account
          </button>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeactivateConfirm">
        <div class="modal">
          <p>Are you sure you want to deactivate your account?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDeactivate()" [disabled]="isDeactivating">
              Confirm
            </button>
            <button type="button" class="ghost" (click)="cancelDeactivate()" [disabled]="isDeactivating">
              Back
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeactivateSuccess">
        <div class="modal">
          <p>Account deactivated.</p>
        </div>
      </div>
      <p class="status" *ngIf="isLoading">Loading account...</p>
      <p class="status error" *ngIf="!isLoading && errorMessage">{{ errorMessage }}</p>
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
    .password-toggle {
      border: none;
      background: #1f2b45;
      color: #fff;
      padding: 10px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      justify-self: start;
    }
    .password-form {
      display: grid;
      gap: 10px;
    }
    .password-form input,
    .password-form button {
      height: 42px;
      border-radius: 10px;
      border: 1px solid #c9d6ef;
      padding: 0 12px;
    }
    .password-form input.invalid {
      border-color: #c0392b;
      box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.1);
    }
    .password-form button {
      border: 0;
      background: #1a4ec9;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
    .message {
      margin-top: 12px;
      font-size: 13px;
    }
    .message.success { color: #1e7b3a; }
    .message.error { color: #a12424; }
    .password-hint {
      margin: 0;
      font-size: 12px;
      color: #5a667f;
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
    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .modal-actions .ghost {
      background: #e9eef8;
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
    @media (max-width: 720px) {
      .info-row {
        grid-template-columns: 1fr;
        gap: 6px;
      }
    }
  `]
})
export class AccountPageComponent implements OnInit {
  protected user?: any;
  protected primaryDevice?: { name: string; model: string; serialNumber: string };
  protected isLoading = true;
  protected errorMessage = '';
  protected successMessage = '';
  protected showPasswordForm = false;
  protected showPasswordError = false;
  protected passwordErrorMessage = '';
  protected passwordMismatch = false;
  protected isEditing = false;
  protected isSaving = false;
  protected form = {
    fullName: '',
    username: '',
    email: '',
    role: '',
    department: ''
  };
  protected availableRoles: string[] = [];
  protected showDeactivateConfirm = false;
  protected showDeactivateSuccess = false;
  protected isDeactivating = false;
  private readonly rolesByDepartment: Record<string, string[]> = {
    Engineering: ['Software Engineer', 'Senior Engineer', 'Tech Lead', 'Engineering Manager', 'CTO'],
    Product: ['Product Manager', 'Senior Product Manager', 'Product Owner', 'VP Product'],
    Design: ['Product Designer', 'UX Designer', 'UI Designer', 'Design Manager'],
    IT: ['IT Support Specialist', 'IT Administrator', 'Systems Engineer', 'IT Manager'],
    Security: ['Security Analyst', 'Security Engineer', 'Security Manager', 'CISO'],
    DevOps: ['DevOps Engineer', 'Site Reliability Engineer', 'Platform Engineer', 'DevOps Manager'],
    Data: ['Data Analyst', 'Data Engineer', 'Data Scientist', 'Analytics Manager'],
    QA: ['QA Engineer', 'Automation Engineer', 'QA Lead'],
    Support: ['Support Specialist', 'Support Engineer', 'Support Manager'],
    Sales: ['Sales Rep', 'Account Executive', 'Sales Manager', 'VP Sales'],
    Marketing: ['Marketing Specialist', 'Growth Marketer', 'Content Marketer', 'Marketing Manager'],
    'Customer Success': ['Customer Success Manager', 'Onboarding Specialist', 'CS Lead'],
    Operations: ['Operations Analyst', 'Operations Manager', 'COO'],
    Finance: ['Accountant', 'Financial Analyst', 'Controller', 'CFO'],
    HR: ['HR Generalist', 'Recruiter', 'People Ops Manager', 'CHRO'],
    Legal: ['Legal Counsel', 'Compliance Manager', 'General Counsel'],
  };
  protected readonly forgotForm = this.fb.group({
    newPassword: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).+$/)
      ]
    ],
    confirmPassword: ['', Validators.required]
  });

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly fb: FormBuilder,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    let userId: number | undefined;
    try {
      const rawUser = localStorage.getItem('authUser');
      const storedUser = rawUser ? JSON.parse(rawUser) : null;
      userId = storedUser?.id;
    } catch {
      userId = undefined;
    }
    if (!userId) {
      this.errorMessage = 'No logged in user found.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.api.getUser(userId).pipe(
      catchError(() => {
        this.errorMessage = 'Could not load account info.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((value) => {
      if (!value) return;
      this.user = value;
      this.syncFormFromUser();
      const computers = Array.isArray(value?.computers) ? value.computers : [];
      const devices = Array.isArray(value?.devices) ? value.devices : [];
      this.primaryDevice = computers[0] || devices[0] || undefined;
      this.cdr.detectChanges();
    });
  }

  protected startEdit(): void {
    this.syncFormFromUser();
    this.isEditing = true;
  }

  protected cancelEdit(): void {
    this.isEditing = false;
    this.syncFormFromUser();
  }

  protected saveEdit(): void {
    if (!this.user) return;
    this.isSaving = true;
    this.api.updateUser(this.user.id, {
      fullName: this.form.fullName.trim(),
      username: this.form.username.trim(),
      email: this.form.email.trim(),
      role: this.form.role.trim(),
      department: this.form.department.trim()
    }).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to update user.';
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((updated) => {
      if (!updated) return;
      this.user = { ...this.user, ...updated };
      this.isEditing = false;
    });
  }

  private syncFormFromUser(): void {
    if (!this.user) return;
    this.form = {
      fullName: this.user.fullName || '',
      username: this.user.username || '',
      email: this.user.email || '',
      role: this.user.role || '',
      department: this.user.department || ''
    };
    this.availableRoles = this.rolesByDepartment[this.form.department] ?? [];
  }

  protected onDepartmentChange(department: string): void {
    this.availableRoles = this.rolesByDepartment[department] ?? [];
    if (!this.availableRoles.includes(this.form.role)) {
      this.form.role = '';
    }
  }

  protected promptDeactivate(): void {
    this.showDeactivateConfirm = true;
  }

  protected cancelDeactivate(): void {
    this.showDeactivateConfirm = false;
  }

  protected confirmDeactivate(): void {
    if (!this.user || this.isDeactivating) return;
    this.isDeactivating = true;
    this.api.deleteUser(this.user.id).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to deactivate account.';
        return of(null);
      }),
      finalize(() => {
        this.isDeactivating = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res) => {
      if (res === null) return;
      this.showDeactivateConfirm = false;
      this.showDeactivateSuccess = true;
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      setTimeout(() => {
        this.showDeactivateSuccess = false;
        this.router.navigate(['/login']);
      }, 1200);
    });
  }

  protected updatePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.showPasswordError = false;
    this.passwordErrorMessage = '';
    this.passwordMismatch = false;
    if (this.forgotForm.invalid) {
      if (this.forgotForm.get('newPassword')?.invalid) {
        this.passwordErrorMessage = 'Password does not meet the requirements. Please try again.';
        this.showPasswordError = true;
      }
      return;
    }

    const { newPassword, confirmPassword } = this.forgotForm.getRawValue();
    const email = this.user?.email;
    if (!email) {
      this.errorMessage = 'Account email not found.';
      return;
    }
    if (newPassword !== confirmPassword) {
      this.passwordErrorMessage = 'Password confirmation does not match.';
      this.showPasswordError = true;
      this.passwordMismatch = true;
      return;
    }

    this.api.forgotPassword(email, newPassword!).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.showPasswordForm = false;
        this.forgotForm.reset();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to update password.';
      }
    });
  }
}
