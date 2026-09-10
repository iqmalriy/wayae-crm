import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { refreshWaAccountTokenForAdmin } from "../services/refresh-wa-account-token.service";

export async function refreshWaAccountTokenHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await refreshWaAccountTokenForAdmin(id);
    return NextResponse.json(ok(output, "WhatsApp account token refreshed."));
  } catch (error) {
    return toErrorResponse(error);
  }
}