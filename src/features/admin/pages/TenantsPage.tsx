import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import TenantsFilters from "../components/tenants/TenantsFilters";
import TenantsTable from "../components/tenants/TenantsTable";
import TenantModal from "../components/tenants/TenantModal";
import type { Plan, Tenant, TenantStatus, TenantType } from "../../../services/tenants";
import { tenantsGetAll, tenantsUpsert } from "../../../services/tenants";

export default function TenantsPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<TenantType | "">("");
  const [status, setStatus] = useState<TenantStatus | "">("");
  const [plan, setPlan] = useState<Plan | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<Tenant[]>([]);

  // ✅ para forzar refresh al crear/editar sin depender de trucos con query
  const [refreshKey, setRefreshKey] = useState(0);

  const localRepo = useMemo(() => {
    return {
      list: async (params: any) => {
        const page = params.page ?? 1;
        const pageSize = params.pageSize ?? 10;
        const q = (params.query ?? "").trim();
        const type = params.type ?? "";
        const status = params.status ?? "";
        const plan = params.plan ?? "";

        let rows = [...tenantsGetAll()];

        if (type) rows = rows.filter((t) => t.type === type);
        if (status) rows = rows.filter((t) => t.status === status);
        if (plan) rows = rows.filter((t) => t.plan === plan);

        if (q) {
          const includes = (hay: string, needle: string) =>
            hay.toLowerCase().includes(needle.toLowerCase());

          rows = rows.filter(
            (t) =>
              includes(t.name, q) ||
              includes(t.ownerName, q) ||
              includes(t.ownerEmail, q)
          );
        }

        const total = rows.length;
        const start = (page - 1) * pageSize;
        const items = rows.slice(start, start + pageSize);

        await new Promise((r) => setTimeout(r, 150));
        return { items, page, pageSize, total };
      },
    };
  }, []);

  // modal state
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Tenant | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    localRepo
      .list({ query, type, status, plan, page, pageSize: 10 })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query, type, status, plan, page, localRepo, refreshKey]);

  function handleCreate(t: Tenant) {
    tenantsUpsert(t);
    setPage(1);
    setRefreshKey((k) => k + 1);
  }

  function handleEdit(t: Tenant) {
    tenantsUpsert(t);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Colegios / Tenants"
        subtitle="Lista de tenants inscritos (colegios y particulares)."
        right={
          <button
            className="w-full sm:w-auto rounded-2xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2 focus:outline-none focus:ring-4 focus:ring-vp-primary/10"
            onClick={() => setOpenCreate(true)}
          >
            Crear tenant
          </button>
        }
      />

      <div className="rounded-3xl border border-vp-border bg-vp-soft/20 p-3 sm:p-4">
        <TenantsFilters
          query={query}
          type={type}
          status={status}
          plan={plan}
          onChangeQuery={(v) => {
            setPage(1);
            setQuery(v);
          }}
          onChangeType={(v) => {
            setPage(1);
            setType(v);
          }}
          onChangeStatus={(v) => {
            setPage(1);
            setStatus(v);
          }}
          onChangePlan={(v) => {
            setPage(1);
            setPlan(v);
          }}
          total={total}
          loading={loading}
        />
      </div>

      <TenantsTable
        items={items}
        loading={loading}
        onEdit={(t) => {
          setEditing(t);
          setOpenEdit(true);
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <button
          className="w-full sm:w-auto rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm disabled:opacity-50 hover:border-vp-primary/30"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <button
          className="w-full sm:w-auto rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm disabled:opacity-50 hover:border-vp-primary/30"
          disabled={items.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>

      {/* Create */}
      <TenantModal
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSubmit={handleCreate}
      />

      {/* Edit */}
      <TenantModal
        open={openEdit}
        mode="edit"
        initial={editing}
        onClose={() => {
          setOpenEdit(false);
          setEditing(null);
        }}
        onSubmit={handleEdit}
      />
    </div>
  );
}