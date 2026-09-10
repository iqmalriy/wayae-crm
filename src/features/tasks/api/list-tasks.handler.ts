import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { listTasksQuery } from "../schemas/list-tasks.schema";
import { listTasksForUser } from "../services/list-tasks.service";

export async function listTasksHandler(request: Request) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const url = new URL(request.url);
  const parsed = listTasksQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await listTasksForUser(
      { userId: guard.session.user.id, role },
      parsed.data,
    );
    return NextResponse.json(ok(output));
  } catch (error) {
    return toErrorResponse(error);
  }
}