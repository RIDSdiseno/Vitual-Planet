import type { TenantsRepo } from "./tenants.repo";
import type { Paginated, Tenant } from "./tenants.types";
import { TENANTS_MOCK } from "./tenants.mock";

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export const tenantsRepoMock: TenantsRepo = {
  async list(params) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const q = (params.query ?? "").trim();
    const type = params.type ?? "";
    const status = params.status ?? "";
    const plan = params.plan ?? "";

    let rows = [...TENANTS_MOCK];

    if (type) rows = rows.filter((t) => t.type === type);
    if (status) rows = rows.filter((t) => t.status === status);
    if (plan) rows = rows.filter((t) => t.plan === plan);

    if (q) {
      rows = rows.filter(
        (t) =>
          includes(t.name, q) ||
          includes(t.ownerName, q) ||
          includes(t.ownerEmail, q)
      );
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    await new Promise((r) => setTimeout(r, 250));

    const resp: Paginated<Tenant> = { items, page, pageSize, total };
    return resp;
  },

  async getById(id) {
    await new Promise((r) => setTimeout(r, 150));
    return TENANTS_MOCK.find((t) => t.id === id) ?? null;
  },
};
