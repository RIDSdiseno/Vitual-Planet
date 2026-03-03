import type { Paginated, Role, User } from "./users.types";

export type ListUsersParams = {
  query?: string;
  role?: Role | "";
  page?: number;
  pageSize?: number;
};

export interface UsersRepo {
  list(params: ListUsersParams): Promise<Paginated<User>>;
}
