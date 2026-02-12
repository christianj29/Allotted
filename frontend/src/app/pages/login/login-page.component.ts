import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  template: `
    <div class="login-bg">
      <div class="card">
        <div class="logo-wrap">
          <img src="assets/Allotted_Login.png" alt="Allotted logo" />
        </div>
        <h1 *ngIf="showForgotPassword">Forgot Password</h1>
        <div *ngIf="!showForgotPassword && !showLoginForm" class="cta-stack">
          <button type="button" class="primary" (click)="showLoginForm = true">Login</button>
          <a class="secondary" routerLink="/create-account">Create Account</a>
        </div>

        <form *ngIf="!showForgotPassword && showLoginForm" [formGroup]="form" (ngSubmit)="submit()">
          <input type="email" formControlName="email" placeholder="email" />
          <input type="password" formControlName="password" placeholder="password" />
          <button type="submit">Continue</button>
        </form>

        <button *ngIf="!showForgotPassword && showLoginForm" type="button" class="link" (click)="showForgotPassword = true">
          Forgot password?
        </button>

        <form *ngIf="showForgotPassword" [formGroup]="forgotForm" (ngSubmit)="updatePassword()">
          <input type="email" formControlName="email" placeholder="account email" />
          <input type="password" formControlName="newPassword" placeholder="new password" />
          <input type="password" formControlName="confirmPassword" placeholder="confirm new password" />
          <button type="submit">Update Password</button>
        </form>

        <button *ngIf="showForgotPassword" type="button" class="link" (click)="cancelForgotPassword()">
          Back to login
        </button>

        <p class="message success" *ngIf="successMessage">{{ successMessage }}</p>
        <p class="message error" *ngIf="errorMessage">{{ errorMessage }}</p>
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
        width: min(420px, 92vw);
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
      form { display: grid; gap: 10px; }
      input, button {
        height: 42px;
        border-radius: 10px;
        border: 1px solid #c9d6ef;
        padding: 0 12px;
      }
      .cta-stack {
        display: grid;
        gap: 10px;
        margin-bottom: 12px;
      }
      .primary {
        border: 0;
        background: #1a4ec9;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
      }
      button {
        border: 0;
        background: #1a4ec9;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
      }
      .link {
        margin-top: 10px;
        padding: 0;
        border: 0;
        background: transparent;
        color: #1a4ec9;
        font-weight: 600;
        cursor: pointer;
        text-align: left;
      }
      .secondary {
        display: inline-block;
        margin: 0;
        padding: 8px 14px;
        border-radius: 999px;
        border: 1px solid #c9d6ef;
        color: #1a4ec9;
        font-weight: 700;
        text-decoration: none;
        text-align: center;
      }
      .message {
        margin-top: 12px;
        font-size: 13px;
      }
      .message.success { color: #1e7b3a; }
      .message.error { color: #a12424; }
    `
  ]
})
export class LoginPageComponent {
  protected readonly form = this.fb.group({
    email: ['cbasuel@email.com', [Validators.required, Validators.email]],
    password: ['password123', Validators.required]
  });
  protected readonly forgotForm = this.fb.group({
    email: ['cbasuel@email.com', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });
  protected showForgotPassword = false;
  protected showLoginForm = false;
  protected errorMessage = '';
  protected successMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.api.login(email!, password!).subscribe({
      next: (response) => {
        localStorage.setItem('authUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Login failed. Check your email and password.';
      }
    });
  }

  updatePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';
    if (this.forgotForm.invalid) return;

    const { email, newPassword, confirmPassword } = this.forgotForm.getRawValue();
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Password confirmation does not match.';
      return;
    }

    this.api.forgotPassword(email!, newPassword!).subscribe({
      next: (response) => {
        this.successMessage = response.message;
        this.showForgotPassword = false;
        this.form.patchValue({ email: email!, password: '' });
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to update password.';
      }
    });
  }

  cancelForgotPassword(): void {
    this.showForgotPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
