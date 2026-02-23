import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Computer, CreateComputerRequest, UserRow } from '../../shared/models';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-computer-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, NgFor, FormsModule],
  // Computer detail view with edit/delete and patch actions.
  template: `
    <app-shell title="Computer Info">
      <div *ngIf="computer" class="card">
        <div class="info-row">
          <span class="label">Name</span>
          <span class="value" *ngIf="!isEditing">{{ computer.name }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.name" />
        </div>
        <div class="info-row">
          <span class="label">Model</span>
          <span class="value" *ngIf="!isEditing">{{ computer.model }}</span>
          <select
            class="value-input"
            *ngIf="isEditing"
            [(ngModel)]="form.model"
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
        </div>
        <div class="info-row">
          <span class="label">User</span>
          <span class="value" *ngIf="!isEditing">{{ computer.user || '-' }}</span>
          <select class="value-input" *ngIf="isEditing" [(ngModel)]="form.userId">
            <option [ngValue]="null">Unassigned</option>
            <option *ngFor="let user of users" [ngValue]="user.id">{{ user.fullName }} ({{ user.username }})</option>
          </select>
        </div>
        <div class="info-row">
          <span class="label">Serial Number</span>
          <span class="value" *ngIf="!isEditing">{{ computer.serialNumber }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.serialNumber" />
        </div>
        <div class="info-row">
          <span class="label">Model Identifier</span>
          <span class="value" *ngIf="!isEditing">{{ computer.modelIdentifier || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.modelIdentifier" />
        </div>
        <div class="info-row">
          <span class="label">Processor</span>
          <span class="value" *ngIf="!isEditing">{{ computer.processorType || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.processorType" />
        </div>
        <div class="info-row">
          <span class="label">Architecture</span>
          <span class="value" *ngIf="!isEditing">{{ computer.architectureType || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.architectureType" />
        </div>
        <div class="info-row">
          <span class="label">Cache Size</span>
          <span class="value" *ngIf="!isEditing">{{ computer.cacheSize || '-' }}</span>
          <input class="value-input" *ngIf="isEditing" [(ngModel)]="form.cacheSize" />
        </div>
        <div class="actions">
          <button *ngIf="!isEditing" type="button" (click)="startEdit()">Edit</button>
          <button *ngIf="isEditing" type="button" (click)="saveEdit()" [disabled]="isSaving">Save</button>
          <button *ngIf="isEditing" type="button" class="ghost" (click)="cancelEdit()" [disabled]="isSaving">
            Cancel
          </button>
          <button *ngIf="!isEditing" type="button" class="danger" (click)="promptDelete()">Delete</button>
        </div>
        <div class="patch-block" *ngIf="!isEditing">
          <button type="button" class="patch" (click)="startPatch()" [disabled]="isPatching || !computer.serialNumber">
            Patch this computer
          </button>
          <div *ngIf="isPatching" class="patch-status">
            <p>Your Computer is currently updating</p>
            <div class="progress">
              <div class="bar" [style.width.%]="patchProgress"></div>
            </div>
          </div>
          <p class="status success" *ngIf="patchSuccess">Computer is now compliant.</p>
        </div>
      </div>
      <p class="status" *ngIf="isLoading">Loading computer...</p>
      <p class="status error" *ngIf="!isLoading && errorMessage">{{ errorMessage }}</p>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm">
        <div class="modal">
          <p>Are you sure you want to delete this computer?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDelete()" [disabled]="isDeleting">Confirm</button>
            <button type="button" class="ghost" (click)="cancelDelete()" [disabled]="isDeleting">Back</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteSuccess">
        <div class="modal">
          <p>Computer deleted successfully.</p>
        </div>
      </div>
    </app-shell>
  `,
  styleUrls: ['./computer-detail-page.component.css']
})
export class ComputerDetailPageComponent implements OnInit {
  // Computer data, patch state, and UI flags.
  protected computer?: Computer;
  protected users: UserRow[] = [];
  protected isLoading = true;
  protected errorMessage = '';
  protected isEditing = false;
  protected isSaving = false;
  protected isDeleting = false;
  protected showDeleteConfirm = false;
  protected showDeleteSuccess = false;
  protected isPatching = false;
  protected patchProgress = 0;
  protected patchSuccess = false;
  protected form: CreateComputerRequest = {
    name: '',
    model: '',
    serialNumber: '',
    modelIdentifier: '',
    processorType: '',
    architectureType: '',
    cacheSize: '',
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
    // Load the computer and lookup users for assignment.
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getUsers().pipe(catchError(() => of([]))).subscribe((rows) => {
      this.users = Array.isArray(rows) ? rows : [];
      this.cdr.detectChanges();
    });
    this.api.getComputer(id).pipe(
      catchError(() => {
        this.errorMessage = 'Could not load computer info.';
        return of(null);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((value) => {
      if (!value) return;
      this.computer = value;
      this.syncFormFromComputer();
    });
  }

  protected startPatch(): void {
    // Send a patch command to the agent and begin progress UI.
    if (!this.computer || this.isPatching) return;
    const agentId = this.computer.agentId || this.computer.serialNumber;
    if (!agentId) {
      this.errorMessage = 'Missing serial number for agent routing.';
      return;
    }

    this.isPatching = true;
    this.patchProgress = 5;
    this.patchSuccess = false;
    this.api.createAgentCommand(agentId, {
      type: 'patch',
      payload: {
        computerId: this.computer.id,
        message: 'An admin is patching this computer.\nPlease save your work.'
      }
    }).pipe(
      catchError(() => {
        this.errorMessage = 'Failed to send patch command.';
        return of(null);
      })
    ).subscribe(() => {
      this.animatePatchProgress();
      this.pollCompliance();
    });
  }

  private animatePatchProgress(): void {
    // Simulate incremental progress until the compliance check completes.
    const interval = setInterval(() => {
      if (!this.isPatching) {
        clearInterval(interval);
        return;
      }
      this.patchProgress = Math.min(this.patchProgress + 8, 95);
      this.cdr.detectChanges();
    }, 600);
  }

  private pollCompliance(): void {
    // Poll the computer endpoint until compliance flips or attempts expire.
    if (!this.computer) return;
    const id = this.computer.id;
    let attempts = 0;
    const interval = setInterval(() => {
      attempts += 1;
      this.api.getComputer(id).subscribe((value) => {
        if (!value) return;
        this.computer = value;
        if (value.compliant) {
          this.isPatching = false;
          this.patchProgress = 100;
          this.patchSuccess = true;
          this.cdr.detectChanges();
          clearInterval(interval);
        }
      });
      if (attempts >= 20) {
        clearInterval(interval);
      }
    }, 2000);
  }

  protected startEdit(): void {
    // Enter edit mode with current values.
    this.syncFormFromComputer();
    this.isEditing = true;
  }

  protected cancelEdit(): void {
    // Exit edit mode and restore values.
    this.isEditing = false;
    this.syncFormFromComputer();
  }

  protected saveEdit(): void {
    // Persist edits to the API.
    if (!this.computer) return;
    this.isSaving = true;
    this.api.updateComputer(this.computer.id, {
      ...this.form,
      name: this.form.name.trim(),
      model: this.form.model.trim(),
      serialNumber: this.form.serialNumber.trim()
    }).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to update computer.';
        return of(null);
      }),
      finalize(() => {
        this.isSaving = false;
        this.cdr.detectChanges();
      })
    ).subscribe((updated) => {
      if (!updated) return;
      this.computer = updated;
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
    // Delete the computer and return to the list.
    if (!this.computer || this.isDeleting) return;
    this.isDeleting = true;
    this.api.deleteComputer(this.computer.id).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete computer.';
        return of(null);
      }),
      finalize(() => {
        this.isDeleting = false;
        this.cdr.detectChanges();
      })
    ).subscribe(() => {
      this.showDeleteConfirm = false;
      this.showDeleteSuccess = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.showDeleteSuccess = false;
        this.router.navigate(['/computers']);
      }, 1500);
    });
  }

  private syncFormFromComputer(): void {
    // Populate the edit form from the loaded computer.
    if (!this.computer) return;
    this.form = {
      name: this.computer.name || '',
      model: this.computer.model || '',
      serialNumber: this.computer.serialNumber || '',
      modelIdentifier: this.computer.modelIdentifier || '',
      processorType: this.computer.processorType || '',
      architectureType: this.computer.architectureType || '',
      cacheSize: this.computer.cacheSize || '',
      compliant: this.computer.compliant ?? true,
      userId: null
    };
    const matchedUser = this.users.find((u) => u.username === this.computer?.user);
    this.form.userId = matchedUser?.id ?? null;
  }

  protected onModelChange(model: string): void {
    // Autofill detail fields based on the selected model.
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
