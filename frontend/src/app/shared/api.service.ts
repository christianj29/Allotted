import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Computer,
  CreateComputerRequest,
  CreateDeviceRequest,
  CreateUserRequest,
  CreateUserResponse,
  DashboardSummary,
  Device,
  LoginResponse,
  UpdateUserRequest,
  UserRow
} from './models';

@Injectable({ providedIn: 'root' })
// Central API client for the frontend.
export class ApiService {
  private readonly baseUrl = 'http://localhost:5000/api';

  constructor(private readonly http: HttpClient) {}

  // Auth endpoints.
  // Log in with email/password.
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  // Log in via Auth0 with a known email.
  auth0Login(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/auth0-login`, { email });
  }

  // Update a user's password.
  forgotPassword(email: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/forgot-password`, { email, newPassword });
  }

  // Check if a user can create an account.
  checkAccountEligibility(email: string): Observable<{ eligible: boolean; department: string }> {
    return this.http.post<{ eligible: boolean; department: string }>(`${this.baseUrl}/auth/account-eligibility`, { email });
  }

  // Create an account for an eligible user.
  createAccount(email: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/create-account`, { email, password });
  }

  // Dashboard endpoints.
  // Fetch dashboard summary counts and compliance.
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  // User endpoints.
  // Fetch all users.
  getUsers(): Observable<UserRow[]> {
    return this.http.get<UserRow[]>(`${this.baseUrl}/users`);
  }

  // Create a new user.
  createUser(payload: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.baseUrl}/users`, payload);
  }

  // Computer endpoints.
  // Create a computer record.
  createComputer(payload: CreateComputerRequest): Observable<Computer> {
    return this.http.post<Computer>(`${this.baseUrl}/computers`, payload);
  }

  // Update a computer record.
  updateComputer(id: number, payload: CreateComputerRequest): Observable<Computer> {
    return this.http.put<Computer>(`${this.baseUrl}/computers/${id}`, payload);
  }

  // Delete a computer record.
  deleteComputer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/computers/${id}`);
  }

  // Device endpoints.
  // Create a device record.
  createDevice(payload: CreateDeviceRequest): Observable<Device> {
    return this.http.post<Device>(`${this.baseUrl}/devices`, payload);
  }

  // Update a device record.
  updateDevice(id: number, payload: CreateDeviceRequest): Observable<Device> {
    return this.http.put<Device>(`${this.baseUrl}/devices/${id}`, payload);
  }

  // Delete a device record.
  deleteDevice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/devices/${id}`);
  }

  // Agent endpoints.
  // Enqueue a command for a device agent.
  createAgentCommand(agentId: string, payload: { type: string; payload?: Record<string, unknown> }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/agents/${agentId}/commands`, payload);
  }

  // Fetch a user with their devices/computers.
  getUser(id: number): Observable<UserRow & { devices: Device[]; computers: Computer[] }> {
    return this.http.get<UserRow & { devices: Device[]; computers: Computer[] }>(`${this.baseUrl}/users/${id}`);
  }

  // Update a user record.
  updateUser(id: number, payload: UpdateUserRequest): Observable<UserRow> {
    return this.http.put<UserRow>(`${this.baseUrl}/users/${id}`, payload);
  }

  // Delete a user record.
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  // Fetch all devices.
  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.baseUrl}/devices`);
  }

  // Fetch a device by id.
  getDevice(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.baseUrl}/devices/${id}`);
  }

  // Fetch all computers.
  getComputers(): Observable<Computer[]> {
    return this.http.get<Computer[]>(`${this.baseUrl}/computers`);
  }

  // Fetch a computer by id.
  getComputer(id: number): Observable<Computer> {
    return this.http.get<Computer>(`${this.baseUrl}/computers/${id}`);
  }
}
