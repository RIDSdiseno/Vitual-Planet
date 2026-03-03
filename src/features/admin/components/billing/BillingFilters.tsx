import type { InvoiceStatus } from "../../../../services/billing";

export default function BillingFilters({
  query,
  status,
  onChangeQuery,
  onChangeStatus,
  total,
  loading,
}: {
  query: string;
  status: InvoiceStatus | "";
  onChangeQuery: (v: string) => void;
  onChangeStatus: (v: InvoiceStatus | "") => void;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        placeholder="Buscar tenant o factura..."
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />

      <select
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={status}
        onChange={(e) => onChangeStatus(e.target.value as any)}
      >
        <option value="">Todos</option>
        <option value="PENDING">Pendiente</option>
        <option value="OVERDUE">Vencido</option>
        <option value="PAID">Pagado</option>
      </select>

      <div className="text-sm text-vp-muted flex items-center">
        {loading ? "Cargando..." : `${total} facturas`}
      </div>
    </div>
  );
}
