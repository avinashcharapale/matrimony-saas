import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-sidebar.component.html',
  styleUrl: '../home.css',
})
export class HomeSidebarComponent {
  @Input({ required: true }) brandMark!: string;
  @Input({ required: true }) tenantDisplayName!: string;
}
