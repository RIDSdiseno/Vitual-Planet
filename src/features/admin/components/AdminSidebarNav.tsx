import type { SidebarNavItem } from "../../../shared/layout/Sidebar";
import { Home, Building2, CreditCard, Users } from "lucide-react";

export const adminNav: SidebarNavItem[] = [
  {
    to: "/admin",
    label: "Resumen",
    icon: <Home size={18} />,
  },
  {
    to: "/admin/tenants",
    label: "Colegios / Tenants",
    icon: <Building2 size={18} />,
  },
  {
    to: "/admin/cobranza",
    label: "Cobranza",
    icon: <CreditCard size={18} />,
  },
  {
    to: "/admin/usuarios",
    label: "Usuarios",
    icon: <Users size={18} />,
  },
];