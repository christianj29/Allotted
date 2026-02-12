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
  styles: [
    `
      .login-bg {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: conic-gradient(from 160deg at 20% 10%, #e8f0ff, #f6f8fd, #e8f0ff);
        font-family: 'Avenir Next', 'Trebuchet MS', sans-serif;
      }
      .card {
        width: min(520px, 92vw);
        background: #fff;
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 10px 30px rgba(16, 41, 97, 0.18);
      }
      .logo-wrap {
        background: #0a3c96;
        border-radius: 12px;
        padding: 10px;
        margin-bottom: 14px;
      }
      .logo-wrap img {
        width: 100%;
        height: auto;
        display: block;
      }
      h1 { margin: 0 0 16px; color: #112855; text-align: center; }
      .form { display: grid; gap: 12px; }
      label { display: grid; gap: 6px; font-size: 12px; color: #42506b; font-weight: 600; }
      .email-label {
        font-size: 13px;
        font-weight: 700;
      }
      input, button {
        height: 42px;
        border-radius: 10px;
        border: 1px solid #c9d6ef;
        padding: 0 12px;
        font-size: 14px;
      }
      .note {
        margin: 0;
        font-size: 12px;
        color: #51628a;
      }
      .actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.5);
        border-top-color: #fff;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .requirements {
        font-size: 12px;
        font-weight: 400;
        color: #5b6a8a;
      }
      .primary {
        border: 0;
        background: #1a4ec9;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
      }
      .primary:disabled { opacity: 0.7; cursor: not-allowed; }
      .link {
        margin-top: 10px;
        display: inline-block;
        color: #1a4ec9;
        font-weight: 600;
        text-decoration: none;
      }
      .message { margin-top: 12px; font-size: 13px; }
      .message.success { color: #1e7b3a; }
      .message.error { color: #a12424; }
    `
  ]
})
export class CreateAccountPageComponent {
  protected isSaving = false;
  protected isChecking = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected isEligible = false;
  protected eligibilityMessage = '';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  protected checkEligibility(): void {
    this.errorMessage = '';
    this.eligibilityMessage = '';
    this.isEligible = false;
    if (!this.email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }
    this.isChecking = true;
    this.api.checkAccountEligibility(this.email).pipe(
      finalize(() => (this.isChecking = false))
    ).subscribe({
      next: (res) => {
        this.isEligible = !!res?.eligible;
        if (this.isEligible) {
          this.eligibilityMessage = 'Eligible to create an account.';
          this.errorMessage = '';
        }
      },
      error: (err) => {
        this.isEligible = false;
        this.errorMessage = err?.error?.message || 'Unable to verify eligibility.';
      }
    });
  }

  protected submit(): void {
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
