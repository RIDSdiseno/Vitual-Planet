import type { SidebarNavItem } from "../../../shared/layout/Sidebar";
import { Home, BookOpen, Bot, CalendarDays } from "lucide-react";

export const studentNav: SidebarNavItem[] = [
  {
    to: "/estudiante",
    label: "Dashboard",
    icon: <Home size={18} />,
  },
  {
    to: "/estudiante/cursos",
    label: "Cursos",
    icon: <BookOpen size={18} />,
  },
  {
    to: "/estudiante/calendario",
    label: "Calendario",
    icon: <CalendarDays size={18} />,
  },
  {
    to: "/estudiante/tutor",
    label: "Tutor IA",
    icon: <Bot size={18} />,
  },
];