import { listUsers, type UserRow } from "../repositories/user.repository";
import type { ListUserQuery } from "../schemas/list-user.schema";
import type { ListUsersOutput, UserView } from "../types/response-types";

function toView(row: UserRow): UserView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listUsersForAdmin(
  query: ListUserQuery,
): Promise<ListUsersOutput> {
  const { rows, total } = await listUsers(query);
  const totalPages = total === 0 ? 0 : Math.ceil(total / query.perPage);
  return {
    users: rows.map(toView),
    page: query.page,
    perPage: query.perPage,
    total,
    totalPages,
  };
}