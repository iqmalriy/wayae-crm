import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { extractBearerToken } from "@/lib/require-extension-token";
import { getMediaConfig } from "../config/media-config";
import { uploadMediaInput } from "../schemas/upload-media.schema";
import { uploadMedia } from "../services/upload-media.service";

export async function uploadMediaHandler(request: Request) {
  if (!getMediaConfig().enabled) {
    return new NextResponse(null, { status: 503 });
  }

  const guard = await extractBearerToken(request);
  if (!guard.ok) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = uploadMediaInput.safeParse({
    file: form.get("file"),
    mimetype: form.get("mimetype"),
    messageId: form.get("messageId"),
    filename: form.get("filename") ?? undefined,
    filesize: form.get("filesize") ?? undefined,
  });
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await uploadMedia(guard.token, parsed.data);
    return NextResponse.json(ok(output), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}