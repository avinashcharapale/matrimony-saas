import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ui-paginator',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule],
  template: `
    <div class="paginator">
      <div class="paginator-info">
        @if (totalItems > 0) {
          Showing {{ startItem }}-{{ endItem }} of {{ totalItems }}
        }
      </div>

      <div class="paginator-nav">
        <button mat-icon-button [disabled]="currentPage <= 1" (click)="pageChange.emit(1)" title="First page">
          <mat-icon>first_page</mat-icon>
        </button>
        <button mat-icon-button [disabled]="currentPage <= 1" (click)="pageChange.emit(currentPage - 1)" title="Previous page">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <span class="paginator-current">Page {{ currentPage }} of {{ totalPages }}</span>

        <button mat-icon-button [disabled]="currentPage >= totalPages" (click)="pageChange.emit(currentPage + 1)" title="Next page">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <button mat-icon-button [disabled]="currentPage >= totalPages" (click)="pageChange.emit(totalPages)" title="Last page">
          <mat-icon>last_page</mat-icon>
        </button>
      </div>

      <div class="paginator-size">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Rows</mat-label>
          <mat-select [value]="pageSize" (selectionChange)="pageSizeChange.emit($event.value)">
            @for (size of pageSizeOptions; track size) {
              <mat-option [value]="size">{{ size }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .paginator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-top: 1px solid #eee;
      background: #fafafa;
      font-size: 0.8125rem;
      color: #666;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .paginator-info { min-width: 160px; }
    .paginator-nav { display: flex; align-items: center; gap: 2px; }
    .paginator-current { margin: 0 0.5rem; white-space: nowrap; }
    .paginator-size { min-width: 90px; }
  `],
})
export class PaginatorComponent {
  @Input({ required: true }) totalItems = 0;
  @Input({ required: true }) totalPages = 1;
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get startItem(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }
}
