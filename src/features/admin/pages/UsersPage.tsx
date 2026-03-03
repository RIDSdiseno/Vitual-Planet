import { useEffect, useState } from "react";
import PageHeader from "../../../shared/layout/PageHeader";
import UsersFilters from "../components/UsersFilters";
import UsersTable from "../components/UsersTable";
import UsersModal from "../components/UsersModal";
import { usersRepoMock, type Role, type User } from "../../../services/users";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<User[]>([]);

  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    usersRepoMock
      .list({ query, role, page, pageSize: 10 })
      .then((res) => {
        if (!alive) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [query, role, page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        subtitle="Administración de usuarios y roles."
        right={
          <button
            className="rounded-xl bg-vp-primary px-4 py-2 text-sm font-medium text-white hover:bg-vp-primary2"
            onClick={() => setOpenCreate(true)}
          >
            Crear usuario
          </button>
        }
      />

      <UsersFilters
        query={query}
        role={role}
        onChangeQuery={(v) => {
          setPage(1);
          setQuery(v);
        }}
        onChangeRole={(v) => {
          setPage(1);
          setRole(v);
        }}
        total={total}
        loading={loading}
      />

      <UsersTable items={items} loading={loading} />

      <div className="flex items-center justify-end gap-2">
        <button
          className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <button
          className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm disabled:opacity-50"
          disabled={items.length < 10}
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>

      <UsersModal open={openCreate} onClose={() => setOpenCreate(false)} />
    </div>
  );
}
