import type { Invoice } from "./billing.types";

export const INVOICES_MOCK: Invoice[] = [
  { id: "inv_1", tenantId: "t_school_2", tenantName: "Liceo Norte", amount: 99000, currency: "CLP", period: "2026-02", dueDate: "2026-02-15", status: "OVERDUE", paidAt: null },
  { id: "inv_2", tenantId: "t_school_1", tenantName: "Colegio San Martín", amount: 189000, currency: "CLP", period: "2026-02", dueDate: "2026-02-05", status: "PAID", paidAt: "2026-02-03" },
  { id: "inv_3", tenantId: "t_solo_1", tenantName: "Profesor Particular - Camila Díaz", amount: 19900, currency: "CLP", period: "2026-02", dueDate: "2026-03-01", status: "PENDING", paidAt: null },
  { id: "inv_4", tenantId: "t_school_3", tenantName: "Colegio Santa Ana", amount: 189000, currency: "CLP", period: "2026-02", dueDate: "2026-02-10", status: "OVERDUE", paidAt: null },
];
