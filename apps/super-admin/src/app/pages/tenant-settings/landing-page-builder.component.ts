import {
  Component,
  ChangeDetectionStrategy,
  Input,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TenantClient } from '@org/generated';
import { APPROVED_TEMPLATES, LandingTemplate } from '@org/landing-templates';
import { NotificationService } from '@org/core';
import { TemplatePreviewComponent } from '../../components/template-preview/template-preview.component';
import { SectionTreeComponent } from './components/section-tree.component';
import { SectionSettingsPanelComponent } from './components/section-settings-panel.component';
import { PreviewToolbarComponent, DeviceType } from './components/preview-toolbar.component';
import { ThemeSettingsComponent, ThemeConfig } from './components/theme-settings.component';
import { SECTION_DEFS, DEFAULT_SECTION_CONFIGS } from './components/section-settings/shared/section-base';

interface VersionEntry {
  v: number;
  s: 'draft' | 'published';
  t: string;
  at: string;
}

interface BuilderConfig {
  sectionOrder: string[];
  sectionsVisible: Record<string, boolean>;
  selectedSection: string;
  previewDevice: DeviceType;
  hero: Record<string, any>;
  banner: Record<string, any>;
  stats: Record<string, any>;
  features: Record<string, any>;
  how: Record<string, any>;
  profiles: Record<string, any>;
  success: Record<string, any>;
  testimonials: Record<string, any>;
  counters: Record<string, any>;
  why: Record<string, any>;
  castes: Record<string, any>;
  melava: Record<string, any>;
  app: Record<string, any>;
  beforeafter: Record<string, any>;
  cta: Record<string, any>;
  header: Record<string, any>;
  footer: Record<string, any>;
  theme: ThemeConfig;
  versions: VersionEntry[];
  lastSavedAt: string | null;
}

