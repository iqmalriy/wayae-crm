import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { deleteLeadForUser } from "../services/delete-lead.service";

export async function deleteLeadHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await deleteLeadForUser(id, {
      userId: guard.session.user.id,
      role: "admin",
    });
    return NextResponse.json(ok({ deleted: output.deleted }, output.message));
  } catch (error) {
    return toErrorResponse(error);
  }
}