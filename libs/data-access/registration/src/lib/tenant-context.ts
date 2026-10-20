import { InjectionToken } from '@angular/core';

export interface TenantContext {
  tenantId: string;
  tenantHeaderId: string | null;
}

export type TenantContextFactory = () => TenantContext;

const DEFAULT_CONTEXT: TenantContext = {
  tenantId: 'default',
  tenantHeaderId: null,
};

export const TENANT_CONTEXT = new InjectionToken<TenantContextFactory>('TENANT_CONTEXT', {
  factory: () => () => DEFAULT_CONTEXT,
});