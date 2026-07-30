import { signal, computed, Signal } from '@angular/core';

export type SortDirection = 'asc' | 'desc';

export function createSort() {
  const sortColumn = signal<string>('');
  const sortDirection = signal<SortDirection>('asc');

  function toggleSort(column: string): void {
    if (sortColumn() === column) {
      sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      sortColumn.set(column);
      sortDirection.set('asc');
    }
  }

  function sortIcon(column: string): string {
    if (sortColumn() !== column) return 'unfold_more';
    return sortDirection() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  return { sortColumn, sortDirection, toggleSort, sortIcon };
}

export function createPagination<T>(items: Signal<T[]>, defaultPageSize = 10) {
  const pageSize = signal(defaultPageSize);
  const currentPage = signal(1);

  const totalItems = computed(() => items().length);
  const totalPages = computed(() => Math.max(1, Math.ceil(totalItems() / pageSize())));
  const paginated = computed(() => {
    const start = (currentPage() - 1) * pageSize();
    return items().slice(start, start + pageSize());
  });

  function goToPage(page: number): void {
    const p = Math.max(1, Math.min(page, totalPages()));
    currentPage.set(p);
  }

  function onPageSizeChange(size: number): void {
    pageSize.set(size);
    currentPage.set(1);
  }

  return { pageSize, currentPage, totalItems, totalPages, paginated, goToPage, onPageSizeChange };
}
