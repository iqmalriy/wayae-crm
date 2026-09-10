import { createHash } from "node:crypto";
import { AppError } from "@/lib/errors";
import { findActiveByToken } from "../../wa-heartbeat/repositories/wa-token.repository";
import { getMediaConfig } from "../config/media-config";
import type { UploadMediaInput } from "../schemas/upload-media.schema";
import {
  backfillMessageMediaId,
  insertMedia,
} from "../repositories/media.repository";
import { getMediaStorage } from "../storage/media-storage";
import type { UploadMediaOutput } from "../types/response-types";

function deriveMediaId(accountId: string, messageId: string): string {
  const hash = createHash("sha256")
    .update(`${accountId}:${messageId}`)
    .digest("hex");
  return `m_${hash.slice(0, 24)}`;
}

export async function uploadMedia(
  token: string,
  input: UploadMediaInput,
): Promise<UploadMediaOutput> {
  const account = await findActiveByToken(token);
  if (!account) throw new AppError("UNAUTHORIZED");

  const mediaId = deriveMediaId(account.id, input.messageId);
  const storageKey = `media/${account.id}/${input.messageId}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());

  const storage = getMediaStorage();
  const stored = await storage.put(buffer, storageKey, {
    mimetype: input.mimetype,
  });

  const filesize = input.filesize
    ? Number(input.filesize)
    : buffer.length;
  const storedFilesize = Number.isFinite(filesize) ? filesize : buffer.length;

  await insertMedia({
    waAccountId: account.id,
    messageId: input.messageId,
    mediaId,
    status: "stored",
    storageProvider: getMediaConfig().storage?.provider ?? "local",
    storageKey,
    mimetype: input.mimetype,
    filename: input.filename ?? null,
    filesize: storedFilesize,
  });

  await backfillMessageMediaId(account.id, input.messageId, mediaId);

  return { mediaId, url: stored.url };
}