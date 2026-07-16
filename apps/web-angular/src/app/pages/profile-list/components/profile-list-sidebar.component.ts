import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './profile-list-sidebar.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListSidebarComponent {
  @Input() userName = '';
  @Input() userPhotoUrl = '';
  @Input() userOccupation = '';

  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout().subscribe();
  }
}
