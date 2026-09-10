import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { listMessagesQuery } from "../schemas/list-messages.schema";
import { listConversationMessages } from "../services/list-messages.service";

export async function listMessagesHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  const url = new URL(request.url);
  const parsed = listMessagesQuery.safeParse(
    Object.fromEntries(url.searchParams),
  );
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await listConversationMessages(
      guard.session.user,
      id,
      parsed.data,
    );
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}