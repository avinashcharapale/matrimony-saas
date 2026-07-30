import { Component, ChangeDetectionStrategy, inject, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PlatformRoleService } from '../../../services/platform-role.service';
import { PlatformPermissionService, PlatformPermissionDto } from '../../../services/platform-permission.service';

export interface AssignPermissionsDialogData {
  roleId: number;
  roleName: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-assign-permissions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>Assign Permissions: {{ data.roleName }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <p>Loading permissions...</p>
      } @else {
        <div class="perm-list">
          @for (perm of allPermissions(); track perm.platformPermissionId) {
            <div class="perm-item">
              <mat-checkbox
                [checked]="selectedPermIds().has(perm.platformPermissionId!)"
                (change)="togglePerm(perm.platformPermissionId!)"
                color="primary"
              >
                <span class="perm-label">{{ perm.displayName }}</span>
                <span class="perm-code">{{ perm.permissionCode }}</span>
              </mat-checkbox>
            </div>
          }
        </div>
      }
    </mat-dialog-content>
    @if (error()) {
      <div class="dialog-error">{{ error() }}</div>
    }
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="loading() || saving()"
        (click)="save()"
      >
        @if (saving()) { Saving... } @else { Save }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 460px;
      max-height: 50vh;
    }
    .perm-list {
      display: flex;
      flex-direction: column;
    }
    .perm-item {
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .perm-item:last-child {
      border-bottom: none;
    }
    .perm-label {
      font-size: 14px;
    }
    .perm-code {
      font-size: 12px;
      color: #888;
      margin-left: 12px;
    }
    .dialog-error {
      background: #ffebee;
      color: #c62828;
      padding: 0.75rem 1.5rem;
      font-size: 0.875rem;
    }
  `],
})
export class AssignPermissionsDialogComponent implements OnInit {
  private readonly roleService = inject(PlatformRoleService);
  private readonly permService = inject(PlatformPermissionService);
  private readonly dialogRef = inject(MatDialogRef<AssignPermissionsDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly data = inject<AssignPermissionsDialogData>(MAT_DIALOG_DATA);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly allPermissions = signal<PlatformPermissionDto[]>([]);
  readonly selectedPermIds = signal<Set<number>>(new Set());

  ngOnInit(): void {
    this.roleService.getById(this.data.roleId).subscribe({
      next: (detail) => {
        this.selectedPermIds.set(new Set(detail.permissionIds ?? []));
        this.loadAllPerms();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  private loadAllPerms(): void {
    this.permService.getAll().subscribe({
      next: (perms) => {
        this.allPermissions.set(perms ?? []);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  togglePerm(id: number): void {
    const set = new Set(this.selectedPermIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.selectedPermIds.set(set);
  }

  save(): void {
    this.saving.set(true);
    this.error.set(null);
    this.roleService.assignPermissions(this.data.roleId, Array.from(this.selectedPermIds())).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.message ?? err?.error ?? 'Failed to assign permissions.');
        this.cdr.markForCheck();
      },
    });
  }
}
