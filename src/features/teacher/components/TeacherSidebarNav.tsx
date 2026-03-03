import type { SidebarNavItem } from "../../../shared/layout/Sidebar";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Mail,
} from "lucide-react";

export const teacherNav: SidebarNavItem[] = [
  { to: "/profesor", label: "Resumen", icon: <LayoutDashboard size={18} /> },
  { to: "/profesor/cursos", label: "Cursos", icon: <BookOpen size={18} /> },
  { to: "/profesor/calendario", label: "Calendario", icon: <CalendarDays size={18} /> },
  { to: "/profesor/evaluaciones", label: "Evaluaciones", icon: <ClipboardCheck size={18} /> },
  { to: "/profesor/mensajes", label: "Mensajes", icon: <Mail size={18} /> },
];