import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  Input,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TenantClient } from '@org/generated';
import { APPROVED_TEMPLATES, LandingTemplate, TemplateCategory } from '@org/landing-templates';
import { NotificationService } from '@org/core';
import { TemplatePreviewComponent } from '../../components/template-preview/template-preview.component';

const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Traditional',
  'Regional',
  'Royal',
  'Festive',
  'Modern',
  'Premium',
  'Platform',
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-template-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TemplatePreviewComponent,
  ],
  template: `
    <div class="tpl-panel">
      <div class="tpl-panel__head">
        <div>
          <h3>Landing Template</h3>
          <p class="tpl-panel__sub">Pick the approved landing page design for this tenant. The live preview updates instantly — changes save automatically.</p>
        </div>
        @if (saving()) {
          <span class="tpl-panel__status">
            <mat-spinner diameter="16"></mat-spinner> Saving...
          </span>
        } @else if (saved()) {
          <span class="tpl-panel__status tpl-panel__status--ok">
            <mat-icon>check_circle</mat-icon> Saved
          </span>
        }
      </div>

      @if (loading()) {
        <div class="tpl-panel__loading">
          <mat-spinner diameter="32"></mat-spinner>
        </div>
      } @else {
        <div class="tpl-panel__body">
          <aside class="tpl-panel__picker">
            <div class="template-groups">
              @for (group of templateGroups(); track group.cat) {
                <div class="template-group">
                  <div class="template-group-title">{{ group.cat }}</div>
                  <div class="template-grid">
                    @for (tpl of group.items; track tpl.id) {
                      <button
                        type="button"
                        class="template-card"
                        [class.selected]="selectedTemplateId() === tpl.id"
                        (click)="selectTemplate(tpl.id)"
                        [attr.aria-pressed]="selectedTemplateId() === tpl.id"
                      >
                        <div
                          class="template-preview"
                          [style.background]="'linear-gradient(135deg, ' + tpl.c.p + ' 0%, ' + tpl.c.dp + ' 60%, ' + tpl.c.ink + ' 100%)'"
                        >
                          <div class="template-preview-bar" [style.background]="tpl.c.s"></div>
                          <div class="template-preview-body" [style.background]="tpl.c.bg">
                            <div class="preview-line" [style.background]="tpl.c.ts"></div>
                            <div class="preview-line short" [style.background]="tpl.c.p"></div>
                            <div class="preview-pill" [style.background]="tpl.c.s"></div>
                          </div>
                        </div>
                        <div class="template-info">
                          <div class="template-name">{{ tpl.name }}</div>
                          <div class="template-tag">{{ tpl.tag }}</div>
                        </div>
                        @if (selectedTemplateId() === tpl.id) {
                          <mat-icon class="template-check">check_circle</mat-icon>
                        }
                      </button>
                    }
                  </div>
                </div>
              }
            </div>
          </aside>

          <section class="tpl-panel__stage" #stage>
            <div class="tpl-stage-bar">
              <span class="tpl-stage-dot"></span>
              <span class="tpl-stage-name">{{ previewTpl().name }}</span>
              <span class="tpl-stage-tag">{{ previewTpl().tag }} · {{ previewTpl().hero }} hero · {{ previewTpl().btn }} buttons</span>
              <span class="tpl-stage-live">LIVE PREVIEW</span>
              <button
                type="button"
                class="tpl-stage-fs"
                (click)="toggleFullscreen()"
                [attr.aria-label]="isFullscreen() ? 'Exit fullscreen' : 'Enter fullscreen'"
                [title]="isFullscreen() ? 'Exit fullscreen (Esc)' : 'View fullscreen'"
              >
                <mat-icon>{{ isFullscreen() ? 'fullscreen_exit' : 'fullscreen' }}</mat-icon>
                <span>{{ isFullscreen() ? 'Exit Fullscreen' : 'Fullscreen' }}</span>
              </button>
            </div>
            <div class="tpl-stage-frame">
              <div class="tpl-preview-canvas">
                <app-template-preview [tpl]="previewTpl()" />
              </div>
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .tpl-panel { width: 100%; }
    .tpl-panel__head {
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;
      margin-bottom: 1rem;
    }
    .tpl-panel__head h3 { margin: 0 0 4px; font-size: 17px; font-weight: 600; color: #222; }
    .tpl-panel__sub { margin: 0; color: #757575; font-size: 13px; max-width: 720px; line-height: 1.55; }
    .tpl-panel__status {
      display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600;
      color: #7b1fa2; white-space: nowrap; padding-top: 2px;
    }
    .tpl-panel__status--ok { color: #2e7d32; }
    .tpl-panel__status mat-icon { font-size: 15px; width: 15px; height: 15px; }
    .tpl-panel__loading { display: flex; justify-content: center; padding: 2.5rem; }

    .tpl-panel__body {
      display: grid;
      grid-template-columns: 300px minmax(0, 1fr);
      gap: 20px;
      align-items: start;
    }

    .tpl-panel__picker {
      background: #fafafa;
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 10px;
      max-height: 680px;
      overflow-y: auto;
    }
    .template-group { margin-bottom: 10px; }
    .template-group:last-child { margin-bottom: 0; }
    .template-group-title {
      font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
      color: rgba(0, 0, 0, 0.45); margin: 4px 0 8px;
    }
    .template-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .template-card {
      position: relative; display: block; text-align: left; padding: 0;
      border: 2px solid transparent; border-radius: 8px; background: #fff;
      overflow: hidden; cursor: pointer;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }
    .template-card:hover { box-shadow: 0 2px 6px rgba(0, 0, 0, 0.14); }
    .template-card.selected {
      border-color: #7b1fa2;
      box-shadow: 0 0 0 1px #7b1fa2, 0 2px 6px rgba(123, 31, 162, 0.18);
    }
    .template-preview { height: 64px; position: relative; }
    .template-preview-bar { height: 4px; position: absolute; top: 0; left: 0; right: 0; }
    .template-preview-body {
      position: absolute; top: 12px; left: 8px; right: 8px; height: 44px;
      border-radius: 4px; padding: 8px; display: flex; flex-direction: column; gap: 6px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
    }
    .preview-line { height: 4px; border-radius: 2px; width: 80%; opacity: 0.9; }
    .preview-line.short { width: 50%; }
    .preview-pill { width: 34px; height: 8px; border-radius: 4px; margin-top: 2px; }
    .template-info { padding: 8px 10px 10px; }
    .template-name {
      font-size: 12.5px; font-weight: 600; color: #2c003e;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .template-tag {
      font-size: 11px; color: rgba(0, 0, 0, 0.5);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .template-check {
      position: absolute; top: 6px; right: 6px; font-size: 18px;
      width: 18px; height: 18px; color: #7b1fa2; background: #fff; border-radius: 50%;
    }

    .tpl-panel__stage { min-width: 0; }
    .tpl-stage-bar {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px; background: #fff; border: 1px solid #e4e4e7;
      border-bottom: none; border-radius: 12px 12px 0 0;
    }
    .tpl-stage-dot { width: 10px; height: 10px; border-radius: 50%; background: #2e7d32; }
    .tpl-stage-name { font-weight: 700; font-size: 14px; color: #2c003e; }
    .tpl-stage-tag { font-size: 12px; color: #757575; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tpl-stage-live {
      margin-left: auto; font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
      color: #2e7d32; background: #e8f5e9; padding: 3px 8px; border-radius: 999px; white-space: nowrap;
    }
    .tpl-stage-fs {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; color: #2c003e; background: #f3f0f7;
      border: 1px solid #e0d8ea; border-radius: 8px; padding: 5px 10px;
      cursor: pointer; white-space: nowrap;
      transition: background 0.15s ease, border-color 0.15s ease;
    }
    .tpl-stage-fs:hover { background: #e9e2f1; border-color: #d3c6e4; }
    .tpl-stage-fs mat-icon { font-size: 17px; width: 17px; height: 17px; }
    .tpl-stage-frame {
      border: 1px solid #e4e4e7; border-radius: 0 0 12px 12px; overflow: auto;
      max-height: 680px; background: #fff;
    }
    .tpl-preview-canvas { min-width: 1080px; background: #fff; }
    .tpl-preview-canvas .tpl-root { min-height: 100%; }

    .tpl-panel__stage:fullscreen {
      width: 100vw; height: 100vh; background: #1b1b1f; display: flex;
      flex-direction: column; padding: 0;
    }
    .tpl-panel__stage:fullscreen .tpl-stage-bar {
      flex: 0 0 auto; border-radius: 0; border-left: none; border-right: none; border-top: none;
    }
    .tpl-panel__stage:fullscreen .tpl-stage-frame {
      flex: 1 1 auto; max-height: none; border: none; border-radius: 0; overflow: auto;
    }
    .tpl-panel__stage:fullscreen .tpl-preview-canvas { margin: 0 auto; background: #fff; }
  `],
})
export class LandingTemplatePanel {
  private readonly tenantClient = inject(TenantClient);
  private readonly notifications = inject(NotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly isFullscreen = signal(false);
  readonly selectedTemplateId = signal<string | null>(null);

  @ViewChild('stage')
  private stageRef?: ElementRef<HTMLElement>;

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    const el = this.stageRef?.nativeElement;
    this.isFullscreen.set(!!el && document.fullscreenElement === el);
  }

