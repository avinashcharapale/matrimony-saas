import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MessageItem } from '../home.models';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home-bottom',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './home-bottom.component.html',
  styleUrl: '../home.css',
})
export class HomeBottomComponent {
  @Input({ required: true }) horoscopeTags!: string[];
  @Input({ required: true }) messages!: MessageItem[];
}
