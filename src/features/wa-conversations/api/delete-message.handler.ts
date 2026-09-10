import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { deleteMessageForAdmin } from "../services/delete-message.service";

export async function deleteMessageHandler(
  request: Request,
  context: { params: Promise<{ id: string; messageId: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id, messageId } = await context.params;

  try {
    const output = await deleteMessageForAdmin(id, messageId);
    return NextResponse.json(ok(output, "Message deleted."));
  } catch (error) {
    return toErrorResponse(error);
  }
}