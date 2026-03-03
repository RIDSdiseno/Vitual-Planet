import { useEffect, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import BillingFilters from "../components/billing/BillingFilters";
import BillingTable from "../components/billing/BillingTable";
import { billingRepoMock, type Invoice, type InvoiceStatus } from "../../../services/billing";

export default function BillingPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Invoice[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    billingRepoMock
      .list({ query, status, page, pageSize: 10 })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [query, status, page]);

  return (
    <div className="space-y-6">
      <PageHeader title="Cobranza" subtitle="Pagos pendientes, vencidos y pagados (mock)." />

      <BillingFilters
        query={query}
        status={status}
        onChangeQuery={(v) => { setPage(1); setQuery(v); }}
        onChangeStatus={(v) => { setPage(1); setStatus(v); }}
        total={total}
        loading={loading}
      />

      <BillingTable items={items} loading={loading} />

      <div className="flex items-center justify-end gap-2">
        <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <button className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={items.length < 10} onClick={() => setPage((p) => p + 1)}>
          Siguiente
        </button>
      </div>
    </div>
  );
}
