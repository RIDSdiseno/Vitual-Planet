export type UserRole = "ADMIN" | "PROFESOR" | "ESTUDIANTE";

export type AuthUser = {
  id: string;
  nombre: string;
  email?: string;
  role: UserRole;

  // multi-tenant: cuando sea Admin de colegio, esto sirve
  tenantId?: string | null;
};
