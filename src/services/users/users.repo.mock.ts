import type { UsersRepo } from "./users.repo";
import type { Paginated, User } from "./users.types";
import { USERS_MOCK } from "./users.mock";

function includes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.toLowerCase());
}

export const usersRepoMock: UsersRepo = {
  async list(params) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;
    const q = (params.query ?? "").trim();
    const role = params.role ?? "";

    let rows = [...USERS_MOCK];

    if (role) rows = rows.filter((u) => u.role === role);

    if (q) {
      rows = rows.filter((u) => includes(u.nombre, q) || includes(u.email, q));
    }

    const total = rows.length;
    const start = (page - 1) * pageSize;
    const items = rows.slice(start, start + pageSize);

    await new Promise((r) => setTimeout(r, 250));

    const resp: Paginated<User> = { items, page, pageSize, total };
    return resp;
  },
};
