import type { User } from "./users.types";

export const USERS_MOCK: User[] = [
  { id: "u1", nombre: "Carlos Molina", email: "carlos@virtualplanet.co", role: "ADMIN", status: "ACTIVO", createdAt: "2026-02-10" },
  { id: "u2", nombre: "Constanza Arenas", email: "constanza@rids.cl", role: "PROFESOR", status: "ACTIVO", createdAt: "2026-02-12" },
  { id: "u3", nombre: "Ignacio Gonzalez", email: "ignacio@rids.cl", role: "ADMIN", status: "ACTIVO", createdAt: "2026-02-12" },
  { id: "u4", nombre: "Andrea Pérez", email: "andrea@colegio.co", role: "ESTUDIANTE", status: "BLOQUEADO", createdAt: "2026-02-15" },
  { id: "u5", nombre: "Juan Torres", email: "juan@colegio.co", role: "ESTUDIANTE", status: "ACTIVO", createdAt: "2026-02-15" },
];
