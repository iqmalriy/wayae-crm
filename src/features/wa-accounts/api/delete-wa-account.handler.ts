import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { deleteWaAccountForAdmin } from "../services/delete-wa-account.service";

export async function deleteWaAccountHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await deleteWaAccountForAdmin(id);
    return NextResponse.json(ok(output, "WhatsApp account deleted."));
  } catch (error) {
    return toErrorResponse(error);
  }
}