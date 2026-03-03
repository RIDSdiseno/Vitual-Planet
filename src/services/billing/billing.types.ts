export type InvoiceStatus = "PAID" | "PENDING" | "OVERDUE";

export type Invoice = {
  id: string;
  tenantId: string;
  tenantName: string;

  amount: number;
  currency: "CLP" | "USD";

  period: string; // "2026-02"
  dueDate: string; // YYYY-MM-DD
  status: InvoiceStatus;
  paidAt?: string | null;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
