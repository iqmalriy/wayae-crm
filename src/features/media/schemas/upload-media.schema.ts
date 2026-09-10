import { z } from "zod";

export const uploadMediaInput = z.object({
  file: z.instanceof(File, { message: "file is required" }),
  mimetype: z.string().trim().min(1, "mimetype is required"),
  messageId: z.string().trim().min(1, "messageId is required"),
  filename: z.string().trim().optional(),
  filesize: z.string().trim().optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaInput>;