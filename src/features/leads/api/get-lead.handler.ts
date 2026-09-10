import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { getLeadForUser } from "../services/get-lead.service";

export async function getLeadHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await getLeadForUser(id, {
      userId: guard.session.user.id,
      role,
    });
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}