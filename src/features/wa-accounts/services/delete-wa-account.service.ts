import { WaAccountNotFoundError } from "../api-error/errors";
import { softDeleteWaAccount } from "../repositories/wa-account.repository";

export async function deleteWaAccountForAdmin(id: string): Promise<{ deleted: boolean }> {
  const deleted = await softDeleteWaAccount(id);
  if (!deleted) throw new WaAccountNotFoundError();
  return { deleted: true };
}