import { NavLink } from "react-router-dom";
import { ROUTES } from "../../app/routes";
import { useAuth } from "../../core/auth/useAuth";

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-2xl px-3 py-2 text-sm border transition whitespace-nowrap",
          isActive
            ? "bg-vp-soft border-vp-primary/30 text-vp-text"
            : "bg-white border-vp-border text-vp-muted hover:text-vp-text hover:border-vp-primary/30",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export default function Topbar({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const { user, loginAs, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-vp-border bg-vp-panel/85 backdrop-blur">
      <div className="px-3 py-3 sm:px-4 md:px-6">
        {/* Row 1 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              className="lg:hidden rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm hover:border-vp-primary/30"
              onClick={onOpenMenu}
              aria-label="Abrir menú"
            >
              Menú
            </button>

            <div className="min-w-[140px]">
              <div className="text-xs text-vp-muted">Panel</div>
              <div className="text-lg font-semibold">Virtual Planet</div>
            </div>
          </div>

          {/* Tabs: hidden on small, visible from md */}
          <div className="hidden md:flex items-center gap-2">
            <Tab to={ROUTES.admin} label="Admin" />
            <Tab to={ROUTES.teacher} label="Profesor" />
            <Tab to={ROUTES.student} label="Estudiante" />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
              value={user?.role ?? "ADMIN"}
              onChange={(e) => loginAs(e.target.value as any)}
              title="Cambiar rol (demo)"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="PROFESOR">PROFESOR</option>
              <option value="ESTUDIANTE">ESTUDIANTE</option>
            </select>

            <button
              className="rounded-2xl border border-vp-border bg-white px-3 py-2 text-sm text-vp-muted hover:text-vp-text hover:border-vp-primary/30"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Row 2 (wrap): search + user + tabs on mobile */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex-1 min-w-[220px]">
            <input
              className="w-full rounded-2xl border border-vp-border bg-white px-4 py-2 text-sm outline-none focus:border-vp-primary focus:ring-4 focus:ring-vp-primary/10"
              placeholder="Buscar..."
            />
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-vp-border bg-white px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-vp-soft border border-vp-border" />
            <div className="leading-tight">
              <div className="text-sm font-semibold">{user?.nombre ?? "Invitado"}</div>
              <div className="text-xs text-vp-muted">{user?.role ?? "—"}</div>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex w-full gap-2 md:hidden">
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1">
              <Tab to={ROUTES.admin} label="Admin" />
              <Tab to={ROUTES.teacher} label="Profesor" />
              <Tab to={ROUTES.student} label="Estudiante" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}