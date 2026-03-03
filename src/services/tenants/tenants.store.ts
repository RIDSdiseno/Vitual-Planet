import type { Tenant } from "./tenants.types";
import { TENANTS_MOCK } from "./tenants.mock";

let tenants: Tenant[] = [...TENANTS_MOCK];

export function tenantsGetAll(): Tenant[] {
  return tenants;
}

export function tenantsSetAll(next: Tenant[]) {
  tenants = next;
}

export function tenantsUpsert(t: Tenant) {
  const idx = tenants.findIndex((x) => x.id === t.id);
  if (idx >= 0) {
    tenants = tenants.map((x) => (x.id === t.id ? t : x));
  } else {
    tenants = [t, ...tenants];
  }
}

export function tenantsGetById(id: string): Tenant | null {
  return tenants.find((t) => t.id === id) ?? null;
}