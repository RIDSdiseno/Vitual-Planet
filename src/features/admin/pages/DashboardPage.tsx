import PageHeader from "../../../shared/layout/PageHeader";
import AdminDashboardCards from "../components/AdminDashboardCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumen"
        subtitle="Vista global multi-tenant (colegios y profesores particulares)."
        right={
          <button
            type="button"
            className="rounded-2xl bg-vp-primary px-4 py-2 text-sm font-medium text-white
                       hover:bg-vp-primary2 focus:outline-none focus:ring-4 focus:ring-vp-primary/10"
          >
            Exportar
          </button>
        }
      />

      <section className="rounded-3xl border border-vp-border bg-vp-panel shadow-soft">
        <div className="border-b border-vp-border px-4 py-4 sm:px-5">
          <h2 className="text-sm font-medium text-vp-muted">Indicadores</h2>
          <p className="mt-1 text-base font-semibold text-vp-text">
            Estado general del sistema
          </p>
        </div>

        <div className="p-4 sm:p-5">
          <AdminDashboardCards />
        </div>
      </section>
    </div>
  );
}