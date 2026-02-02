import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';
import { Computer } from '../../shared/models';

@Component({
  selector: 'app-computer-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgIf, RouterLink],
  template: `
    <app-shell title="Computer Info">
      <div *ngIf="computer" class="card">
        <p><strong>Name:</strong> {{ computer.name }}</p>
        <p><strong>Model:</strong> {{ computer.model }}</p>
        <p><strong>OS:</strong> {{ computer.osVersion }}</p>
        <p><strong>Serial Number:</strong> {{ computer.serialNumber }}</p>
        <p><strong>Model Identifier:</strong> {{ computer.modelIdentifier || '-' }}</p>
        <p><strong>Processor:</strong> {{ computer.processorType || '-' }}</p>
        <p><strong>Architecture:</strong> {{ computer.architectureType || '-' }}</p>
        <a routerLink="/computers">Back</a>
      </div>
    </app-shell>
  `,
  styles: [`.card { background:#fff; border:1px solid #d7e2f4; border-radius:14px; padding:18px; }`]
})
export class ComputerDetailPageComponent implements OnInit {
  protected computer?: Computer;

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getComputer(id).subscribe((value) => (this.computer = value));
  }
}
