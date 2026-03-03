import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../../../shared/layout/PageHeader";
import type { Plan, Tenant, TenantStatus } from "../../../services/tenants";
import { tenantsGetById, tenantsUpsert } from "../../../services/tenants";
import { INVOICES_MOCK } from "../../../services/billing/billing.mock";

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

export default function TenantDetailPage() {
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    setTimeout(() => {
      setTenant(tenantsGetById(tenantId));
      setLoading(false);
    }, 120);
  }, [tenantId]);

  const invoices = useMemo(() => {
    if (!tenant) return [];
    return INVOICES_MOCK.filter((i) => i.tenantId === tenant.id);
  }, [tenant]);

  function updateTenant(patch: Partial<Tenant>) {
    if (!tenant) return;
    const next: Tenant = {
      ...tenant,
      ...patch,
      billing: patch.billing ? { ...tenant.billing, ...patch.billing } : tenant.billing,
      metrics: patch.metrics ? { ...tenant.metrics, ...patch.metrics } : tenant.metrics,
    };
    tenantsUpsert(next);
    setTenant(next);
  }

  function setStatus(nextStatus: TenantStatus) {
    updateTenant({ status: nextStatus });
  }

  function setPlan(nextPlan: Plan) {
    updateTenant({ plan: nextPlan });
  }

  if (loading) return <div className="text-sm text-vp-muted">Cargando...</div>;
  if (!tenant) return <div className="text-sm text-vp-muted">Tenant no encontrado.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={tenant.name}
        subtitle={`${tenant.type === "SCHOOL" ? "Colegio" : "Particular"} • ${tenant.city ?? "—"} • ${tenant.country ?? "—"}`}
        right={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
            <Link
              className="w-full sm:w-auto rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm hover:border-vp-primary/30"
              to="/admin/tenants"
            >
              Volver
            </Link>
          </div>
        }
      />

      {/* Acciones */}
      <section className="rounded-3xl border border-vp-border bg-vp-panel shadow-soft">
        <div className="border-b border-vp-border px-4 py-4 sm:px-5">
          <div className="text-sm font-semibold">Acciones</div>
          <div className="text-xs text-vp-muted">Cambios mock (sin APIs). Quedan reflejados en la UI.</div>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid gap-3 lg:grid-cols-3">
            <div className="rounded-2xl border border-vp-border bg-vp-soft/20 p-4">
              <div className="text-xs text-vp-muted">Estado actual</div>
              <div className="mt-2 text-sm font-semibold">
                <Badge text={tenant.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                  onClick={() => setStatus("ACTIVE")}
                >
                  Activar
                </button>
                <button
                  className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                  onClick={() => setStatus("SUSPENDED")}
                >
                  Suspender
                </button>
                <button
                  className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                  onClick={() => setStatus("PAST_DUE")}
                >
                  Marcar con deuda
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-vp-border bg-vp-soft/20 p-4">
              <div className="text-xs text-vp-muted">Plan</div>
              <div className="mt-2 text-sm font-semibold">
                <Badge text={tenant.plan} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                  onClick={() => setPlan("BASIC")}
                >
                  Basic
                </button>
                <button
                  className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                  onClick={() => setPlan("PRO")}
                >
                  Pro
                </button>
                <button
                  className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-xs hover:border-vp-primary/30"
                  onClick={() => setPlan("ENTERPRISE")}
                >
                  Enterprise
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-vp-border bg-vp-soft/20 p-4">
              <div className="text-xs text-vp-muted">Cobro mensual (MRR)</div>
              <div className="mt-2 text-lg font-semibold">{moneyCLP(tenant.billing.mrr)}</div>
              <div className="mt-1 text-xs text-vp-muted">Próxima factura: {tenant.billing.nextInvoiceDate}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-vp-border bg-vp-panel shadow-soft p-4 sm:p-5">
          <div className="text-sm text-vp-muted">Estado</div>
          <div className="mt-2 text-lg font-semibold"><Badge text={tenant.status} /></div>
          <div className="mt-2 text-xs text-vp-muted">Plan: {tenant.plan}</div>
          <div className="mt-1 text-xs text-vp-muted">Creado: {tenant.createdAt}</div>
        </div>

        <div className="rounded-3xl border border-vp-border bg-vp-panel shadow-soft p-4 sm:p-5">
          <div className="text-sm text-vp-muted">Contacto</div>
          <div className="mt-2 text-sm font-semibold">{tenant.ownerName}</div>
          <div className="text-xs text-vp-muted">{tenant.ownerEmail}</div>
        </div>

        <div className="rounded-3xl border border-vp-border bg-vp-panel shadow-soft p-4 sm:p-5">
          <div className="text-sm text-vp-muted">Métricas</div>
          <div className="mt-2 text-sm">Estudiantes: <b>{tenant.metrics.students}</b></div>
          <div className="text-sm">Profesores: <b>{tenant.metrics.teachers}</b></div>
          <div className="text-sm">Cursos: <b>{tenant.metrics.courses}</b></div>
        </div>
      </section>

      {/* Cobranza */}
      <section className="rounded-3xl border border-vp-border overflow-hidden bg-vp-panel shadow-soft">
        <div className="bg-vp-soft/40 px-4 py-3 text-sm font-semibold">Cobranza</div>
        <div className="overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="px-4 py-4 text-sm text-vp-muted">Sin facturas (mock).</div>
          ) : (
            <table className="min-w-[760px] w-full text-sm">
              <thead className="text-vp-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Factura</th>
                  <th className="px-4 py-3 text-left">Período</th>
                  <th className="px-4 py-3 text-left">Vence</th>
                  <th className="px-4 py-3 text-left">Monto</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-t border-vp-border">
                    <td className="px-4 py-3">{i.id}</td>
                    <td className="px-4 py-3">{i.period}</td>
                    <td className="px-4 py-3">{i.dueDate}</td>
                    <td className="px-4 py-3">{moneyCLP(i.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge text={i.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}