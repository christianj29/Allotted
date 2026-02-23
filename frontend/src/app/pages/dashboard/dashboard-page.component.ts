import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { DashboardSummary } from '../../shared/models';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [NgIf, RouterLink, AppShellComponent],
  // Dashboard summary and compliance visualizations.
  template: `
    <app-shell title="My Dashboard" [showHeaderLogo]="false">
      <div class="welcome-block" *ngIf="welcomeName" page-top>
        <p class="welcome">{{ greeting }} {{ welcomeName }} 👋</p>
        <img class="page-top-logo" src="assets/Allotted.png" alt="Allotted logo" />
      </div>
      <section class="metric-grid">
        <a class="metric-card" [routerLink]="['/computers']" aria-label="View computers">
          <p class="label">Computers</p>
          <p class="value">{{ summary?.counts?.computers ?? 0 }}</p>
        </a>
        <a class="metric-card" [routerLink]="['/devices']" aria-label="View devices">
          <p class="label">Devices</p>
          <p class="value">{{ summary?.counts?.devices ?? 0 }}</p>
        </a>
        <a class="metric-card" [routerLink]="['/users']" aria-label="View users">
          <p class="label">Users</p>
          <p class="value">{{ summary?.counts?.users ?? 0 }}</p>
        </a>
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
  styleUrls: ['./dashboard-page.component.css']
})
export class DashboardPageComponent implements OnInit {
  // Greeting and summary data for the dashboard cards.
  protected greeting = 'Good Morning';
  protected welcomeName = '';
  protected summary: DashboardSummary | null = null;
  protected isLoading = true;
  protected errorMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Fetch summary with a fallback to direct table counts.
    this.greeting = this.getGreeting();
    this.welcomeName = this.getWelcomeName();
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
    // Compute counts and compliance if summary endpoint is unavailable.
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
    // Convert compliant/noncompliant counts into a pie-slice angle.
    if (!this.summary) return 180;
    const compliant = this.summary.compliance.computers.compliant;
    const nonCompliant = this.summary.compliance.computers.nonCompliant;
    const total = compliant + nonCompliant || 1;
    return (compliant / total) * 360;
  }

  protected deviceCompliancePercent(): number {
    // Convert compliant/noncompliant counts into a pie-slice angle.
    if (!this.summary) return 180;
    const compliant = this.summary.compliance.devices.compliant;
    const nonCompliant = this.summary.compliance.devices.nonCompliant;
    const total = compliant + nonCompliant || 1;
    return (compliant / total) * 360;
  }

  private getWelcomeName(): string {
    // Use the logged-in user to personalize the greeting.
    const rawUser = localStorage.getItem('authUser');
    if (!rawUser) return '';
    try {
      const user = JSON.parse(rawUser) as { fullName?: string; username?: string; email?: string };
      const source = user.fullName || user.username || user.email || '';
      return this.toFirstName(source);
    } catch {
      return '';
    }
  }

  private getGreeting(): string {
    // Basic time-of-day greeting.
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : 'Good Afternoon';
  }

  private toFirstName(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const beforeAt = trimmed.split('@')[0];
    const normalized = beforeAt.replace(/[_\-.]+/g, ' ').trim();
    const first = normalized.split(/\s+/)[0];
    if (!first) return '';
    return first.charAt(0).toUpperCase() + first.slice(1);
  }
}
