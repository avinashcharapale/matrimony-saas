import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home-header.component.html',
  styleUrl: '../home.css',
})
export class HomeHeaderComponent {
  @Input() userName = '';
  @Input() currentDate = '';
}
