import { Link } from "react-router-dom";
import type { Tenant } from "../../../../services/tenants";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-soft/30 px-2 py-0.5 text-xs">
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

export default function TenantsTable({
  items,
  loading,
  onEdit,
}: {
  items: Tenant[];
  loading: boolean;
  onEdit: (t: Tenant) => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-vp-border bg-vp-panel">
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-vp-soft/40 text-vp-muted">
            <tr>
              <th className="px-4 py-3 text-left">Tenant</th>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Plan</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">MRR</th>
              <th className="px-4 py-3 text-left">Renovación</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-vp-panel">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-vp-muted">
                  Cargando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-vp-muted">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              items.map((t) => (
                <tr key={t.id} className="border-t border-vp-border hover:bg-vp-soft/20 transition">
                  <td className="px-4 py-3">
                    <Link className="font-medium hover:underline" to={`/admin/tenants/${t.id}`}>
                      {t.name}
                    </Link>
                    <div className="text-xs text-vp-muted">
                      {t.ownerName} • {t.ownerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge text={t.type === "SCHOOL" ? "COLEGIO" : "PARTICULAR"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge text={t.plan} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge text={t.status} />
                  </td>
                  <td className="px-4 py-3">{moneyCLP(t.billing.mrr)}</td>
                  <td className="px-4 py-3">{t.billing.nextInvoiceDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                        to={`/admin/tenants/${t.id}`}
                      >
                        Ver
                      </Link>
                      <button
                        className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                        onClick={() => onEdit(t)}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}