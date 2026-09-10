import { UserNotFoundError } from "@/features/users/api-error/errors";
import { findUserById } from "@/features/users/repositories/user.repository";
import { WaAccountConflictError } from "../api-error/errors";
import { generateBearerToken } from "../lib/token-helper";
import {
  createWaAccount,
  findActiveByUserAndPhone,
  type WaAccountRow,
} from "../repositories/wa-account.repository";
import type { CreateWaAccountInput } from "../schemas/create-wa-account.schema";
import type { CreateWaAccountOutput, WaAccountView } from "../types/response-types";

function toView(row: WaAccountRow): WaAccountView {
  return {
    id: row.id,
    userId: row.userId,
    phone: row.phone,
    label: row.label,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createWaAccountForAdmin(
  input: CreateWaAccountInput,
): Promise<CreateWaAccountOutput> {
  if (!(await findUserById(input.userId))) throw new UserNotFoundError();
  if (await findActiveByUserAndPhone(input.userId, input.phone)) {
    throw new WaAccountConflictError();
  }
  const { token, tokenHash } = await generateBearerToken();
  const row = await createWaAccount({ ...input, tokenHash });
  return { waAccount: toView(row), token };
}