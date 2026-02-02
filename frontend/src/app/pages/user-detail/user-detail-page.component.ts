import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppShellComponent } from '../../layout/app-shell.component';
import { ApiService } from '../../shared/api.service';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [AppShellComponent, NgFor, NgIf, RouterLink],
  template: `
    <app-shell title="User Info">
      <div *ngIf="user" class="card">
        <h3>{{ user.fullName }}</h3>
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
        <p><strong>Devices:</strong></p>
        <ul><li *ngFor="let d of user.devices">{{ d.name }} - {{ d.model }}</li></ul>
        <p><strong>Computers:</strong></p>
        <ul><li *ngFor="let c of user.computers">{{ c.name }} - {{ c.model }}</li></ul>
        <a routerLink="/users">Back</a>
      </div>
    </app-shell>
  `,
  styles: [`.card { background:#fff; border:1px solid #d7e2f4; border-radius:14px; padding:18px; }`]
})
export class UserDetailPageComponent implements OnInit {
  protected user?: any;

  constructor(private readonly route: ActivatedRoute, private readonly api: ApiService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getUser(id).subscribe((value) => (this.user = value));
  }
}
