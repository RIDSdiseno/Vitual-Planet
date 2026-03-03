import type { User } from "../../../services/users";

function Badge({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-vp-border bg-vp-bg/30 px-2 py-0.5 text-xs">
      {text}
    </span>
  );
}

export default function UsersTable({
  items,
  loading,
}: {
  items: User[];
  loading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-vp-border">
      <table className="w-full text-sm">
        <thead className="bg-vp-bg/50 text-vp-muted">
          <tr>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Rol</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-vp-panel">
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-vp-muted">
                Cargando...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-vp-muted">
                Sin resultados.
              </td>
            </tr>
          ) : (
            items.map((u) => (
              <tr key={u.id} className="border-t border-vp-border">
                <td className="px-4 py-3">{u.nombre}</td>
                <td className="px-4 py-3 text-vp-muted">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge text={u.role} />
                </td>
                <td className="px-4 py-3">
                  <Badge text={u.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
