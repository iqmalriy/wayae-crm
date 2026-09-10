import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { listLeadsQuery } from "../schemas/list-lead.schema";
import { listLeadsForUser } from "../services/list-lead.service";

export async function listLeadsHandler(request: Request) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = listLeadsQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await listLeadsForUser(parsed.data, {
      userId: guard.session.user.id,
      role,
    });
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}