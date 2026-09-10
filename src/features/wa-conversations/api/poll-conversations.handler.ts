import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { pollConversations } from "../services/poll-conversations.service";

export async function pollConversationsHandler(request: Request) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const since = url.searchParams.get("since") ?? undefined;

  try {
    const output = await pollConversations(guard.session.user, since);
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}