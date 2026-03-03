import { TENANTS_MOCK } from "../../../services/tenants/tenants.mock";
import { INVOICES_MOCK } from "../../../services/billing/billing.mock";

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
  } catch {
    return String(n);
  }
}

export default function AdminDashboardCards() {
  const tenants = TENANTS_MOCK;
  const invoices = INVOICES_MOCK;

  const active = tenants.filter((t) => t.status === "ACTIVE").length;
  const trial = tenants.filter((t) => t.status === "TRIAL").length;
  const pastDue = tenants.filter((t) => t.status === "PAST_DUE").length;
  const suspended = tenants.filter((t) => t.status === "SUSPENDED").length;

  const overdue = invoices.filter((i) => i.status === "OVERDUE").length;
  const pending = invoices.filter((i) => i.status === "PENDING").length;

  const mrr = tenants.reduce((acc, t) => acc + (t.status === "ACTIVE" ? t.billing.mrr : 0), 0);

  const cards = [
    { t: "Tenants activos", v: String(active), s: `Trial: ${trial} • Suspendidos: ${suspended}` },
    { t: "Pagos vencidos", v: String(overdue), s: `Pendientes: ${pending}` },
    { t: "Tenants con deuda", v: String(pastDue), s: "Revisar cobranza" },
    { t: "MRR (mock)", v: moneyCLP(mrr), s: "Solo activos" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((k) => (
        <div key={k.t} className="rounded-2xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm text-vp-muted">{k.t}</div>
          <div className="mt-2 text-2xl font-semibold">{k.v}</div>
          <div className="mt-2 text-xs text-vp-muted">{k.s}</div>
        </div>
      ))}
    </div>
  );
}
