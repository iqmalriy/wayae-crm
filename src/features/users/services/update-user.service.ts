import { UserAlreadyExistsError, UserNotFoundError } from "../api-error/errors";
import {
  findUserByEmail,
  findUserById,
  updateUser,
  type UserRow,
} from "../repositories/user.repository";
import type { UpdateUserInput } from "../schemas/update-user.schema";
import type { UpdateUserOutput, UserView } from "../types/response-types";

function toView(row: UserRow): UserView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function updateUserForAdmin(
  id: string,
  input: UpdateUserInput,
): Promise<UpdateUserOutput> {
  if (!(await findUserById(id))) throw new UserNotFoundError();

  if (input.email) {
    const existing = await findUserByEmail(input.email);
    if (existing && existing.id !== id) throw new UserAlreadyExistsError();
  }

  const row = await updateUser(id, input);
  if (!row) throw new UserNotFoundError();

  return { user: toView(row) };
}