import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, NgFor, RouterLink, FormsModule],
  // User detail view with edit and delete actions.
  template: `
    <app-shell title="User Info">
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
        <div class="actions">
          <button *ngIf="!isEditing" type="button" (click)="startEdit()">Edit</button>
          <button *ngIf="isEditing" type="button" (click)="saveEdit()" [disabled]="isSaving">Save</button>
          <button *ngIf="isEditing" type="button" class="ghost" (click)="cancelEdit()" [disabled]="isSaving">
            Cancel
          </button>
          <button *ngIf="!isEditing" type="button" class="danger" (click)="promptDelete()">Delete</button>
          <a class="back" routerLink="/users">Back</a>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm">
        <div class="modal">
          <p>Are you sure you want to delete this user?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDelete()" [disabled]="isDeleting">Confirm</button>
            <button type="button" class="ghost" (click)="cancelDelete()" [disabled]="isDeleting">Back</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteSuccess">
        <div class="modal">
          <p>User Deleted Successfully.</p>
        </div>
      </div>
      <p class="status" *ngIf="isLoading">Loading user info...</p>
      <p class="status error" *ngIf="!isLoading && errorMessage">{{ errorMessage }}</p>
    </app-shell>
  `,
  styleUrls: ['./user-detail-page.component.css']
})
export class UserDetailPageComponent implements OnInit {
  // User data and UI state.
  protected user?: any;
  protected primaryDevice?: { name: string; model: string; serialNumber: string };
  protected isLoading = true;
  protected errorMessage = '';
  protected isEditing = false;
  protected isSaving = false;
  protected isDeleting = false;
  protected showDeleteConfirm = false;
  protected showDeleteSuccess = false;
  protected form = {
    fullName: '',
    username: '',
    email: '',
    role: '',
    department: ''
  };
  protected availableRoles: string[] = [];
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
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    // Load the user and related device/computer data.
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getUser(id).pipe(
      catchError(() => {
        this.errorMessage = 'Could not load user info. Is the backend running?';
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

  protected promptDelete(): void {
    // Show delete confirmation modal.
    this.showDeleteConfirm = true;
  }

  protected cancelDelete(): void {
    // Hide delete confirmation modal.
    this.showDeleteConfirm = false;
  }

  protected confirmDelete(): void {
    // Delete the user and return to the list.
    if (!this.user || this.isDeleting) return;
    this.isDeleting = true;
    this.api.deleteUser(this.user.id).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete user.';
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
        this.router.navigate(['/users']);
      }, 1200);
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
}
