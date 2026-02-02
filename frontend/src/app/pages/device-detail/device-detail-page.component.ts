import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Device } from '../../shared/models';

@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, RouterLink],
  template: `
    <app-shell title="Device Info">
      <div *ngIf="device" class="card">
        <p><strong>Name:</strong> {{ device.name }}</p>
        <p><strong>Model:</strong> {{ device.model }}</p>
        <p><strong>OS:</strong> {{ device.osVersion }}</p>
        <p><strong>Serial Number:</strong> {{ device.serialNumber }}</p>
        <p><strong>UDID:</strong> {{ device.udid || '-' }}</p>
        <p><strong>Processor:</strong> {{ device.processorType || '-' }}</p>
        <p><strong>Primary MAC:</strong> {{ device.primaryMacAddress || '-' }}</p>
        <a routerLink="/devices">Back</a>
      </div>
    </app-shell>
  `,
  styles: [`.card { background:#fff; border:1px solid #d7e2f4; border-radius:14px; padding:18px; }`]
})
export class DeviceDetailPageComponent implements OnInit {
  protected device?: Device;

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getDevice(id).subscribe((value) => (this.device = value));
  }
}
