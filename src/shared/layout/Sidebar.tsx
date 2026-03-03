import React from "react";
import { NavLink } from "react-router-dom";
import { Lock } from "lucide-react";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  disabledHint?: string;
};

function linkClass(isActive: boolean) {
  return [
    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition",
    "border",
    isActive
      ? "bg-vp-primary/10 border-vp-primary/30 text-vp-text"
      : "border-transparent text-vp-muted hover:text-vp-text hover:bg-vp-bg/40",
  ].join(" ");
}

function disabledClass() {
  return [
    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm",
    "border border-transparent",
    "text-vp-muted/70 bg-transparent opacity-60 cursor-not-allowed",
  ].join(" ");
}

export default function Sidebar({
  brand,
  nav,
}: {
  brand: { title: string; subtitle: string };
  nav: SidebarNavItem[];
}) {
  return (
    <aside className="hidden w-[290px] shrink-0 border-r border-vp-border bg-vp-panel md:flex md:flex-col">
      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-vp-bg/40 border border-vp-border">
            <span className="text-vp-primary font-extrabold tracking-wide">
              VP
            </span>
          </div>

          <div className="min-w-0 leading-tight">
            <div className="truncate font-semibold text-vp-text">
              {brand.title}
            </div>
            <div className="truncate text-xs text-vp-muted">
              {brand.subtitle}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4">
        <div className="mb-3 px-2 text-xs font-semibold text-vp-muted tracking-wide">
          MENÚ
        </div>

        <div className="space-y-1">
          {nav.map((item) => {
            if (item.disabled) {
              return (
                <div
                  key={item.to}
                  className={disabledClass()}
                  title={item.disabledHint ?? "Bloqueado"}
                  aria-disabled="true"
                >
                  {/* Icon container */}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-vp-border bg-vp-bg/30 text-vp-muted">
                    {item.icon ? item.icon : <Lock size={18} />}
                  </span>

                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>

                  <span className="text-vp-muted">
                    <Lock size={14} />
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) => linkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    {/* Icon container (si no hay icon, mostramos dot) */}
                    <span
                      className={[
                        "grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition",
                        isActive
                          ? "border-vp-primary/40 bg-vp-primary/15 text-vp-primary"
                          : "border-vp-border bg-vp-bg/30 text-vp-muted group-hover:border-vp-primary/30 group-hover:bg-vp-primary/10",
                      ].join(" ")}
                    >
                      {item.icon ? (
                        item.icon
                      ) : (
                        <span
                          className={[
                            "h-2.5 w-2.5 rounded-full border transition",
                            isActive
                              ? "border-vp-primary/50 bg-vp-primary/30"
                              : "border-vp-border bg-vp-bg/30 group-hover:border-vp-primary/40 group-hover:bg-vp-primary/20",
                          ].join(" ")}
                        />
                      )}
                    </span>

                    <span className="min-w-0 flex-1 truncate">{item.label}</span>

                    {/* indicador activo */}
                    <span
                      className={[
                        "h-2 w-2 rounded-full transition",
                        isActive ? "bg-vp-primary" : "bg-transparent",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Footer status */}
      <div className="p-4">
        <div className="rounded-3xl border border-vp-border bg-vp-bg/30 p-4">
          <div className="text-sm font-semibold text-vp-text">Estado</div>
          <div className="mt-1 text-xs text-vp-muted">Maqueta • sin APIs</div>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-vp-border bg-vp-bg/40">
            <div className="h-full w-[45%] bg-vp-primary" />
          </div>
        </div>
      </div>
    </aside>
  );
}