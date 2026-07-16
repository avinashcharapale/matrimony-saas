import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list-title',
  standalone: true,
  templateUrl: './profile-list-title.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListTitleComponent {
  @Input() userFirstName = '';
}