function defaultConfig(): BuilderConfig {
  return {
    sectionOrder: SECTION_DEFS.filter(d => !d.locked).map(d => d.key),
    sectionsVisible: {},
    selectedSection: 'hero',
    previewDevice: 'desktop',
    hero: { ...DEFAULT_SECTION_CONFIGS['hero'] },
    banner: { ...DEFAULT_SECTION_CONFIGS['banner'] },
    stats: { ...DEFAULT_SECTION_CONFIGS['stats'] },
    features: { ...DEFAULT_SECTION_CONFIGS['features'] },
    how: { ...DEFAULT_SECTION_CONFIGS['how'] },
    profiles: { ...DEFAULT_SECTION_CONFIGS['profiles'] },
    success: { ...DEFAULT_SECTION_CONFIGS['success'] },
    testimonials: { ...DEFAULT_SECTION_CONFIGS['testimonials'] },
    counters: { ...DEFAULT_SECTION_CONFIGS['counters'] },
    why: { ...DEFAULT_SECTION_CONFIGS['why'] },
    castes: { ...DEFAULT_SECTION_CONFIGS['castes'] },
    melava: { ...DEFAULT_SECTION_CONFIGS['melava'] },
    app: { ...DEFAULT_SECTION_CONFIGS['app'] },
    beforeafter: { ...DEFAULT_SECTION_CONFIGS['beforeafter'] },
    cta: { ...DEFAULT_SECTION_CONFIGS['cta'] },
    header: { ...DEFAULT_SECTION_CONFIGS['header'] },
    footer: { ...DEFAULT_SECTION_CONFIGS['footer'] },
    theme: {},
    versions: [],
    lastSavedAt: null,
  };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-landing-page-builder',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TemplatePreviewComponent,
    SectionTreeComponent,
    SectionSettingsPanelComponent,
    PreviewToolbarComponent,
    ThemeSettingsComponent,
  ],
  template: `
    <div class="builder-root">
      <app-preview-toolbar
        [device]="device"
        [saving]="saving"
        [dirty]="dirty"
        [lastSavedAt]="lastSavedAt"
        (saveDraft)="saveDraft()"
        (publish)="publishVersion()"
        (discard)="discardChanges()"
        (versionHistory)="showVersions.set(!showVersions())"
      />

      <div class="builder-body">
        <!-- Left Panel: Section Tree -->
        <app-section-tree
          [selectedKey]="selectedSection()"
          [hiddenSections]="hiddenSections()"
          [orderedKeys]="orderedKeys()"
          (keySelected)="onSectionSelect($event)"
          (visibilityToggled)="onToggleVisibility($event)"
          (orderChanged)="onOrderChanged($event)"
          (themeClicked)="onSectionSelect('theme')"
        />

        <!-- Center Panel: Preview -->
        <div class="builder-preview">
          <div class="builder-preview__viewport">
            <div class="builder-preview__frame"
                 [class.builder-preview__frame--desktop]="device() === 'desktop'"
                 [class.builder-preview__frame--tablet]="device() === 'tablet'"
                 [class.builder-preview__frame--mobile]="device() === 'mobile'">
              <app-template-preview
                [tpl]="tpl"
                [builderMode]="true"
                [selectedSection]="selectedSection()"
                [hiddenSections]="hiddenSections()"
                [sectionConfigs]="sectionConfigs()"
                (sectionClicked)="onSectionSelect($event)"
              />
            </div>
          </div>
        </div>

        <!-- Right Panel: Section Settings or Theme Settings -->
        @if (selectedSection() === 'theme') {
          <app-theme-settings
            [config]="themeConfig()"
            (configChanged)="onThemeChanged($event)"
          />
        } @else {
          <app-section-settings-panel
            [selectedKey]="selectedSection()"
            [sectionConfig]="currentSectionConfig()"
            (configChanged)="onConfigChanged($event)"
          />
        }
      </div>
    </div>

    <!-- Version History Overlay -->
    @if (showVersions()) {
      <div class="version-panel open">
        <div class="version-panel__head">
          <h3>Version History</h3>
          <button class="builder-btn builder-btn--ghost" (click)="showVersions.set(false)">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <div class="version-panel__list">
          @for (v of versions(); track v.v) {
            <div class="version-panel__item" [class.version-panel__item--published]="v.s === 'published'">
              <span class="version-panel__item-num">v{{ v.v }}</span>
              <div class="version-panel__item-info">
                <span class="badge" [class]="v.s === 'published' ? 'badge--published' : 'badge--draft'">
                  {{ v.s }}
                </span>
                <span class="version-panel__item-date">{{ v.at | date:'medium' }}</span>
              </div>
              <button class="builder-btn builder-btn--ghost builder-btn--sm" (click)="restoreVersion(v)">
                Restore
              </button>
            </div>
          } @empty {
            <div class="empty-state">
              <div class="empty-state__icon">history</div>
              <div class="empty-state__title">No versions yet</div>
              <div class="empty-state__desc">Publish your first version to start tracking history.</div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .builder-root {
      display: flex;
      flex-direction: column;
      height: calc(100vh - 200px);
      min-height: 600px;
      border: 1px solid #e4e4e7;
      border-radius: 12px;
      overflow: hidden;
      background: #f9fafb;
    }

    .builder-toolbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      background: #fff;
      border-bottom: 1px solid #e4e4e7;
      flex-shrink: 0;
      z-index: 10;
    }

    .builder-body {
      display: flex;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .builder-preview {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #e5e7eb;
    }

    .builder-preview__viewport {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 16px;
    }

    .builder-preview__frame {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
      transition: width 0.3s ease;
      flex-shrink: 0;
      /* Creates a new containing block so position:fixed children stay inside the frame */
      transform: translateZ(0);
    }

    .builder-preview__frame--desktop { width: 100%; max-width: 100%; }
    .builder-preview__frame--tablet { width: 768px; border: 8px solid #374151; border-radius: 16px; }
    .builder-preview__frame--mobile { width: 375px; border: 8px solid #1f2937; border-radius: 24px; }
  `],
})
export class LandingPageBuilderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) tenantId = 0;
  @Input({ required: true }) tpl!: LandingTemplate;

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent): void {
    if (this.dirty()) {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  private readonly tenantClient = inject(TenantClient);
  private readonly notification = inject(NotificationService);
  private autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

  readonly config = signal<BuilderConfig>(defaultConfig());
  readonly selectedSection = signal<string>('hero');
  readonly device = signal<DeviceType>('desktop');
  readonly saving = signal(false);
  readonly dirty = signal(false);
  readonly showVersions = signal(false);
  readonly lastSavedAt = signal<Date | null>(null);

  readonly orderedKeys = computed(() => {
    const c = this.config();
    const order = c.sectionOrder || SECTION_DEFS.filter(d => !d.locked).map(d => d.key);
    const locked = SECTION_DEFS.filter(d => d.locked).map(d => d.key);
    return [...locked, ...order.filter(k => !locked.includes(k))];
  });

  readonly hiddenSections = computed(() => {
    const vis = this.config().sectionsVisible;
    return Object.entries(vis).filter(([, v]) => v === false).map(([k]) => k);
  });

  readonly sectionConfigs = computed(() => {
    const c = this.config();
    const out: Record<string, Record<string, any>> = {};
    for (const key of this.orderedKeys()) {
      out[key] = (c as any)[key] || {};
    }
    return out;
  });

  readonly currentSectionConfig = computed(() => {
    const key = this.selectedSection();
    return this.sectionConfigs()[key] || {};
  });

  readonly versions = computed(() => this.config().versions || []);
  readonly themeConfig = computed(() => this.config().theme || {});

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  onSectionSelect(key: string): void {
    this.selectedSection.set(key);
    this.config.update(c => ({ ...c, selectedSection: key }));
    this.markDirty();
  }

  onThemeChanged(data: ThemeConfig): void {
    this.config.update(c => ({ ...c, theme: { ...c.theme, ...data } }));
    this.markDirty();
  }

  onToggleVisibility(key: string): void {
    this.config.update(c => {
      const vis = { ...c.sectionsVisible };
      vis[key] = vis[key] === false ? true : false;
      return { ...c, sectionsVisible: vis };
    });
    this.markDirty();
  }

  onOrderChanged(keys: string[]): void {
    this.config.update(c => ({
      ...c,
      sectionOrder: keys.filter(k => !SECTION_DEFS.find(d => d.key === k)?.locked),
    }));
    this.markDirty();
  }

  onConfigChanged(data: Record<string, any>): void {
    const key = this.selectedSection();
    this.config.update(c => ({ ...c, [key]: { ...(c as any)[key], ...data } }));
    this.markDirty();
  }

  discardChanges(): void {
    if (!confirm('Discard all unsaved changes and reload from server?')) return;
    this.dirty.set(false);
    this.loadConfig();
    this.notification.success('Changes discarded');
  }

  saveDraft(): void {
    this.save(false);
  }

  publishVersion(): void {
    this.save(true);
  }

  restoreVersion(v: VersionEntry): void {
    if (!confirm(`Restore version v${v.v}? Your current changes will be lost.`)) return;
    try {
      const parsed = JSON.parse(v.t);
      this.config.set({ ...defaultConfig(), ...parsed, versions: this.config().versions });
      this.markDirty();
      this.save(false);
      this.showVersions.set(false);
      this.notification.success('Version restored');
    } catch {
      this.notification.error('Failed to restore version');
    }
  }

  private save(publish: boolean): void {
    this.saving.set(true);
    this.dirty.set(false);

    const c = this.config();
    const snapshot = { ...c };
    delete (snapshot as any).versions;
    delete (snapshot as any).lastSavedAt;

    const versions = [...c.versions];
    const nextV = versions.length > 0 ? Math.max(...versions.map(v => v.v)) + 1 : 1;
    versions.push({
      v: nextV,
      s: publish ? 'published' : 'draft',
      t: JSON.stringify(snapshot),
      at: new Date().toISOString(),
    });

    const toSave = {
      ...c,
      versions,
      lastSavedAt: new Date().toISOString(),
    };

    this.tenantClient.getTenantBranding(this.tenantId).subscribe({
      next: (branding) => {
        let parsed: any = {};
        try { parsed = branding.landingContentJson ? JSON.parse(branding.landingContentJson) : {}; } catch {}

        const { versions: _v, lastSavedAt: _l, ...sectionData } = toSave;
        const landingContent = { ...parsed, ...sectionData, versions, lastSavedAt: toSave.lastSavedAt };

        this.tenantClient
          .upsertTenantBranding({ landingContentJson: JSON.stringify(landingContent) }, this.tenantId)
          .subscribe({
            next: () => {
              this.saving.set(false);
              this.lastSavedAt.set(new Date());
              this.config.set(toSave);
              this.notification.success(publish ? 'Published!' : 'Draft saved');
            },
            error: () => {
              this.saving.set(false);
              this.dirty.set(true);
              this.notification.error('Save failed');
            },
          });
      },
      error: () => {
        this.saving.set(false);
        this.dirty.set(true);
        this.notification.error('Save failed');
      },
    });
  }

  private loadConfig(): void {
    this.tenantClient.getTenantBranding(this.tenantId).subscribe({
      next: (branding) => {
        let landing: any = {};
        try { landing = branding.landingContentJson ? JSON.parse(branding.landingContentJson) : {}; } catch {}

        const def = defaultConfig();
        const loaded: BuilderConfig = {
          ...def,
          sectionOrder: landing.sectionOrder || def.sectionOrder,
          sectionsVisible: landing.sectionsVisible || def.sectionsVisible,
          selectedSection: landing.selectedSection || 'hero',
          previewDevice: landing.previewDevice || 'desktop',
          hero: { ...def.hero, ...(landing.hero || {}) },
          banner: { ...def.banner, ...(landing.banner || {}) },
          stats: { ...def.stats, ...(landing.stats || {}) },
          features: { ...def.features, ...(landing.features || {}) },
          how: { ...def.how, ...(landing.how || {}) },
          profiles: { ...def.profiles, ...(landing.profiles || {}) },
          success: { ...def.success, ...(landing.success || {}) },
          testimonials: { ...def.testimonials, ...(landing.testimonials || {}) },
          counters: { ...def.counters, ...(landing.counters || {}) },
          why: { ...def.why, ...(landing.why || {}) },
          castes: { ...def.castes, ...(landing.castes || {}) },
          melava: { ...def.melava, ...(landing.melava || {}) },
          app: { ...def.app, ...(landing.app || {}) },
          beforeafter: { ...def.beforeafter, ...(landing.beforeafter || {}) },
          cta: { ...def.cta, ...(landing.cta || {}) },
          header: { ...def.header, ...(landing.header || {}) },
          footer: { ...def.footer, ...(landing.footer || {}) },
          theme: { ...def.theme, ...(landing.theme || {}) },
          versions: landing.versions || [],
          lastSavedAt: landing.lastSavedAt || null,
        };

        this.config.set(loaded);
        this.selectedSection.set(loaded.selectedSection);
        this.device.set(loaded.previewDevice);

        if (loaded.lastSavedAt) {
          this.lastSavedAt.set(new Date(loaded.lastSavedAt));
        }
      },
    });
  }

  private markDirty(): void {
    this.dirty.set(true);
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
    this.autoSaveTimer = setTimeout(() => this.saveDraft(), 3000);
  }
}
