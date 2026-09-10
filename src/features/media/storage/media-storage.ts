import { getMediaConfig } from "../config/media-config";
import { LocalMediaStorage } from "./local.storage";
import { S3MediaStorage } from "./s3.storage";
import type { PutResult } from "./types";

export interface MediaStorage {
  put(
    data: Buffer,
    key: string,
    opts: { mimetype: string },
  ): Promise<PutResult>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

let cachedStorage: MediaStorage | undefined;

export function getMediaStorage(): MediaStorage {
  if (cachedStorage) return cachedStorage;

  const config = getMediaConfig();
  if (config.storage?.provider === "s3") {
    cachedStorage = new S3MediaStorage(config.storage.s3);
    return cachedStorage;
  }

  cachedStorage = new LocalMediaStorage();
  return cachedStorage;
}