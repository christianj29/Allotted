import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/auth.service';

@Component({
  selector: 'app-auth-callback-page',
  standalone: true,
  template: `
    <div class="login-bg">
      <div class="card">
        <h1>Signing you in...</h1>
        <p class="message">Completing Auth0 login.</p>
      </div>
    </div>
  `,
  styleUrls: ['./login-page.component.css']
})
// Handles the Auth0 redirect callback and sends the user to the dashboard.
export class AuthCallbackPageComponent implements OnInit {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.handleRedirectCallback();
      this.router.navigate(['/dashboard']);
    } catch {
      this.router.navigate(['/login']);
    }
  }
}
