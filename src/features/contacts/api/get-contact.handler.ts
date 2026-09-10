import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { getContactForUser } from "../services/get-contact.service";

export async function getContactHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await getContactForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    });
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}