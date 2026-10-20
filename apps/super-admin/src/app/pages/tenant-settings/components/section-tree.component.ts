import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { SECTION_DEFS, SectionDef } from './section-settings/shared/section-base';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-section-tree',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="tree-root">
      <div class="tree-head">
        <h4>Page Structure</h4>
        <button class="tree-theme-btn" [class.active]="selectedKey === 'theme'" (click)="themeClicked.emit()">
          <mat-icon>palette</mat-icon>
          <span>Theme</span>
        </button>
      </div>

      <div class="tree-scroll">
        <!-- Locked sections (always visible) -->
        <div class="tree-group">
          <div class="tree-group-label">Fixed Sections</div>
          @for (def of lockedSections; track def.key) {
            <div class="tree-item"
                 [class.active]="selectedKey === def.key"
                 (click)="selectKey(def.key)">
              <span class="tree-item-icon"><mat-icon>{{ def.icon }}</mat-icon></span>
              <span class="tree-item-label">{{ def.label }}</span>
              <span class="tree-item-fixed">Pinned</span>
            </div>
          }
        </div>

        <!-- Reorderable sections -->
        <div class="tree-group">
          <div class="tree-group-label">Configurable Sections</div>
          @for (def of unlockedSections; track def.key) {
            <div class="tree-item"
                 [class.active]="selectedKey === def.key"
                 [class.is-hidden]="isHidden(def.key)"
                 [class.drag-over]="dragOverKey === def.key"
                 draggable="true"
                 (dragstart)="onDragStart($event, def)"
                 (dragover)="onDragOver($event, def)"
                 (dragleave)="dragOverKey = null"
                 (drop)="onDrop($event, def)"
                 (dragend)="onDragEnd()"
                 (click)="selectKey(def.key)">
              <span class="tree-drag-handle">⋮⋮</span>
              <span class="tree-item-icon"><mat-icon>{{ def.icon }}</mat-icon></span>
              <span class="tree-item-label">{{ def.label }}</span>
              <button class="tree-eye-btn" [title]="isHidden(def.key) ? 'Show' : 'Hide'"
                      (click)="toggleVisibility(def.key, $event)">
                <mat-icon>{{ isHidden(def.key) ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      width: 260px;
      min-width: 260px;
      height: 100%;
      background: #fff;
      border-right: 1px solid #e4e4e7;
      overflow: hidden;
    }

    .tree-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .tree-head {
      padding: 14px 16px 10px;
      border-bottom: 1px solid #f0f0f0;
      flex-shrink: 0;
    }

    .tree-head h4 {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6b7280;
      margin: 0 0 8px;
    }

    .tree-theme-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      background: linear-gradient(135deg, #f3e8ff, #ede9fe);
      border: 1px solid #d8b4fe;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #7c3aed;
      cursor: pointer;
      width: 100%;
      transition: all 0.15s;
    }

    .tree-theme-btn:hover { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
    .tree-theme-btn.active { background: #7c3aed; color: #fff; border-color: #7c3aed; }
    .tree-theme-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .tree-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px 10px;
      scrollbar-width: thin;
      scrollbar-color: #d1d5db transparent;
    }

    .tree-scroll::-webkit-scrollbar { width: 6px; }
    .tree-scroll::-webkit-scrollbar-track { background: transparent; }
    .tree-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }

    .tree-group { margin-bottom: 12px; }

    .tree-group-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #9ca3af;
      padding: 4px 8px 6px;
    }

    .tree-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.12s ease;
      position: relative;
      user-select: none;
      border: 2px solid transparent;
      margin-bottom: 2px;
    }

    .tree-item:hover {
      background: #f5f3ff;
      border-color: #ede9fe;
    }

    .tree-item:active {
      background: #ede9fe;
    }

    .tree-item.active {
      background: #f3e8ff;
      border-color: #7c3aed;
      box-shadow: 0 0 0 1px rgba(124,58,237,0.1);
    }

    .tree-item.is-hidden {
      opacity: 0.45;
    }

    .tree-item.is-hidden .tree-item-label {
      text-decoration: line-through;
    }

    .tree-item.drag-over {
      border-top: 2px solid #7c3aed;
    }

    .tree-drag-handle {
      cursor: grab;
      color: #c4b5fd;
      font-size: 14px;
      line-height: 1;
      flex-shrink: 0;
      width: 12px;
      text-align: center;
      transition: color 0.15s;
    }

    .tree-drag-handle:hover { color: #7c3aed; cursor: grabbing; }

    .tree-item-icon {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f3ff;
      border-radius: 6px;
      color: #7c3aed;
    }

    .tree-item.active .tree-item-icon {
      background: #7c3aed;
      color: #fff;
    }

    .tree-item-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .tree-item-label {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tree-item.active .tree-item-label {
      color: #7c3aed;
      font-weight: 600;
    }

    .tree-item-fixed {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #9ca3af;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
      flex-shrink: 0;
    }

    .tree-eye-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 3px;
      color: #9ca3af;
      border-radius: 4px;
      transition: all 0.15s;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .tree-eye-btn:hover { color: #7c3aed; background: #f3e8ff; }
    .tree-eye-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }

    @media (max-width: 1200px) {
      :host { width: 220px; min-width: 220px; }
    }
  `],
})
export class SectionTreeComponent {
  @Input() selectedKey: string = 'hero';
  @Input() hiddenSections: string[] = [];
  @Input() orderedKeys: string[] = [];
  @Input() showTheme = false;
  @Output() keySelected = new EventEmitter<string>();
  @Output() visibilityToggled = new EventEmitter<string>();
  @Output() orderChanged = new EventEmitter<string[]>();
  @Output() themeClicked = new EventEmitter<void>();

  readonly lockedSections: SectionDef[] = SECTION_DEFS.filter(d => d.locked);
  readonly unlockedSections: SectionDef[] = SECTION_DEFS.filter(d => !d.locked);

  dragOverKey: string | null = null;
  private draggedKey: string | null = null;

  isHidden(key: string): boolean {
    return this.hiddenSections.includes(key);
  }

  selectKey(key: string): void {
    this.keySelected.emit(key);
  }

  toggleVisibility(key: string, event: Event): void {
    event.stopPropagation();
    this.visibilityToggled.emit(key);
  }

  onDragStart(event: DragEvent, def: SectionDef): void {
    this.draggedKey = def.key;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', def.key);
  }

  onDragOver(event: DragEvent, def: SectionDef): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dragOverKey = def.key;
  }

  onDrop(event: DragEvent, targetDef: SectionDef): void {
    event.preventDefault();
    this.dragOverKey = null;
    if (!this.draggedKey || this.draggedKey === targetDef.key) return;

    const fromIdx = this.unlockedSections.findIndex((d: SectionDef) => d.key === this.draggedKey);
    const toIdx = this.unlockedSections.findIndex((d: SectionDef) => d.key === targetDef.key);
    if (fromIdx < 0 || toIdx < 0) return;

    const keys = this.unlockedSections.map((d: SectionDef) => d.key);
    const item = keys.splice(fromIdx, 1)[0];
    keys.splice(toIdx, 0, item);
    this.orderChanged.emit([...this.lockedSections.map((d: SectionDef) => d.key), ...keys]);
  }

  onDragEnd(): void {
    this.draggedKey = null;
    this.dragOverKey = null;
  }
}
