import { Link } from "react-router-dom";
import type { Invoice } from "../../../../services/billing";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

function moneyCLP(n: number) {
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(n);
  } catch {
    return String(n);
  }
}

export default function BillingTable({ items, loading }: { items: Invoice[]; loading: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-vp-border">
      <table className="w-full text-sm">
        <thead className="bg-vp-bg/50 text-vp-muted">
          <tr>
            <th className="px-4 py-3 text-left">Tenant</th>
            <th className="px-4 py-3 text-left">Factura</th>
            <th className="px-4 py-3 text-left">Período</th>
            <th className="px-4 py-3 text-left">Vence</th>
            <th className="px-4 py-3 text-left">Monto</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-vp-panel">
          {loading ? (
            <tr><td colSpan={6} className="px-4 py-6 text-vp-muted">Cargando...</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={6} className="px-4 py-6 text-vp-muted">Sin resultados.</td></tr>
          ) : (
            items.map((i) => (
              <tr key={i.id} className="border-t border-vp-border">
                <td className="px-4 py-3">
                  <Link className="hover:underline" to={`/admin/tenants/${i.tenantId}`}>
                    {i.tenantName}
                  </Link>
                </td>
                <td className="px-4 py-3">{i.id}</td>
                <td className="px-4 py-3">{i.period}</td>
                <td className="px-4 py-3">{i.dueDate}</td>
                <td className="px-4 py-3">{moneyCLP(i.amount)}</td>
                <td className="px-4 py-3"><Badge text={i.status} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
