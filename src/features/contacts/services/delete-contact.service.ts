import { AppError } from "@/lib/errors";
import {
  findContactById,
  softDeleteContact,
} from "../repositories/contact.repository";

export interface ContactActor {
  userId: string;
  role: "admin" | "staff";
}

export async function softDeleteContactForUser(
  id: string,
  actor: ContactActor,
): Promise<{ message: string }> {
  if (actor.role !== "admin") {
    throw new AppError("FORBIDDEN", {
      message: "Only admins can delete contacts.",
    });
  }

  const existing = await findContactById(id);
  if (!existing) {
    throw new AppError("NOT_FOUND", { message: "Contact not found." });
  }

  await softDeleteContact(id);
  return { message: "Contact deleted." };
}