import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-sidebar.component.html',
  styleUrl: '../home.css',
})
export class HomeSidebarComponent {
  @Input({ required: true }) brandMark!: string;
  @Input({ required: true }) tenantDisplayName!: string;

  private readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout().subscribe();
  }
}
