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
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password });
  }

  forgotPassword(email: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/forgot-password`, { email, newPassword });
  }

  checkAccountEligibility(email: string): Observable<{ eligible: boolean; department: string }> {
    return this.http.post<{ eligible: boolean; department: string }>(`${this.baseUrl}/auth/account-eligibility`, { email });
  }

  createAccount(email: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/create-account`, { email, password });
  }

  // Dashboard endpoints.
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  // User endpoints.
  getUsers(): Observable<UserRow[]> {
    return this.http.get<UserRow[]>(`${this.baseUrl}/users`);
  }

  createUser(payload: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>(`${this.baseUrl}/users`, payload);
  }

  // Computer endpoints.
  createComputer(payload: CreateComputerRequest): Observable<Computer> {
    return this.http.post<Computer>(`${this.baseUrl}/computers`, payload);
  }

  updateComputer(id: number, payload: CreateComputerRequest): Observable<Computer> {
    return this.http.put<Computer>(`${this.baseUrl}/computers/${id}`, payload);
  }

  deleteComputer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/computers/${id}`);
  }

  // Device endpoints.
  createDevice(payload: CreateDeviceRequest): Observable<Device> {
    return this.http.post<Device>(`${this.baseUrl}/devices`, payload);
  }

  updateDevice(id: number, payload: CreateDeviceRequest): Observable<Device> {
    return this.http.put<Device>(`${this.baseUrl}/devices/${id}`, payload);
  }

  deleteDevice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/devices/${id}`);
  }

  // Agent endpoints.
  createAgentCommand(agentId: string, payload: { type: string; payload?: Record<string, unknown> }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/agents/${agentId}/commands`, payload);
  }

  getUser(id: number): Observable<UserRow & { devices: Device[]; computers: Computer[] }> {
    return this.http.get<UserRow & { devices: Device[]; computers: Computer[] }>(`${this.baseUrl}/users/${id}`);
  }

  updateUser(id: number, payload: UpdateUserRequest): Observable<UserRow> {
    return this.http.put<UserRow>(`${this.baseUrl}/users/${id}`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/users/${id}`);
  }

  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.baseUrl}/devices`);
  }

  getDevice(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.baseUrl}/devices/${id}`);
  }

  getComputers(): Observable<Computer[]> {
    return this.http.get<Computer[]>(`${this.baseUrl}/computers`);
  }

  getComputer(id: number): Observable<Computer> {
    return this.http.get<Computer>(`${this.baseUrl}/computers/${id}`);
  }
}
