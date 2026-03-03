import type { Invoice, InvoiceStatus, Paginated } from "./billing.types";

export type ListInvoicesParams = {
  query?: string;
  status?: InvoiceStatus | "";
  page?: number;
  pageSize?: number;
};

export interface BillingRepo {
  list(params: ListInvoicesParams): Promise<Paginated<Invoice>>;
}
