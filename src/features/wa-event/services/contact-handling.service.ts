import {
  findActiveContactByPhone,
  insertInboundContact,
  normalizeWaPhone,
  deriveWaIdType,
  updateContactFromWa,
  upsertContactInteraction,
  type ContactRow,
} from "../repositories/wa-event.repository";
import type { WaContactPayload } from "../schemas/events.schema";

function resolveDisplayName(
  name: string | null | undefined,
  pushName: string | null | undefined,
  phone: string,
  stored: string | null | undefined,
): string {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  if (stored?.trim()) return stored;
  const trimmedPushName = pushName?.trim();
  return trimmedPushName || phone;
}

export async function handleContactFromMessage(
  waAccountId: string,
  accountOwnerId: string | null,
  contact: WaContactPayload,
  seenAt: Date,
): Promise<ContactRow | null> {
  if (contact.isMe) return null;

  const phone = normalizeWaPhone(contact.phone);
  if (!phone) return null;

  const existing = await findActiveContactByPhone(phone);

  if (existing) {
    const displayName = resolveDisplayName(
      contact.name,
      contact.pushName,
      phone,
      existing.displayName,
    );
    await updateContactFromWa(existing.id, {
      seenAt,
      displayName,
      waJid: existing.waJid ?? contact.chatId ?? null,
      isBusiness: contact.isBusiness || existing.isBusiness,
    });
    await upsertContactInteraction(
      waAccountId,
      existing.id,
      contact.name?.trim() || contact.pushName?.trim() || null,
      accountOwnerId,
    );
    return existing;
  }

  const row = await insertInboundContact({
    phoneNumber: phone,
    waJid: contact.chatId ?? null,
    waIdType: deriveWaIdType(contact.chatId),
    displayName: resolveDisplayName(contact.name, contact.pushName, phone, null),
    isBusiness: contact.isBusiness ?? false,
    seenAt,
    addedBy: accountOwnerId,
  });
  await upsertContactInteraction(
    waAccountId,
    row.id,
    contact.name?.trim() || contact.pushName?.trim() || null,
    accountOwnerId,
  );
  return row;
}