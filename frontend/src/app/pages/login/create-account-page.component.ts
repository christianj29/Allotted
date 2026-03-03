import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-create-account-page',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  // Inline template for the two-step account creation flow.
  template: `
    <div class="login-bg">
      <div class="card">
        <div class="logo-wrap">
          <img src="assets/Allotted_Login.png" alt="Allotted logo" />
        </div>
        <h1>Create Account</h1>
        <form class="form" (ngSubmit)="submit()" autocomplete="off">
          <label class="email-label">
            Email
            <span class="note">Please enter your email address</span>
            <input
              name="email"
              type="email"
              [(ngModel)]="email"
              required
              autocomplete="off"
            />
          </label>
          <div class="actions">
            <button type="button" class="primary" [disabled]="isChecking" (click)="checkEligibility()">
              <span *ngIf="isChecking" class="spinner" aria-hidden="true"></span>
              <span>{{ isChecking ? 'Checking...' : 'Continue' }}</span>
            </button>
            <span class="message error" *ngIf="errorMessage && !isEligible">{{ errorMessage }}</span>
          </div>
          <p class="note" *ngIf="eligibilityMessage">{{ eligibilityMessage }}</p>
          <ng-container *ngIf="isEligible">
            <label>
              Password
              <span class="requirements">
                Requirements: Minimum 8 characters, 1 capital letter, 1 number, 1 special character
              </span>
              <input
                name="password"
                type="password"
                [(ngModel)]="password"
                required
                autocomplete="new-password"
              />
            </label>
            <label>
              Re-enter password
              <input
                name="confirmPassword"
                type="password"
                [(ngModel)]="confirmPassword"
                required
                autocomplete="new-password"
              />
            </label>
          </ng-container>
          <button *ngIf="isEligible && !isChecking" type="submit" class="primary" [disabled]="isSaving">
            Create account
          </button>
        </form>
        <p class="message success" *ngIf="successMessage">{{ successMessage }}</p>
        <p class="message error" *ngIf="errorMessage">{{ errorMessage }}</p>
        <a class="link" routerLink="/login">Back to login</a>
      </div>
    </div>
  `,
  styleUrls: ['./create-account-page.component.css']
})
export class CreateAccountPageComponent {
  // Local UI state for the account creation flow.
  protected isSaving = false;
  protected isChecking = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected isEligible = false;
  protected eligibilityMessage = '';
  // Cache the last eligibility lookup to avoid repeat API calls while typing or retrying.
  private lastEligibilityEmail = '';
  private lastEligibilityCheckedAt = 0;
  private lastEligibilityResult: { eligible: boolean; department?: string } | null = null;
  private lastEligibilityError = '';
  private readonly eligibilityCacheTtlMs = 30000;

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  protected checkEligibility(): void {
    // Step 1: verify whether the email can create an account (IT-only in this demo).
    this.errorMessage = '';
    this.eligibilityMessage = '';
    this.isEligible = false;
    const normalizedEmail = this.email.trim().toLowerCase();
    if (!normalizedEmail) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    const now = Date.now();
    // Step 2: reuse a recent response to keep the UI snappy.
    if (
      this.lastEligibilityEmail === normalizedEmail &&
      now - this.lastEligibilityCheckedAt < this.eligibilityCacheTtlMs
    ) {
      if (this.lastEligibilityResult?.eligible) {
        this.isEligible = true;
        this.eligibilityMessage = 'Eligible to create an account.';
        this.errorMessage = '';
      } else if (this.lastEligibilityError) {
        this.isEligible = false;
        this.errorMessage = this.lastEligibilityError;
      }
      return;
    }
    // Step 3: call the backend to validate eligibility.
    this.isChecking = true;
    this.api.checkAccountEligibility(normalizedEmail).pipe(
      finalize(() => (this.isChecking = false))
    ).subscribe({
      next: (res) => {
        this.isEligible = !!res?.eligible;
        this.lastEligibilityEmail = normalizedEmail;
        this.lastEligibilityCheckedAt = Date.now();
        this.lastEligibilityResult = res;
        this.lastEligibilityError = '';
        if (this.isEligible) {
          this.eligibilityMessage = 'Eligible to create an account.';
          this.errorMessage = '';
        }
      },
      error: (err) => {
        this.isEligible = false;
        this.lastEligibilityEmail = normalizedEmail;
        this.lastEligibilityCheckedAt = Date.now();
        this.lastEligibilityResult = { eligible: false };
        this.lastEligibilityError = err?.error?.message || 'Unable to verify eligibility.';
        this.errorMessage = this.lastEligibilityError;
      }
    });
  }

  protected submit(): void {
    // Create the account after eligibility and password checks.
    this.errorMessage = '';
    this.successMessage = '';
    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }
    if (!this.isEligible) {
      this.errorMessage = 'You do not have access to create an account.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }
    this.isSaving = true;
    this.api.createAccount(this.email, this.password).pipe(
      catchError((err) => {
        this.errorMessage = err?.error?.message || 'Unable to create account.';
        return of(null);
      }),
      finalize(() => (this.isSaving = false))
    ).subscribe((res) => {
      if (!res?.message) return;
      this.successMessage = res.message;
      setTimeout(() => this.router.navigate(['/login']), 800);
    });
  }
}
