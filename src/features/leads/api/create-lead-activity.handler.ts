import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { createLeadActivityInput } from "../schemas/create-lead-activity.schema";
import { createLeadActivityForUser } from "../services/create-lead-activity.service";

export async function createLeadActivityHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  const { id } = await context.params;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), {
      status: 400,
    });
  }

  const parsed = createLeadActivityInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await createLeadActivityForUser(
      id,
      { userId: guard.session.user.id, role },
      parsed.data,
    );
    return NextResponse.json(ok(output), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}