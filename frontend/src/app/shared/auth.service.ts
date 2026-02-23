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

  async loginWithRedirect(): Promise<void> {
    const client = await this.initPromise;
    await client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: this.redirectUri
      }
    });
  }

  async handleRedirectCallback(): Promise<void> {
    const client = await this.initPromise;
    if (!window.location.search.includes('code=') || !window.location.search.includes('state=')) {
      return;
    }
    await client.handleRedirectCallback();
    await this.persistSession();
  }

  async isAuthenticated(): Promise<boolean> {
    const client = await this.initPromise;
    return client.isAuthenticated();
  }

  async getUser(): Promise<User | undefined> {
    const client = await this.initPromise;
    return client.getUser();
  }

  async getToken(): Promise<string> {
    const client = await this.initPromise;
    return client.getTokenSilently();
  }

  async persistSession(): Promise<void> {
    const [user, token] = await Promise.all([this.getUser(), this.getToken()]);
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    }
    if (token) {
      localStorage.setItem('authToken', token);
    }
  }
}
