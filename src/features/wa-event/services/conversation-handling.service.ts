import { db } from "@/lib/db";
import type { MessageReceivedPayload } from "../schemas/events.schema";
import { normalizeWaPhone } from "../repositories/wa-event.repository";
import { findMediaIdByMessageId } from "@/features/media/repositories/media.repository";
import {
  getOrCreateConversation,
  insertMessage,
  updateConversationContactId,
  updateConversationOnMessage,
} from "../repositories/conversation.repository";

const PREVIEW_LENGTH = 160;

const NOISE_MESSAGE_TYPES = new Set(["ciphertext", "notification_template"]);

function buildPreview(
  message: MessageReceivedPayload,
): string | null {
  const body = message.body;
  if (body) {
    const trimmed = body.trim();
    if (trimmed) {
      return trimmed.length > PREVIEW_LENGTH
        ? `${trimmed.slice(0, PREVIEW_LENGTH)}…`
        : trimmed;
    }
  }

  const media = message.media;
  if (media) {
    if (media.filename?.trim()) return media.filename.trim();
    if (media.mimetype?.startsWith("image/")) return "📷 Photo";
    if (media.mimetype?.startsWith("video/")) return "🎬 Video";
    if (media.mimetype === "application/pdf") return "📄 Document";
    return "📎 Attachment";
  }

  return null;
}

function resolveTitle(message: MessageReceivedPayload): string | null {
  const name = message.contact?.name?.trim();
  if (name) return name;
  const pushName = message.contact?.pushName?.trim();
  if (pushName) return pushName;

  const contactPhone = normalizeWaPhone(message.contact?.phone);
  if (contactPhone) return contactPhone;

  const chatPhone = normalizeWaPhone(message.chatPhone);
  if (chatPhone) return chatPhone;

  return normalizeWaPhone(message.chatId);
}

export async function handleConversationMessage(
  waAccountId: string,
  ownerId: string | null,
  message: MessageReceivedPayload,
  contactId: string | null,
): Promise<void> {
  if (NOISE_MESSAGE_TYPES.has(message.type ?? "")) return;

  const receivedAt = message.timestamp
    ? new Date(message.timestamp * 1000)
    : new Date();

  await db.transaction(async (tx) => {
    const conversation = await getOrCreateConversation(tx, {
      waAccountId,
      chatId: message.chatId ?? "",
      chatType: "chat",
      contactId,
      title: resolveTitle(message),
      ownerId,
    });

    if (contactId && conversation.contactId !== contactId) {
      await updateConversationContactId(tx, conversation.id, contactId);
    }

    const mediaId =
      message.media?.mediaId ??
      (message.id
        ? await findMediaIdByMessageId(waAccountId, message.id)
        : null);

    const inserted = await insertMessage(tx, {
      conversationId: conversation.id,
      waAccountId,
      messageId: message.id,
      ownerId,
      fromMe: message.fromMe ?? false,
      body: message.body ?? null,
      type: message.type ?? null,
      mediaId,
      mimetype: message.media?.mimetype ?? null,
      filename: message.media?.filename ?? null,
      filesize: message.media?.filesize ?? null,
      receivedAt,
    });

    if (!inserted) return;

    await updateConversationOnMessage(tx, conversation.id, {
      receivedAt,
      fromMe: message.fromMe ?? false,
      preview: buildPreview(message),
    });
  });
}