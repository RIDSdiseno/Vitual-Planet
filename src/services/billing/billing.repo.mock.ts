import type { BillingRepo } from "./billing.repo";
import type { Invoice, Paginated } from "./billing.types";
import { INVOICES_MOCK } from "./billing.mock";

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export const billingRepoMock: BillingRepo = {
  async list(params) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const q = (params.query ?? "").trim();
    const status = params.status ?? "";

    let rows = [...INVOICES_MOCK];

    if (status) rows = rows.filter((i) => i.status === status);

    if (q) {
      rows = rows.filter(
        (i) => includes(i.tenantName, q) || includes(i.id, q)
      );
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    await new Promise((r) => setTimeout(r, 250));

    const resp: Paginated<Invoice> = { items, page, pageSize, total };
    return resp;
  },
};
