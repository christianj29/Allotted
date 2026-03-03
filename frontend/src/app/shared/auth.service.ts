import { Injectable } from '@angular/core';
import { Auth0Client, User, createAuth0Client } from '@auth0/auth0-spa-js';

// Thin wrapper around Auth0 SPA SDK for login + callback handling.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private client?: Auth0Client;
  private initPromise: Promise<Auth0Client>;

  private readonly domain = 'dev-v0ndweh1e1h01cue.us.auth0.com';
  private readonly clientId = 'dUx4n9ZIApkFVYPEL4XKboryJg8V92E3';
  private readonly redirectUri = `${window.location.origin}/auth/callback`;

  constructor() {
    this.initPromise = this.initClient();
  }

  // Lazily initialize the Auth0 client singleton.
  private async initClient(): Promise<Auth0Client> {
    if (this.client) return this.client;
    const client = await createAuth0Client({
      domain: this.domain,
      clientId: this.clientId,
      authorizationParams: {
        redirect_uri: this.redirectUri
      }
    });
    this.client = client;
    return client;
  }

  // Start the Auth0 login redirect flow.
  async loginWithRedirect(): Promise<void> {
    const client = await this.initPromise;
    await client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: this.redirectUri
      }
    });
  }

  // Handle Auth0 redirect callback and persist the session.
  async handleRedirectCallback(): Promise<void> {
    const client = await this.initPromise;
    if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) {
      return;
    }
    await client.handleRedirectCallback();
    await this.persistSession();
  }

  // Return whether the current session is authenticated.
  async isAuthenticated(): Promise<boolean> {
    const client = await this.initPromise;
    return client.isAuthenticated();
  }

  // Fetch the Auth0 user profile for the current session.
  async getUser(): Promise<User | undefined> {
    const client = await this.initPromise;
    return client.getUser();
  }

  // Retrieve a silent access token from Auth0.
  async getToken(): Promise<string> {
    const client = await this.initPromise;
    return client.getTokenSilently();
  }

  // Persist Auth0 session details to local storage.
  async persistSession(): Promise<void> {
    const [user, token] = await Promise.all([this.getUser(), this.getToken()]);
    if (user) {
      localStorage.setItem('auth0User', JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem('auth0Token', token);
    }
  }
}
