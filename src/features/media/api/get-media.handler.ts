import { NextResponse } from "next/server";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { getMediaConfig } from "../config/media-config";
import { findMediaByMediaId } from "../repositories/media.repository";
import { getMediaStorage } from "../storage/media-storage";

export async function getMediaHandler(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { mediaId } = await context.params;

  if (!getMediaConfig().enabled) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const row = await findMediaByMediaId(mediaId);
    if (!row || !row.storageKey) {
      return NextResponse.json(new AppError("NOT_FOUND").toBody(), {
        status: 404,
      });
    }

    const storage = getMediaStorage();
    const bytes = await storage.get(row.storageKey);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": row.mimetype ?? "application/octet-stream",
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}