  toggleFullscreen(): void {
    const el = this.stageRef?.nativeElement;
    if (!el) return;
    if (!this.isFullscreen()) {
      el.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.().catch(() => undefined);
    }
  }

  readonly templateGroups = computed(() =>
    TEMPLATE_CATEGORIES
      .map((cat) => ({ cat, items: APPROVED_TEMPLATES.filter((t) => t.cat === cat) }))
      .filter((g) => g.items.length > 0),
  );

  readonly previewTpl = computed<LandingTemplate>(() => {
    const sel = APPROVED_TEMPLATES.find((t) => t.id === this.selectedTemplateId());
    return sel ?? APPROVED_TEMPLATES[0];
  });

  private tenantIdValue = 0;

  @Input()
  set tenantId(value: number | null | undefined) {
    const id = Number(value ?? 0);
    if (id && id !== this.tenantIdValue) {
      this.tenantIdValue = id;
      this.load();
    }
  }

  private load(): void {
    this.loading.set(true);
    this.tenantClient.getTenantBranding(this.tenantIdValue).subscribe({
      next: (branding) => {
        this.selectedTemplateId.set(branding.themeTemplateId ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.selectedTemplateId.set(null);
        this.loading.set(false);
      },
    });
  }

  selectTemplate(id: string): void {
    const next = this.selectedTemplateId() === id ? null : id;
    this.selectedTemplateId.set(next);
    this.saved.set(false);
    this.saving.set(true);
    this.tenantClient
      .upsertTenantBranding({ themeTemplateId: next ?? undefined }, this.tenantIdValue)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.saved.set(true);
          this.notifications.success(next ? 'Landing template updated' : 'Landing template cleared');
        },
        error: () => {
          this.saving.set(false);
          this.notifications.error('Failed to save landing template');
        },
      });
  }
}
