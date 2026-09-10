import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { updateLeadInput } from "../schemas/update-lead.schema";
import { updateLeadForUser } from "../services/update-lead.service";

export async function updateLeadHandler(
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

  const parsed = updateLeadInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await updateLeadForUser(
      id,
      { userId: guard.session.user.id, role },
      parsed.data,
    );
    return NextResponse.json(
      ok({ lead: output.lead }, output.message),
      { status: output.status },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}