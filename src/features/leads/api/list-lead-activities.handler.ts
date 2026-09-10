import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { listLeadActivitiesForUser } from "../services/list-lead-activities.service";

export async function listLeadActivitiesHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  try {
    const output = await listLeadActivitiesForUser(id);
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}