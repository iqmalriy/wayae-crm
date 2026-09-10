import { z } from "zod";
import { MediaConfigError } from "./media-config.error";

const S3_CONFIG_FIELDS = [
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

const s3ConfigSchema = z.object({
  endpoint: z.string().min(1),
  region: z.string().min(1),
  bucket: z.string().min(1),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  publicUrl: z.string().optional(),
});

export type S3MediaConfig = z.infer<typeof s3ConfigSchema>;

export type MediaStorageConfig =
  | { provider: "local" }
  | { provider: "s3"; s3: S3MediaConfig };

export interface MediaConfig {
  enabled: boolean;
  storage: MediaStorageConfig | null;
}

function envBool(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") return fallback;
  return value.trim().toLowerCase() === "true";
}

function readS3Config(): S3MediaConfig {
  const missing = S3_CONFIG_FIELDS.filter(
    (key) => !process.env[key] || process.env[key]!.trim() === "",
  );
  if (missing.length > 0) {
    throw new MediaConfigError(
      `S3 storage enabled but missing required env vars: ${missing.join(", ")}`,
    );
  }

  const raw = {
    endpoint: process.env.S3_ENDPOINT!,
    region: process.env.S3_REGION!,
    bucket: process.env.S3_BUCKET!,
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    publicUrl: process.env.S3_PUBLIC_URL?.trim() || undefined,
  };

  const parsed = s3ConfigSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new MediaConfigError(`Invalid S3 config: ${issues}`);
  }

  return parsed.data;
}

export function loadMediaConfig(): MediaConfig {
  const enabled = envBool("MEDIA_ENABLED", false);
  if (!enabled) {
    return { enabled, storage: null };
  }

  const s3Enabled = envBool("S3_STORAGE_ENABLED", false);
  const storage: MediaStorageConfig = s3Enabled
    ? { provider: "s3", s3: readS3Config() }
    : { provider: "local" };

  return { enabled, storage };
}

let cachedConfig: MediaConfig | undefined;

export function getMediaConfig(): MediaConfig {
  if (cachedConfig === undefined) {
    cachedConfig = loadMediaConfig();
  }
  return cachedConfig;
}

export function assertMediaConfig(): MediaConfig {
  return getMediaConfig();
}