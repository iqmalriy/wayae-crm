import { AppError } from "@/lib/errors";
import {
  findContactById,
  listContactPhoneReveals,
} from "../repositories/contact.repository";
import type {
  ListPhoneRevealsOutput,
  PhoneRevealView,
} from "../types/response-types";

export async function listContactPhoneRevealsForUser(
  contactId: string,
): Promise<ListPhoneRevealsOutput> {
  const contact = await findContactById(contactId);
  if (!contact) {
    throw new AppError("NOT_FOUND", { message: "Contact not found." });
  }

  const rows = await listContactPhoneReveals(contactId);
  const reveals: PhoneRevealView[] = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    userName: row.userName,
    role: row.role,
    reason: row.reason,
    revealedAt: row.revealedAt.toISOString(),
  }));

  return { reveals };
}