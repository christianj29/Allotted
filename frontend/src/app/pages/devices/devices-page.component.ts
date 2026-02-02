import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Device } from '../../shared/models';

@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, RouterLink],
  template: `
    <app-shell title="Devices">
      <table>
        <thead>
          <tr><th>Name</th><th>Model</th><th>User</th><th>Compliant</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of devices" [routerLink]="['/devices', d.id]">
            <td>{{ d.name }}</td><td>{{ d.model }}</td><td>{{ d.user || '-' }}</td><td>{{ d.compliant ? 'Yes' : 'No' }}</td>
          </tr>
        </tbody>
      </table>
    </app-shell>
  `,
  styles: [`table { width:100%; background:#fff; border-collapse:collapse; } th,td { padding:12px; border-bottom:1px solid #dbe5f6; } tr{cursor:pointer;} tr:hover{background:#f2f7ff;}`]
})
export class DevicesPageComponent implements OnInit {
  protected devices: Device[] = [];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.getDevices().subscribe((rows) => (this.devices = rows));
  }
}
