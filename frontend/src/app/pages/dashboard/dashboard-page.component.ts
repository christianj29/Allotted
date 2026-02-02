import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { DashboardSummary } from '../../shared/models';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [NgIf, AppShellComponent],
  template: `
    <app-shell title="My Dashboard">
      <section class="metric-grid">
        <article class="metric-card">
          <p class="label">Computers</p>
          <p class="value">{{ summary?.counts?.computers ?? 0 }}</p>
        </article>
        <article class="metric-card">
          <p class="label">Devices</p>
          <p class="value">{{ summary?.counts?.devices ?? 0 }}</p>
        </article>
        <article class="metric-card">
          <p class="label">Users</p>
          <p class="value">{{ summary?.counts?.users ?? 0 }}</p>
        </article>
      </section>

      <section class="chart-grid">
        <article class="chart-card">
          <h3>Laptops</h3>
          <div class="pie" [style.--slice]="computerCompliancePercent() + 'deg'"></div>
          <div class="legend">
            <span><i class="swatch good"></i> Compliant: {{ summary?.compliance?.computers?.compliant ?? 0 }}</span>
            <span><i class="swatch bad"></i> Incompliant: {{ summary?.compliance?.computers?.nonCompliant ?? 0 }}</span>
          </div>
        </article>

        <article class="chart-card">
          <h3>Devices</h3>
          <div class="pie" [style.--slice]="deviceCompliancePercent() + 'deg'"></div>
          <div class="legend">
            <span><i class="swatch good"></i> Compliant: {{ summary?.compliance?.devices?.compliant ?? 0 }}</span>
            <span><i class="swatch bad"></i> Incompliant: {{ summary?.compliance?.devices?.nonCompliant ?? 0 }}</span>
          </div>
        </article>
      </section>

      <p class="status" *ngIf="isLoading">Loading dashboard...</p>
      <p class="status error" *ngIf="!isLoading && errorMessage">{{ errorMessage }}</p>
    </app-shell>
  `,
  styles: [
    `
      .metric-grid {
        margin-top: 18px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .metric-card {
        background: #fff;
        border: 1px solid #d6dbe5;
        border-radius: 12px;
        padding: 12px;
        min-height: 120px;
      }
      .label {
        margin: 0;
        font-size: 13px;
        color: #444e62;
      }
      .value {
        margin: 32px 0 0;
        text-align: center;
        font-size: 40px;
        color: #202d49;
      }
      .chart-grid {
        margin-top: 14px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .chart-card {
        background: #fff;
        border: 1px solid #d6dbe5;
        border-radius: 12px;
        padding: 12px;
      }
      h3 {
        margin: 0 0 12px;
        font-size: 22px;
        color: #1f2b45;
      }
      .pie {
        --slice: 180deg;
        width: 170px;
        height: 170px;
        margin: 8px auto;
        border-radius: 50%;
        border: 2px solid #616a7f;
        background: conic-gradient(#b5bac6 0deg var(--slice), #eceef2 var(--slice) 360deg);
      }
      .legend {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        font-size: 13px;
        color: #475068;
      }
      .swatch {
        width: 11px;
        height: 11px;
        display: inline-block;
        border-radius: 2px;
        margin-right: 4px;
      }
      .swatch.good {
        background: #b5bac6;
      }
      .swatch.bad {
        background: #eceef2;
      }
      .status {
        margin-top: 12px;
        color: #344468;
        font-size: 14px;
      }
      .status.error {
        color: #a12424;
      }
      @media (max-width: 960px) {
        .metric-grid,
        .chart-grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class DashboardPageComponent implements OnInit {
  protected summary: DashboardSummary | null = null;
  protected isLoading = true;
  protected errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.api.getDashboardSummary().pipe(
      timeout(2000),
      catchError(() => of(null))
    ).subscribe((summary) => {
      if (summary) {
        this.summary = summary;
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }
      this.loadFallbackSummary();
    });
  }

  private loadFallbackSummary(): void {
    forkJoin({
      computers: this.api.getComputers().pipe(timeout(2000), catchError(() => of([]))),
      devices: this.api.getDevices().pipe(timeout(2000), catchError(() => of([]))),
      users: this.api.getUsers().pipe(timeout(2000), catchError(() => of([])))
    }).subscribe({
      next: ({ computers, devices, users }) => {
        const compliantComputers = computers.filter((c: any) => c.compliant).length;
        const compliantDevices = devices.filter((d: any) => d.compliant).length;
        this.summary = {
          counts: {
            computers: computers.length,
            devices: devices.length,
            users: users.length
          },
          compliance: {
            computers: {
              compliant: compliantComputers,
              nonCompliant: Math.max(computers.length - compliantComputers, 0)
            },
            devices: {
              compliant: compliantDevices,
              nonCompliant: Math.max(devices.length - compliantDevices, 0)
            }
          }
        };
        this.errorMessage = 'Summary endpoint unavailable. Using direct table counts.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Dashboard failed to load. Please refresh.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  protected computerCompliancePercent(): number {
    if (!this.summary) return 180;
    const compliant = this.summary.compliance.computers.compliant;
    const nonCompliant = this.summary.compliance.computers.nonCompliant;
    const total = compliant + nonCompliant || 1;
    return (compliant / total) * 360;
  }

  protected deviceCompliancePercent(): number {
    if (!this.summary) return 180;
    const compliant = this.summary.compliance.devices.compliant;
    const nonCompliant = this.summary.compliance.devices.nonCompliant;
    const total = compliant + nonCompliant || 1;
    return (compliant / total) * 360;
  }
}
