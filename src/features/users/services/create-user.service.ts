import { UserAlreadyExistsError } from "../api-error/errors";
import {
  createUser,
  findUserByEmail,
  type UserRow,
} from "../repositories/user.repository";
import type { CreateUserInput } from "../schemas/create-user.schema";
import type { CreateUserOutput, UserView } from "../types/response-types";

function toView(row: UserRow): UserView {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createUserForAdmin(
  input: CreateUserInput,
): Promise<CreateUserOutput> {
  if (await findUserByEmail(input.email)) throw new UserAlreadyExistsError();
  const row = await createUser(input);
  return { user: toView(row) };
}