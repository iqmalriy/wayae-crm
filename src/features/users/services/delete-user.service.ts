import { UserNotFoundError } from "../api-error/errors";
import { deleteUser } from "../repositories/user.repository";

export async function deleteUserForAdmin(id: string): Promise<{ deleted: boolean }> {
  const deleted = await deleteUser(id);
  if (!deleted) throw new UserNotFoundError();
  return { deleted: true };
}