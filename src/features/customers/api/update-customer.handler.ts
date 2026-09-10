import { NextResponse } from "next/server";
import { ok } from "@/lib/api-envelope";
import { requireSession } from "@/lib/api-guard";
import { AppError, toErrorResponse } from "@/lib/errors";
import { validationErrorFromZod } from "@/lib/validation";
import { updateCustomerInput } from "../schemas/update-customer.schema";
import { updateCustomerForUser } from "../services/update-customer.service";

export async function updateCustomerHandler(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const guard = await requireSession(request);
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

  const parsed = updateCustomerInput.safeParse(json);
  if (!parsed.success) {
    const error = validationErrorFromZod(parsed.error);
    return NextResponse.json(error.toBody(), { status: error.status });
  }

  try {
    const output = await updateCustomerForUser(id, {
      userId: guard.session.user.id,
      role: guard.session.user.role as "admin" | "staff",
    }, parsed.data);
    return NextResponse.json(
      ok({ customer: output.customer }, output.message),
      { status: output.status },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}