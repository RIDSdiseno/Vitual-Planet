import type { Paginated, Plan, Tenant, TenantStatus, TenantType } from "./tenants.types";

export type ListTenantsParams = {
  query?: string;
  type?: TenantType | "";
  status?: TenantStatus | "";
  plan?: Plan | "";
  page?: number;
  pageSize?: number;
};

export interface TenantsRepo {
  list(params: ListTenantsParams): Promise<Paginated<Tenant>>;
  getById(id: string): Promise<Tenant | null>;
}
