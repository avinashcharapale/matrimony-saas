import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
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
  imports: [IonicModule, CommonModule, RouterModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-page>
      <ion-content>
        <div class="shell">
          <h2>{{ pageData.title }}</h2>
          <p>{{ pageData.description }}</p>

          <ion-item lines="none" class="theme-picker">
            <ion-label>Theme</ion-label>
            <ion-select [ngModel]="tenantService.activeThemeId" (ngModelChange)="onThemeChange($event)">
              @for (theme of tenantService.themes; track theme.id) {
              <ion-select-option [value]="theme.id">
                {{ theme.name }}
              </ion-select-option>
              }
            </ion-select>
          </ion-item>

          <ul>
            @for (item of pageData.highlights; track item) {
            <li>{{ item }}</li>
            }
          </ul>

          <a routerLink="/home" class="btn">Back to Home</a>
        </div>
      </ion-content>
    </ion-page>
  `,
  styles: [
    `
      .shell {
        padding: 1rem;
      }

      h2 {
        margin: 0;
      }

      p {
        color: var(--text-muted);
      }

      .theme-picker {
        --background: var(--surface-overlay);
        border-radius: 0.75rem;
        margin: 0.75rem 0 1rem;
      }

      ul {
        padding-left: 1rem;
        color: var(--text-strong);
      }

      .btn {
        display: inline-block;
        margin-top: 0.75rem;
        text-decoration: none;
        color: var(--on-primary);
        background: var(--tenant-primary);
        padding: 0.6rem 0.8rem;
        border-radius: 0.6rem;
      }
    `,
  ],
})
export class MenuPage {
  private readonly route = inject(ActivatedRoute);
  readonly tenantService = inject(TenantService);

  onThemeChange(themeId: string): void {
    this.tenantService.setTheme(themeId);
  }

  get pageData(): MenuPageData {
    return (
      (this.route.snapshot.data as MenuPageData) ?? {
        title: 'Information',
        description: 'Helpful details for members.',
        highlights: [],
      }
    );
  }
}
