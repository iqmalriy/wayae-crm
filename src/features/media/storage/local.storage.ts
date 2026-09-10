import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PutResult } from "./types";

const LOCAL_MEDIA_ROOT = path.join(process.cwd(), "media");

export class LocalMediaStorage {
  async put(data: Buffer, key: string): Promise<PutResult> {
    const filePath = path.join(LOCAL_MEDIA_ROOT, key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
    return { key, url: undefined };
  }

  async get(key: string): Promise<Buffer> {
    return readFile(path.join(LOCAL_MEDIA_ROOT, key));
  }

  async delete(key: string): Promise<void> {
    await rm(path.join(LOCAL_MEDIA_ROOT, key), { force: true });
  }
}