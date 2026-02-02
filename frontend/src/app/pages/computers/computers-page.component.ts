import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Computer } from '../../shared/models';
import { catchError, finalize, of, timeout } from 'rxjs';

@Component({
  selector: 'app-computers-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="Computers">
      <table>
        <thead>
          <tr><th>Name</th><th>Model</th><th>User</th><th>Compliant</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of computers" [routerLink]="['/computers', c.id]">
            <td>{{ c.name }}</td><td>{{ c.model }}</td><td>{{ c.user || '-' }}</td><td>{{ c.compliant ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
      <p class="status" *ngIf="isLoading">Loading computers...</p>
      <p class="status error" *ngIf="errorMessage">{{ errorMessage }}</p>
    </app-shell>
  `,
  styles: [`
    table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; }
    th, td { text-align: left; padding: 14px; border-bottom: 1px solid #dbe5f6; }
    tr{cursor:pointer;}
    tr:hover{background:#f2f7ff;}
    .status { margin-top: 10px; color: #3d4d6d; }
    .status.error { color: #a12424; }
  `]
})
export class ComputersPageComponent implements OnInit {
  protected computers: Computer[] = [];
  protected isLoading = true;
  protected errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
}
