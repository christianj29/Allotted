import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../shared/api.service';
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
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.handleRedirectCallback();
      const pendingEmail = localStorage.getItem('pendingLoginEmail');
      if (!pendingEmail) {
        throw new Error('Missing pending login email.');
      }
      const response = await firstValueFrom(this.api.auth0Login(pendingEmail));
      localStorage.setItem('sessionUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
      localStorage.removeItem('authUser');
      localStorage.removeItem('auth0User');
      localStorage.removeItem('pendingLoginEmail');
      this.router.navigate(['/dashboard']);
    } catch {
      localStorage.removeItem('pendingLoginEmail');
      this.router.navigate(['/login']);
    }
  }
}
