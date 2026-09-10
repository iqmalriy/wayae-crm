import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { getTaskForUser } from "../services/get-task.service";

export async function getTaskHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await getTaskForUser(id, {
      userId: guard.session.user.id,
      role,
    });
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}
