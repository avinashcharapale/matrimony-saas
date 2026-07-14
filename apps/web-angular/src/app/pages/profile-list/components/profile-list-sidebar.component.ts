import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './profile-list-sidebar.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListSidebarComponent {}
