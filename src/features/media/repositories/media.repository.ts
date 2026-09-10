import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media, messages, type MediaStatus, type MediaStorageProvider } from "@/lib/db/schema";

export type MediaRow = typeof media.$inferSelect;

export async function findMediaByMediaId(
  mediaId: string,
): Promise<MediaRow | null> {
  const rows = await db
    .select()
    .from(media)
    .where(eq(media.mediaId, mediaId))
    .limit(1);
  return rows[0] ?? null;
}

export async function findMediaIdByMessageId(
  waAccountId: string,
  messageId: string,
): Promise<string | null> {
  const rows = await db
    .select({ mediaId: media.mediaId })
    .from(media)
    .where(
      and(
        eq(media.waAccountId, waAccountId),
        eq(media.messageId, messageId),
      ),
    )
    .limit(1);
  return rows[0]?.mediaId ?? null;
}

export async function backfillMessageMediaId(
  waAccountId: string,
  messageId: string,
  mediaId: string,
): Promise<void> {
  await db
    .update(messages)
    .set({ mediaId })
    .where(
      and(
        eq(messages.waAccountId, waAccountId),
        eq(messages.messageId, messageId),
      ),
    );
}

export interface InsertMediaValues {
  waAccountId: string;
  messageId: string | null;
  mediaId: string;
  status: MediaStatus;
  storageProvider: MediaStorageProvider | null;
  storageKey: string | null;
  mimetype: string | null;
  filename: string | null;
  filesize: number | null;
}

export async function insertMedia(
  values: InsertMediaValues,
): Promise<MediaRow | null> {
  const rows = await db
    .insert(media)
    .values(values)
    .onConflictDoNothing({ target: media.mediaId })
    .returning();
  return rows[0] ?? null;
}