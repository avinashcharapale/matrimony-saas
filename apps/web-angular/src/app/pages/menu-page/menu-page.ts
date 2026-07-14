import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant.service';

interface MenuPageData {
  title: string;
  description: string;
  highlights: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-menu-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu-page.html',
  styleUrls: ['./menu-page.css'],
})
export class MenuPage {
  private readonly route = inject(ActivatedRoute);
  readonly tenant = inject(TenantService).tenant;

  get pageData(): MenuPageData {
    return this.route.snapshot.data as MenuPageData;
  }
}
