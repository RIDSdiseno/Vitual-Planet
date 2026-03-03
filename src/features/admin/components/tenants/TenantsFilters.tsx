import type { Plan, TenantStatus, TenantType } from "../../../../services/tenants";

export default function TenantsFilters({
  query, type, status, plan,
  onChangeQuery, onChangeType, onChangeStatus, onChangePlan,
  total, loading,
}: {
  query: string;
  type: TenantType | "";
  status: TenantStatus | "";
  plan: Plan | "";
  onChangeQuery: (v: string) => void;
  onChangeType: (v: TenantType | "") => void;
  onChangeStatus: (v: TenantStatus | "") => void;
  onChangePlan: (v: Plan | "") => void;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      <input
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        placeholder="Buscar tenant / dueño / email..."
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />

      <select className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={type} onChange={(e) => onChangeType(e.target.value as any)}>
        <option value="">Tipo</option>
        <option value="SCHOOL">Colegio</option>
        <option value="SOLO_TEACHER">Particular</option>
      </select>

      <select className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={status} onChange={(e) => onChangeStatus(e.target.value as any)}>
        <option value="">Estado</option>
        <option value="ACTIVE">Activo</option>
        <option value="TRIAL">Trial</option>
        <option value="PAST_DUE">Con deuda</option>
        <option value="SUSPENDED">Suspendido</option>
      </select>

      <select className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={plan} onChange={(e) => onChangePlan(e.target.value as any)}>
        <option value="">Plan</option>
        <option value="BASIC">Basic</option>
        <option value="PRO">Pro</option>
        <option value="ENTERPRISE">Enterprise</option>
      </select>

      <div className="text-sm text-vp-muted flex items-center">
        {loading ? "Cargando..." : `${total} tenants`}
      </div>
    </div>
  );
}
