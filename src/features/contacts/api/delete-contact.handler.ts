import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdmin } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { softDeleteContactForUser } from "../services/delete-contact.service";

export async function deleteContactHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await softDeleteContactForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin",
    });
    return NextResponse.json(ok({}, output.message), { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}