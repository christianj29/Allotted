import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, NgFor, ReactiveFormsModule, FormsModule],
  // Account profile view with edit, password reset, and deactivation.
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
  styleUrls: ['./account-page.component.css']
})
export class AccountPageComponent implements OnInit {
  // Account data and UI state.
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
    // Load the logged-in user's account details.
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
    // Enter edit mode with current values.
    this.syncFormFromUser();
    this.isEditing = true;
  }

  protected cancelEdit(): void {
    // Exit edit mode and restore values.
    this.isEditing = false;
    this.syncFormFromUser();
  }

  protected saveEdit(): void {
    // Persist edits to the API.
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
    // Populate the edit form from the loaded user.
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
    // Update available roles when department changes.
    this.availableRoles = this.rolesByDepartment[department] ?? [];
    if (!this.availableRoles.includes(this.form.role)) {
      this.form.role = '';
    }
  }

  protected promptDeactivate(): void {
    // Show account deactivation confirmation.
    this.showDeactivateConfirm = true;
  }

  protected cancelDeactivate(): void {
    // Hide deactivation confirmation.
    this.showDeactivateConfirm = false;
  }

  protected confirmDeactivate(): void {
    // Delete the user account and return to login.
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
    // Validate and submit a password update request.
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
