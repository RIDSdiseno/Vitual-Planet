import type { Role } from "../../../services/users";

export default function UsersFilters({
  query,
  role,
  onChangeQuery,
  onChangeRole,
  total,
  loading,
}: {
  query: string;
  role: Role | "";
  onChangeQuery: (v: string) => void;
  onChangeRole: (v: Role | "") => void;
  total: number;
  loading: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <input
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        placeholder="Buscar por nombre o email..."
        value={query}
        onChange={(e) => onChangeQuery(e.target.value)}
      />

      <select
        className="rounded-xl border border-vp-border bg-vp-bg/30 px-3 py-2 text-sm outline-none focus:border-vp-primary"
        value={role}
        onChange={(e) => onChangeRole(e.target.value as Role | "")}
      >
        <option value="">Todos los roles</option>
        <option value="ADMIN">Admin</option>
        <option value="PROFESOR">Profesor</option>
        <option value="ESTUDIANTE">Estudiante</option>
      </select>

      <div className="text-sm text-vp-muted flex items-center">
        {loading ? "Cargando..." : `${total} usuarios`}
      </div>
    </div>
  );
}
