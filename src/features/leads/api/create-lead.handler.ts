import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireAdminOrStaff } from "@/lib/api-guard";
import { toErrorResponse, AppError } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { createLeadInput } from "../schemas/create-lead.schema";
import { createLeadForUser } from "../services/create-lead.service";

export async function createLeadHandler(request: Request) {
  const guard = await requireAdminOrStaff(request);
  if (!guard.ok) return guard.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(new AppError("VALIDATION").toBody(), { status: 400 });
  }

  const parsed = createLeadInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const role = guard.session.user.role as "admin" | "staff";
    const output = await createLeadForUser(
      guard.session.user.id,
      { userId: guard.session.user.id, role },
      parsed.data,
    );
    return NextResponse.json(ok(output), { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}