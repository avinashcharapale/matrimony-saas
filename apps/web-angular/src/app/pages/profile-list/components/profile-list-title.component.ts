import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-profile-list-title',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './profile-list-title.component.html',
  styleUrl: '../profile-list.css',
})
export class ProfileListTitleComponent {
  @Input() userFirstName = '';
}
