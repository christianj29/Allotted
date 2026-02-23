import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../shared/api.service';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  // Inline template keeps this simple flow in one file.
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
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {
  // Primary login form fields and validators.
  protected readonly form = this.fb.group({
    email: ['cbasuel@email.com', [Validators.required, Validators.email]],
    password: ['password123', Validators.required]
  });
  // Forgot-password form fields and validators.
  protected readonly forgotForm = this.fb.group({
    email: ['cbasuel@email.com', [Validators.required, Validators.email]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });
  // UI state toggles and messaging.
  protected showForgotPassword = false;
  protected showLoginForm = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected isAuth0Loading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  submit(): void {
    // Validate and submit login credentials.
    this.errorMessage = '';
    this.successMessage = '';
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    this.api.login(email!, password!).subscribe({
      next: (response) => {
        localStorage.setItem('authUser', JSON.stringify(response.user));
        localStorage.setItem('authToken', response.token);
        this.isAuth0Loading = true;
        this.auth.loginWithRedirect().catch(() => {
          this.isAuth0Loading = false;
          this.errorMessage = 'Auth0 login failed. Continuing with local session.';
          this.router.navigate(['/dashboard']);
        });
      },
      error: () => {
        this.errorMessage = 'Login failed. Check your email and password.';
      }
    });
  }

  updatePassword(): void {
    // Validate and submit password reset.
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
    // Return to login UI and clear messages.
    this.showForgotPassword = false;
    this.errorMessage = '';
    this.successMessage = '';
  }
}
