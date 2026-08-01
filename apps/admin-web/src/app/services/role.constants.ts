export const RESERVED_ROLE_NAMES: readonly string[] = [
  'TenantAdmin',
  'PlatformAdmin',
  'SuperAdmin',
  'User',
];

export const CROSS_TENANT_ROLE_NAMES: readonly string[] = ['PlatformAdmin', 'SuperAdmin'];

export const MEMBER_ROLE_NAME = 'User';

export const TENANT_ADMIN_ROLE_NAME = 'TenantAdmin';

export function isReservedRoleName(name: string | undefined): boolean {
  return RESERVED_ROLE_NAMES.includes(name ?? '');
}
