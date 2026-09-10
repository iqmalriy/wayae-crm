import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  contactInteractions,
  contacts,
  waAccounts,
  type WaIdType,
} from "@/lib/db/schema";

export type ContactRow = typeof contacts.$inferSelect;

export async function findActiveContactByPhone(
  phoneNumber: string,
): Promise<ContactRow | null> {
  const rows = await db
    .select()
    .from(contacts)
    .where(and(isNull(contacts.deletedAt), eq(contacts.phoneNumber, phoneNumber)))
    .limit(1);
  return rows[0] ?? null;
}

export interface UpsertInboundContactValues {
  phoneNumber: string;
  waJid: string | null;
  waIdType: WaIdType;
  displayName: string;
  isBusiness: boolean;
  seenAt: Date;
  addedBy: string | null;
}

export async function findAccountOwnerId(
  waAccountId: string,
): Promise<string | null> {
  const rows = await db
    .select({ userId: waAccounts.userId })
    .from(waAccounts)
    .where(and(eq(waAccounts.id, waAccountId), isNull(waAccounts.deletedAt)))
    .limit(1);
  return rows[0]?.userId ?? null;
}

export async function insertInboundContact(
  values: UpsertInboundContactValues,
): Promise<ContactRow> {
  const [row] = await db
    .insert(contacts)
    .values({
      waJid: values.waJid,
      waIdType: values.waIdType,
      phoneNumber: values.phoneNumber,
      displayName: values.displayName,
      isBusiness: values.isBusiness,
      addedBy: values.addedBy,
      source: "inbound",
      firstSeenAt: values.seenAt,
      lastSeenAt: values.seenAt,
    })
    .returning();
  return row;
}

export async function updateContactFromWa(
  id: string,
  values: {
    seenAt: Date;
    displayName?: string;
    waJid?: string | null;
    isBusiness?: boolean;
  },
): Promise<ContactRow | null> {
  const rows = await db
    .update(contacts)
    .set({
      lastSeenAt: values.seenAt,
      ...(values.displayName !== undefined
        ? { displayName: values.displayName }
        : {}),
      ...(values.waJid !== undefined
        ? { waJid: values.waJid, waIdType: deriveWaIdType(values.waJid) }
        : {}),
      ...(values.isBusiness !== undefined
        ? { isBusiness: values.isBusiness }
        : {}),
    })
    .where(and(isNull(contacts.deletedAt), eq(contacts.id, id)))
    .returning();
  return rows[0] ?? null;
}

export async function upsertContactInteraction(
  waAccountId: string,
  contactId: string,
  savedName: string | null,
  userId: string | null,
): Promise<void> {
  await db
    .insert(contactInteractions)
    .values({
      contactId,
      waAccountId,
      userId,
      savedName,
      firstInteractionAt: new Date(),
      lastInteractionAt: new Date(),
    })
    .onConflictDoNothing({
      target: [
        contactInteractions.contactId,
        contactInteractions.waAccountId,
      ],
    });
}

export async function markAccountOffline(id: string): Promise<void> {
  await db
    .update(waAccounts)
    .set({ lastHeartbeatAt: new Date(0), updatedAt: new Date() })
    .where(and(eq(waAccounts.id, id), isNull(waAccounts.deletedAt)));
}

export function deriveWaIdType(chatId: string | null | undefined): WaIdType {
  if (!chatId) return "unknown";
  if (chatId.endsWith("@c.us")) return "c_us";
  if (chatId.endsWith("@lid")) return "lid";
  return "unknown";
}

export function normalizeWaPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const raw = phone.split("@")[0]?.trim();
  if (!raw) return null;
  return raw;
}