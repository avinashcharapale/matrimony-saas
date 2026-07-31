import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type RowPredicate = (row: Record<string, unknown>) => boolean;

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'badge';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-data-table',
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="data-table-card">
      @if (loading) {
        <div class="data-table-loading">
          <mat-spinner diameter="40"></mat-spinner>
          <span>Loading...</span>
        </div>
      } @else if (!data || data.length === 0) {
        <div class="data-table-empty">
          <mat-icon>inbox</mat-icon>
          <span>{{ emptyMessage || 'No data available' }}</span>
        </div>
      } @else {
        <table mat-table [dataSource]="data" class="data-table">
          @for (col of columns; track col.key) {
            <ng-container [matColumnDef]="col.key">
              <th mat-header-cell *matHeaderCellDef>{{ col.label }}</th>
              <td mat-cell *matCellDef="let row">
                {{ row[col.key] }}
              </td>
            </ng-container>
          }

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
            <td mat-cell *matCellDef="let row" class="actions-cell">
              @if (actionsTemplate) {
                <ng-container
                  [ngTemplateOutlet]="actionsTemplate"
                  [ngTemplateOutletContext]="{ $implicit: row }"
                ></ng-container>
              } @else {
                <button
                  mat-icon-button
                  color="primary"
                  [disabled]="canEdit && !canEdit(row)"
                  (click)="rowEdit.emit(row); $event.stopPropagation()"
                  aria-label="Edit"
                >
                  <mat-icon>edit</mat-icon>
                </button>
                <button
                  mat-icon-button
                  color="warn"
                  [disabled]="canDelete && !canDelete(row)"
                  (click)="rowDelete.emit(row); $event.stopPropagation()"
                  aria-label="Delete"
                >
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr
            mat-row
            *matRowDef="let row; columns: displayedColumns"
            (click)="rowClick.emit(row)"
            class="data-table-row"
          ></tr>
        </table>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .data-table-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .data-table {
      width: 100%;
    }

    .data-table-row {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .data-table-row:hover {
      background-color: #f5f5f5;
    }

    .actions-header {
      text-align: right;
    }

    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }

    .data-table-loading,
    .data-table-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      color: #757575;
    }

    .data-table-empty mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #bdbdbd;
    }
  `],
})
export class DataTableComponent {
  @Input({ required: true }) columns: TableColumn[] = [];
  @Input({ required: true }) data: Record<string, unknown>[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No data available';
  @Input() canEdit?: RowPredicate;
  @Input() canDelete?: RowPredicate;

  @ContentChild('actions') actionsTemplate?: TemplateRef<unknown>;

  @Output() rowClick = new EventEmitter<Record<string, unknown>>();
  @Output() rowEdit = new EventEmitter<Record<string, unknown>>();
  @Output() rowDelete = new EventEmitter<Record<string, unknown>>();

  get displayedColumns(): string[] {
    return [...this.columns.map(c => c.key), 'actions'];
  }
}
