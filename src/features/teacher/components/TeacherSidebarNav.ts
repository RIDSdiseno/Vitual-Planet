// src/features/teacher/components/TeacherSidebarNav.ts
import type { SidebarNavItem } from "../../../shared/layout/Sidebar";

export const teacherNav: SidebarNavItem[] = [
  { to: "/profesor", label: "Resumen" },
  { to: "/profesor/cursos", label: "Cursos" },
  { to: "/profesor/calendario", label: "Calendario" },
  { to: "/profesor/evaluaciones", label: "Evaluaciones" },
  { to: "/profesor/mensajes", label: "Mensajes" },
];