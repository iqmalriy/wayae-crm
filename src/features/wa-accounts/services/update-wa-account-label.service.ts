import { WaAccountNotFoundError } from "../api-error/errors";
import {
  findWaAccountById,
  updateWaAccountLabel,
  type WaAccountRow,
} from "../repositories/wa-account.repository";
import type { UpdateWaAccountLabelInput } from "../schemas/update-wa-account.schema";
import type { UpdateWaAccountLabelOutput, WaAccountView } from "../types/response-types";

function toView(row: WaAccountRow): WaAccountView {
  return {
    id: row.id,
    userId: row.userId,
    phone: row.phone,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function updateWaAccountLabelForAdmin(
  id: string,
  input: UpdateWaAccountLabelInput,
): Promise<UpdateWaAccountLabelOutput> {
  if (!(await findWaAccountById(id))) throw new WaAccountNotFoundError();

  const row = await updateWaAccountLabel(id, input.label);
  if (!row) throw new WaAccountNotFoundError();

  return { waAccount: toView(row) };
}