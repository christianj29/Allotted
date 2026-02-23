import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Computer } from '../../shared/models';
import { catchError, finalize, forkJoin, of, timeout } from 'rxjs';

@Component({
  selector: 'app-computers-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, NgIf, RouterLink],
  // List and bulk-delete computers.
  template: `
    <app-shell title="Computers">
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
          <tr *ngFor="let c of computers" [routerLink]="!isDeleteMode ? ['/computers', c.id] : null">
            <td *ngIf="isDeleteMode" class="checkbox-cell">
              <input
                type="checkbox"
                [checked]="selectedComputerIds.has(c.id)"
                (click)="$event.stopPropagation()"
                (change)="toggleSelection(c.id, $event)"
                aria-label="Select computer"
              />
            </td>
            <td>{{ c.name }}</td><td>{{ c.model }}</td><td>{{ c.user || '-' }}</td><td>{{ c.compliant ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="status" *ngIf="isLoading">Loading computers...</p>
      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
      <div class="fab-stack">
        <button class="fab danger" type="button" (click)="handleDeleteAction()" aria-label="Delete computers">
          {{ isDeleteMode ? (selectedComputerIds.size ? '✓' : '×') : '🗑' }}
        </button>
        <a class="fab" routerLink="/computers/new" aria-label="Add computer">+</a>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteConfirm">
        <div class="modal">
          <p>Are you sure you want to delete {{ selectedComputerIds.size }} computers?</p>
          <div class="modal-actions">
            <button type="button" class="danger" (click)="confirmDelete()" [disabled]="isDeleting">Confirm</button>
            <button type="button" class="ghost" (click)="cancelDelete()" [disabled]="isDeleting">Back</button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop" *ngIf="showDeleteSuccess">
        <div class="modal">
          <p>Computers deleted successfully.</p>
        </div>
      </div>
    </app-shell>
  `,
  styleUrls: ['./computers-page.component.css']
})
export class ComputersPageComponent implements OnInit {
  // Table data and UI state.
  protected computers: Computer[] = [];
  protected isLoading = true;
  protected errorMessage = '';
  protected isDeleteMode = false;
  protected isDeleting = false;
  protected showDeleteConfirm = false;
  protected showDeleteSuccess = false;
  protected selectedComputerIds = new Set<number>();

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Load computers on entry and surface errors.
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getComputers().pipe(
      timeout(3000),
      catchError(() => {
        this.errorMessage = 'Could not load computers.';
        return of([]);
      }),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((rows) => {
      this.computers = Array.isArray(rows) ? rows : [];
    });
  }

  protected toggleSelection(computerId: number, event: Event): void {
    // Maintain the set of selected computers for deletion.
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedComputerIds.add(computerId);
    } else {
      this.selectedComputerIds.delete(computerId);
    }
  }

  protected handleDeleteAction(): void {
    // Toggle delete mode or open confirmation.
    if (this.isDeleting) return;
    if (!this.isDeleteMode) {
      this.isDeleteMode = true;
      this.selectedComputerIds.clear();
      return;
    }

    if (this.selectedComputerIds.size === 0) {
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
    const deletions = Array.from(this.selectedComputerIds).map((id) => this.api.deleteComputer(id).pipe(
      catchError(() => of(null))
    ));

    forkJoin(deletions).pipe(
      finalize(() => {
        this.isDeleting = false;
        this.isDeleteMode = false;
        this.showDeleteConfirm = false;
        this.selectedComputerIds.clear();
        this.cdr.detectChanges();
      })
    ).subscribe(() => {
      this.computers = this.computers.filter((c) => !this.selectedComputerIds.has(c.id));
      this.showDeleteSuccess = true;
      setTimeout(() => {
        this.showDeleteSuccess = false;
        this.cdr.detectChanges();
      }, 1200);
    });
  }
}
