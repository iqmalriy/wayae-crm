import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { markConversationReadForUser } from "../services/mark-conversation-read.service";

export async function markConversationReadHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await markConversationReadForUser(guard.session.user, id);
    return NextResponse.json(ok(output, "Conversation marked as read."));
  } catch (error) {
    return toErrorResponse(error);
  }
}