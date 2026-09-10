import { AppError } from "@/lib/errors";
import {
  findContactById,
  logContactPhoneReveal,
} from "../repositories/contact.repository";
import type { RevealContactPhoneInput } from "../schemas/reveal-contact-phone.schema";

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

export async function revealContactPhoneForUser(
  contactId: string,
  actor: ContactActor,
  input: RevealContactPhoneInput,
): Promise<{ phone: string }> {
  const contact = await findContactById(contactId);
  if (!contact) {
    throw new AppError("NOT_FOUND", { message: "Contact not found." });
  }

  const isOwner = contact.addedBy === actor.userId;
  if (actor.role !== "admin" && !isOwner) {
    await logContactPhoneReveal({
      contactId,
      userId: actor.userId,
      role: actor.role,
      reason: input.reason,
    });
  }

  return { phone: contact.phoneNumber };
}