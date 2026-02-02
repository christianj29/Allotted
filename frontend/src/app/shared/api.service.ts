import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Computer, DashboardSummary, Device, UserRow } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'http://localhost:5000/api';

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }

  forgotPassword(email: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/auth/forgot-password`, { email, newPassword });
  }

  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getUsers(): Observable<UserRow[]> {
    return this.http.get<UserRow[]>(`${this.baseUrl}/users`);
  }

  getUser(id: number): Observable<UserRow & { devices: Device[]; computers: Computer[] }> {
    return this.http.get<UserRow & { devices: Device[]; computers: Computer[] }>(`${this.baseUrl}/users/${id}`);
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
