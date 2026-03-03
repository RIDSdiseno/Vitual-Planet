export type Role = "ADMIN" | "PROFESOR" | "ESTUDIANTE";
export type UserStatus = "ACTIVO" | "BLOQUEADO";

export type User = {
  id: string;
  nombre: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
