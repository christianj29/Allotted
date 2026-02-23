import { ChangeDetectorRef, Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { CreateUserRequest } from '../../shared/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [AppShellComponent, FormsModule, NgFor, NgIf, RouterLink],
  // Create-user form with department-driven role selection.
  template: `
    <app-shell title="Add User">
      <section class="panel">
        <div class="panel-header">
          <h2></h2>
          <a class="back" routerLink="/users">← Back to users</a>
        </div>
        <form class="form-grid" (ngSubmit)="createUser()" autocomplete="off">
          <label>
            First name
            <input
              name="firstName"
              [(ngModel)]="form.firstName"
              [class.invalid]="fieldErrors.firstName"
              required
              autocomplete="off"
            />
            <span class="field-error" *ngIf="fieldErrors.firstName">{{ fieldErrors.firstName }}</span>
          </label>
          <label>
            Last name
            <input
              name="lastName"
              [(ngModel)]="form.lastName"
              [class.invalid]="fieldErrors.lastName"
              required
              autocomplete="off"
            />
            <span class="field-error" *ngIf="fieldErrors.lastName">{{ fieldErrors.lastName }}</span>
          </label>
          <label class="full">
            Email
            <input
              name="email"
              type="email"
              [(ngModel)]="form.email"
              [class.invalid]="fieldErrors.email"
              required
              autocomplete="off"
            />
            <span class="field-error" *ngIf="fieldErrors.email">{{ fieldErrors.email }}</span>
          </label>
          <label class="full">
            Department
            <select
              name="department"
              [(ngModel)]="form.department"
              [class.invalid]="fieldErrors.department"
              required
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
            <span class="field-error" *ngIf="fieldErrors.department">{{ fieldErrors.department }}</span>
          </label>
          <label class="full">
            Role
            <select
              name="role"
              [(ngModel)]="form.role"
              [class.invalid]="fieldErrors.role"
              required
              [disabled]="!availableRoles.length"
            >
              <option value="" disabled>
                {{ availableRoles.length ? 'Select a role' : 'Select department first' }}
              </option>
              <option *ngFor="let role of availableRoles" [value]="role">{{ role }}</option>
            </select>
            <span class="field-error" *ngIf="fieldErrors.role">{{ fieldErrors.role }}</span>
          </label>
          <div class="full actions">
            <button type="submit" [disabled]="isSaving">Create user</button>
            <span class="status error" *ngIf="formError">{{ formError }}</span>
            <span class="status success" *ngIf="formSuccess">{{ formSuccess }}</span>
          </div>
        </form>
      </section>
    </app-shell>
  `,
  styleUrls: ['./user-create-page.component.css']
})
export class UserCreatePageComponent {
  // Form data and submission state.
  protected isSaving = false;
  protected formError = '';
  protected formSuccess = '';
  protected fieldErrors: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    department?: string;
  } = {};
  protected availableRoles: string[] = [];
  protected form: CreateUserRequest = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    department: '',
  };
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

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  protected createUser(): void {
    // Validate and submit the user creation payload.
    this.formError = '';
    this.formSuccess = '';
    this.fieldErrors = {};
    const payload = this.cleanPayload();
    if (!payload) return;

    this.isSaving = true;
    this.api.createUser(payload).pipe(
      catchError((err) => {
        const message = err?.error?.message || 'Failed to create user.';
        this.formError = message;
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res) => {
      if (!res?.user) return;
      this.formSuccess = 'User added. Redirecting...';
      this.fieldErrors = {};
      setTimeout(() => this.router.navigate(['/users']), 500);
    });
  }

  private cleanPayload(): CreateUserRequest | null {
    // Normalize inputs and collect field-level errors.
    const firstName = this.form.firstName.trim();
    const lastName = this.form.lastName.trim();
    const email = this.form.email.trim();
    const role = this.form.role.trim();
    const department = this.form.department.trim();

    if (!firstName) this.fieldErrors.firstName = 'First name is required.';
    if (!lastName) this.fieldErrors.lastName = 'Last name is required.';
    if (!email) this.fieldErrors.email = 'Email is required.';
    if (!role) this.fieldErrors.role = 'Role is required.';
    if (!department) this.fieldErrors.department = 'Department is required.';

    if (Object.keys(this.fieldErrors).length > 0) {
      this.formError = 'Please fix the highlighted fields.';
      return null;
    }

    return { firstName, lastName, email, role, department };
  }

  protected onDepartmentChange(department: string): void {
    // Refresh role options based on department.
    this.availableRoles = this.rolesByDepartment[department] ?? [];
    this.form.role = '';
    if (this.fieldErrors.role) {
      this.fieldErrors.role = '';
    }
  }

}
