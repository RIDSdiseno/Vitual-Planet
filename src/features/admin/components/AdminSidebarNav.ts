import type { SidebarNavItem } from "../../../shared/layout/Sidebar";

export const adminNav: SidebarNavItem[] = [
  { to: "/admin", label: "Resumen" },
  { to: "/admin/tenants", label: "Colegios / Tenants" },
  { to: "/admin/cobranza", label: "Cobranza" },
  { to: "/admin/usuarios", label: "Usuarios" },
];
